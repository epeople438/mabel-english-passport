"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLesson,
  getUnit,
  lessons,
  lessonsForUnit,
  speakerZh,
  units,
  type Lesson,
} from "./data/content";

type Screen =
  | { name: "home" }
  | { name: "unit"; unitId: number }
  | { name: "lesson"; lessonId: number };

const storageKey = "mabel-english-progress-v1";
const lastLessonKey = "mabel-english-last-lesson";

function assetPath(path: string) {
  if (typeof document !== "undefined" && document.documentElement.dataset.assetBase === ".") return `.${path}`;
  return path;
}

function screenFromHash(): Screen {
  if (typeof window === "undefined") return { name: "home" };
  const [kind, rawId] = window.location.hash.replace(/^#\/?/, "").split("/");
  const id = Number(rawId);
  if (kind === "unit" && units.some((unit) => unit.id === id)) return { name: "unit", unitId: id };
  if (kind === "lesson" && lessons.some((lesson) => lesson.id === id)) return { name: "lesson", lessonId: id };
  return { name: "home" };
}

function navigate(path: string) {
  window.location.hash = path;
}

let activeAudio: HTMLAudioElement | null = null;

function stopSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function speakWithSystemVoice(text: string, onEnd?: () => void, slow = false, preferFemale = true) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const genderHints = preferFemale
    ? ["samantha", "karen", "moira", "tessa", "serena", "ava", "luna"]
    : ["daniel", "arthur", "oliver", "aaron", "andrew", "wayne"];
  utterance.voice =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-") && genderHints.some((hint) => voice.name.toLowerCase().includes(hint))) ??
    voices.find((voice) => voice.lang.toLowerCase() === "en-sg") ??
    voices.find((voice) => voice.lang.toLowerCase() === "en-gb") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-")) ??
    null;
  utterance.lang = utterance.voice?.lang ?? "en-SG";
  utterance.rate = slow ? 0.68 : 0.84;
  utterance.pitch = 1.04;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function speakMicrosoftClip(
  lessonId: number,
  lineIndex: number,
  text: string,
  onEnd?: () => void,
  slow = false,
  preferFemale = true,
) {
  if (typeof window === "undefined") {
    onEnd?.();
    return;
  }
  stopSpeech();
  const src = assetPath(`/audio/${String(lessonId).padStart(2, "0")}/${lineIndex + 1}.mp3`);
  const audio = new Audio(src);
  activeAudio = audio;
  audio.preload = "auto";
  audio.playbackRate = slow ? 0.76 : 1;
  const finish = () => {
    if (activeAudio === audio) activeAudio = null;
    onEnd?.();
  };
  audio.onended = finish;
  audio.onerror = () => {
    if (activeAudio === audio) activeAudio = null;
    speakWithSystemVoice(text, onEnd, slow, preferFemale);
  };
  audio.play().catch(() => {
    if (activeAudio === audio) activeAudio = null;
    speakWithSystemVoice(text, onEnd, slow, preferFemale);
  });
}

function speakMicrosoftExpression(lessonId: number, expressionIndex: number, text: string) {
  if (typeof window === "undefined") return;
  stopSpeech();
  const src = assetPath(`/audio/expressions/${String(lessonId).padStart(2, "0")}/${expressionIndex + 1}.mp3`);
  const audio = new Audio(src);
  activeAudio = audio;
  audio.onended = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  audio.onerror = () => speakWithSystemVoice(text);
  audio.play().catch(() => speakWithSystemVoice(text));
}

function useProgress() {
  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as number[];
      return new Set(stored.filter((id) => Number.isInteger(id)));
    } catch {
      return new Set();
    }
  });

  const complete = useCallback((lessonId: number) => {
    setCompleted((current) => {
      const next = new Set(current);
      next.add(lessonId);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { completed, complete };
}

function TopBar({ screen, onInstall }: { screen: Screen; onInstall: () => void }) {
  const title =
    screen.name === "home"
      ? "Mabel’s English Passport"
      : screen.name === "unit"
        ? getUnit(screen.unitId).titleZh
        : getLesson(screen.lessonId).title;

  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => navigate("")} aria-label="回到冒险地图">
        <span className="brand-mark">M</span>
        <span className="brand-copy">
          <strong>{title}</strong>
          <small>英语冒险护照</small>
        </span>
      </button>
      <div className="topbar-actions">
        <span className="local-badge"><span className="status-dot" /> 进度只保存在这台 iPad</span>
        <button className="soft-button" onClick={onInstall}>添加到主屏幕</button>
      </div>
    </header>
  );
}

function InstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <button className="modal-dismiss" aria-label="关闭添加到主屏幕说明" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="添加到主屏幕">
        <span className="sheet-icon">↗</span>
        <h2>把英语护照放到 iPad 桌面</h2>
        <p>在 Safari 中点击“分享”，然后选择“添加到主屏幕”。以后可以像打开 App 一样开始练习。</p>
        <button className="primary-button full" onClick={onClose}>我知道了</button>
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="progress-ring" style={{ "--progress": `${Math.max(0, Math.min(100, value))}%` } as React.CSSProperties}>
      <strong>{Math.round(value)}%</strong>
      <span>已完成</span>
    </div>
  );
}

function HomeScreen({ completed }: { completed: Set<number> }) {
  const percent = (completed.size / lessons.length) * 100;
  const lastLesson = typeof window === "undefined" ? 1 : Number(localStorage.getItem(lastLessonKey) ?? 1);
  const continueLesson = lessons.find((lesson) => lesson.id === lastLesson) ?? lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[0];
  const singaporeDone = lessonsForUnit(13).filter((lesson) => completed.has(lesson.id)).length;

  return (
    <main className="page-shell">
      <section className="map-hero">
        <img src={assetPath("/images/brand/adventure-map.webp")} alt="从日常生活出发前往新加坡的英语冒险地图" />
        <div className="map-copy">
          <span className="eyebrow">87 个真实对话任务</span>
          <h1>今天，Mabel 想去哪里开口说英语？</h1>
          <p>从家、学校和餐厅一路练到机场与新加坡。选择角色，听一句，说一句。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate(`lesson/${continueLesson.id}`)}>
              继续第 {continueLesson.id} 关
            </button>
            <button className="secondary-button" onClick={() => navigate("unit/13")}>新加坡旅行任务</button>
          </div>
        </div>
        <ProgressRing value={percent} />
      </section>

      <section className="today-strip" aria-label="今日学习建议">
        <div><span>今日建议</span><strong>先听完整对话，再演 Mabel</strong></div>
        <div><span>护照印章</span><strong>{completed.size} / {lessons.length}</strong></div>
        <div><span>新加坡任务</span><strong>{singaporeDone} / 12</strong></div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">冒险路线</span>
          <h2>13 个主题学习岛</h2>
        </div>
        <p>每关约 5–8 分钟，完成后获得一枚专属印章。</p>
      </section>

      <div className="unit-grid">
        {units.map((unit) => {
          const unitLessons = lessonsForUnit(unit.id);
          const done = unitLessons.filter((lesson) => completed.has(lesson.id)).length;
          return (
            <button
              key={unit.id}
              className={`unit-card ${unit.singapore ? "singapore-card" : ""}`}
              onClick={() => navigate(`unit/${unit.id}`)}
              style={{ "--accent": unit.accent } as React.CSSProperties}
            >
              <img src={assetPath(unit.image)} alt="" />
              <div className="unit-card-overlay" />
              <span className="unit-index">{String(unit.id).padStart(2, "0")}</span>
              <span className="unit-icon">{unit.icon}</span>
              {unit.singapore && <span className="special-ribbon">旅行前必练</span>}
              <div className="unit-card-copy">
                <small>{unit.titleEn}</small>
                <h3>{unit.titleZh}</h3>
                <p>{unit.kicker}</p>
                <span className="card-progress"><i style={{ width: `${(done / unitLessons.length) * 100}%` }} /></span>
                <b>{done} / {unitLessons.length} 关</b>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function UnitScreen({ unitId, completed }: { unitId: number; completed: Set<number> }) {
  const unit = getUnit(unitId);
  const unitLessons = lessonsForUnit(unitId);
  const done = unitLessons.filter((lesson) => completed.has(lesson.id)).length;

  return (
    <main className="page-shell">
      <button className="back-button" onClick={() => navigate("")}>← 返回冒险地图</button>
      <section className="unit-hero" style={{ "--accent": unit.accent } as React.CSSProperties}>
        <img src={assetPath(unit.image)} alt={`${unit.titleZh}章节插画`} />
        <div className="unit-hero-copy">
          <span className="eyebrow">Unit {String(unit.id).padStart(2, "0")} · {unit.titleEn}</span>
          <h1>{unit.titleZh}</h1>
          <p>{unit.kicker}</p>
          {unit.singapore && <p className="mission-note">专为即将到来的新加坡旅行设计：机场、MRT、小贩中心、景点与热带天气全部覆盖。</p>}
          <div className="unit-meta">
            <span>{unitLessons.length} 个场景</span>
            <span>{done} 枚印章</span>
            <span>角色对话模式</span>
          </div>
          <button className="primary-button" onClick={() => navigate(`lesson/${unitLessons.find((lesson) => !completed.has(lesson.id))?.id ?? unitLessons[0].id}`)}>
            {done ? "继续这个单元" : "开始第一个场景"}
          </button>
        </div>
      </section>

      <section className="section-heading compact">
        <div><span className="eyebrow">场景关卡</span><h2>选一个任务开始</h2></div>
        <p>带 ✓ 的关卡已经完成，随时可以回来重演。</p>
      </section>

      <div className="lesson-grid">
        {unitLessons.map((lesson, index) => (
          <button key={lesson.id} className={`lesson-card ${completed.has(lesson.id) ? "done" : ""}`} onClick={() => navigate(`lesson/${lesson.id}`)}>
            <span className="lesson-number">{completed.has(lesson.id) ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <div>
              <small>场景 {lesson.id}</small>
              <h3>{lesson.title}</h3>
              <p>{lesson.mission ?? lesson.expressions[0]}</p>
            </div>
            <span className="lesson-arrow">→</span>
          </button>
        ))}
      </div>
    </main>
  );
}

function quizOptionsFor(lesson: Lesson) {
  const correct = lesson.dialogue[1]?.en ?? lesson.dialogue[0].en;
  const pool = [
    ...lesson.dialogue.slice(2).map((line) => line.en),
    ...lessons.filter((item) => item.unitId === lesson.unitId && item.id !== lesson.id).flatMap((item) => item.dialogue.slice(0, 1).map((line) => line.en)),
  ].filter((value) => value !== correct);
  const unique = [...new Set(pool)].slice(0, 2);
  return [correct, ...unique].sort((a, b) => ((a.length + lesson.id) % 7) - ((b.length + lesson.id) % 7));
}

function LessonScreen({ lessonId, completed, onComplete }: { lessonId: number; completed: Set<number>; onComplete: (id: number) => void }) {
  const lesson = getLesson(lessonId);
  const unit = getUnit(lesson.unitId);
  const [activeLine, setActiveLine] = useState(0);
  const [showChinese, setShowChinese] = useState(true);
  const [mode, setMode] = useState<"listen" | "role">("listen");
  const speakers = [...new Set(lesson.dialogue.map((line) => line.speaker))];
  const [role, setRole] = useState(speakers.includes("Mabel") ? "Mabel" : speakers[0]);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordMessage, setRecordMessage] = useState("录下来，再听听自己的声音");
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [showStamp, setShowStamp] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const line = lesson.dialogue[activeLine];
  const quizOptions = quizOptionsFor(lesson);
  const quizCorrect = quizChoice === (lesson.dialogue[1]?.en ?? lesson.dialogue[0].en);

  useEffect(() => {
    localStorage.setItem(lastLessonKey, String(lessonId));
    stopSpeech();
    return () => {
      stopSpeech();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [lessonId]);

  const isFemaleSpeaker = (speaker: string) =>
    ["Mabel", "Emma", "Mum", "Teacher", "Cashier", "Pharmacist", "Local"].includes(speaker);

  const playLine = (index = activeLine, slow = false, onEnd?: () => void) => {
    setActiveLine(index);
    setPlaying(true);
    speakMicrosoftClip(lesson.id, index, lesson.dialogue[index].en, () => {
      setPlaying(false);
      onEnd?.();
    }, slow, isFemaleSpeaker(lesson.dialogue[index].speaker));
  };

  const playAll = () => {
    const playAt = (index: number) => {
      if (index >= lesson.dialogue.length) {
        setPlaying(false);
        return;
      }
      setActiveLine(index);
      setPlaying(true);
      speakMicrosoftClip(
        lesson.id,
        index,
        lesson.dialogue[index].en,
        () => window.setTimeout(() => playAt(index + 1), 180),
        false,
        isFemaleSpeaker(lesson.dialogue[index].speaker),
      );
    };
    stopSpeech();
    playAt(0);
  };

  async function startRecording() {
    if (!("MediaRecorder" in window) || !navigator.mediaDevices?.getUserMedia) {
      setRecordMessage("这个浏览器暂不支持录音，请使用 iPad Safari。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/mp4" }));
        setRecordingUrl(url);
        setRecordMessage("录好了！先回听，再试一次也可以。");
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
      setRecordMessage("正在录音…说完后点一下停止");
    } catch {
      setRecordMessage("没有获得麦克风权限。请在 Safari 设置中允许后再试。");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function finishLesson() {
    onComplete(lesson.id);
    setShowStamp(true);
    window.setTimeout(() => setShowStamp(false), 2200);
  }

  const selectedRoleLine = mode === "role" && line.speaker === role;
  const nextLesson = lessons.find((item) => item.id === lesson.id + 1);

  return (
    <main className="lesson-page" style={{ "--accent": unit.accent } as React.CSSProperties}>
      <div className="lesson-toolbar">
        <button className="back-button" onClick={() => navigate(`unit/${unit.id}`)}>← {unit.titleZh}</button>
        <div className="lesson-counter"><span>场景 {lesson.id}</span><b>{activeLine + 1} / {lesson.dialogue.length} 句</b></div>
        <button className={`toggle-button ${showChinese ? "active" : ""}`} onClick={() => setShowChinese((value) => !value)}>{showChinese ? "中英对照" : "只看英文"}</button>
      </div>

      <section className="role-stage">
        <div className="scene-panel">
          <img src={assetPath(unit.image)} alt={`${lesson.title}场景插画`} />
          <div className="scene-shade" />
          <div className="scene-title">
            <span>{unit.icon} Unit {unit.id}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.mission ?? "先听懂场景，再选择一个角色开口表演。"}</p>
          </div>
          <div className="speaker-pills">
            {speakers.map((speaker) => <span key={speaker} className={line.speaker === speaker ? "speaking" : ""}>{speakerZh[speaker] ?? speaker}</span>)}
          </div>
        </div>

        <div className="dialogue-workspace">
          <div className="mode-tabs" role="tablist" aria-label="练习模式">
            <button className={mode === "listen" ? "active" : ""} onClick={() => setMode("listen")}>① 听懂对话</button>
            <button className={mode === "role" ? "active" : ""} onClick={() => setMode("role")}>② 角色表演</button>
          </div>

          <div className="voice-note" role="status">
            <span>♫ 微软自然语音</span>
            <b>女声 · Mabel</b>
            <i aria-hidden="true">＋</i>
            <b>男/女声 · 对话伙伴</b>
          </div>

          {mode === "role" && (
            <div className="role-picker">
              <span>我要演：</span>
              {speakers.map((speaker) => (
                <button key={speaker} className={role === speaker ? "selected" : ""} onClick={() => setRole(speaker)}>
                  {speakerZh[speaker] ?? speaker}
                </button>
              ))}
            </div>
          )}

          <article className={`speech-card ${selectedRoleLine ? "my-turn" : ""}`}>
            <header>
              <span className="speaker-avatar">{line.speaker === "Mabel" ? "M" : (speakerZh[line.speaker] ?? line.speaker).slice(0, 1)}</span>
              <div><small>{selectedRoleLine ? "轮到你说" : "正在说话"}</small><strong>{speakerZh[line.speaker] ?? line.speaker}</strong></div>
              <button className="sound-button" onClick={() => playLine(activeLine)} aria-label="播放当前英文">{playing ? "■" : "▶"}</button>
            </header>
            <p className="english-line">{line.en}</p>
            {showChinese && <p className="chinese-line">{line.zh}</p>}
            <div className="speech-actions">
              <button className="mini-button" onClick={() => playLine(activeLine, true)}>慢速听</button>
              <button className="mini-button" onClick={() => playLine(activeLine)}>正常听</button>
            </div>
          </article>

          {selectedRoleLine ? (
            <div className="record-panel">
              <div><strong>看着英文，把这一句说出来</strong><span>{recordMessage}</span></div>
              <button className={`record-button ${recording ? "recording" : ""}`} onClick={recording ? stopRecording : startRecording}>{recording ? "■ 停止" : "● 开始录音"}</button>
              {/* The audio is Mabel's own just-recorded speech; no separate caption track exists. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              {recordingUrl && <audio controls src={recordingUrl} aria-label="回听录音" />}
            </div>
          ) : mode === "role" ? (
            <button className="partner-button" onClick={() => playLine(activeLine)}>{playing ? "正在播放…" : `播放${speakerZh[line.speaker] ?? line.speaker}的台词`}</button>
          ) : (
            <button className="partner-button" onClick={playAll}>{playing ? "正在播放完整对话…" : "▶ 从头听完整对话"}</button>
          )}

          <nav className="line-nav" aria-label="上一句和下一句">
            <button disabled={activeLine === 0} onClick={() => setActiveLine((value) => Math.max(0, value - 1))}>← 上一句</button>
            <div>{lesson.dialogue.map((_, index) => <button key={index} className={index === activeLine ? "active" : ""} onClick={() => setActiveLine(index)} aria-label={`第 ${index + 1} 句`} />)}</div>
            <button disabled={activeLine === lesson.dialogue.length - 1} onClick={() => setActiveLine((value) => Math.min(lesson.dialogue.length - 1, value + 1))}>下一句 →</button>
          </nav>
        </div>
      </section>

      <section className="practice-section">
        <div className="expression-card">
          <span className="eyebrow">重点表达</span>
          <h2>把这两句装进旅行口袋</h2>
          {lesson.expressions.map((expression, expressionIndex) => {
            const english = expression.split(/[\u3400-\u9fff]/)[0].trim();
            return <button key={expression} onClick={() => speakMicrosoftExpression(lesson.id, expressionIndex, english)}><span>▶</span>{expression}</button>;
          })}
        </div>

        <div className="quiz-card">
          <span className="eyebrow">快速挑战</span>
          <h2>听到这句，该怎么回应？</h2>
          <button className="quiz-prompt" onClick={() => speakMicrosoftClip(lesson.id, 0, lesson.dialogue[0].en, undefined, false, isFemaleSpeaker(lesson.dialogue[0].speaker))}>▶ {lesson.dialogue[0].en}</button>
          <div className="quiz-options">
            {quizOptions.map((option) => (
              <button key={option} className={quizChoice === option ? (quizCorrect ? "correct" : "wrong") : ""} onClick={() => setQuizChoice(option)}>{option}</button>
            ))}
          </div>
          {quizChoice && <p className={quizCorrect ? "quiz-good" : "quiz-try"}>{quizCorrect ? "答对了！这个回应很自然。" : "再听一次开头，换一个答案试试。"}</p>}
        </div>
      </section>

      <section className="complete-bar">
        <div>
          <span>{completed.has(lesson.id) ? "✓ 已获得印章" : "完成听、说和回应挑战"}</span>
          <strong>{completed.has(lesson.id) ? "这关可以随时回来重演" : "准备好就盖下今天的印章"}</strong>
        </div>
        <button className="primary-button" disabled={!quizCorrect && !completed.has(lesson.id)} onClick={finishLesson}>{completed.has(lesson.id) ? "再次完成" : "完成本关"}</button>
        {nextLesson && <button className="secondary-button" onClick={() => navigate(`lesson/${nextLesson.id}`)}>下一关 →</button>}
      </section>

      {showStamp && (
        <div className="stamp-celebration" role="status">
          <div className="stamp"><span>{unit.icon}</span><strong>场景 {lesson.id}</strong><small>MISSION COMPLETE</small></div>
          <p>太棒了，Mabel！护照上又多了一枚印章。</p>
        </div>
      )}
    </main>
  );
}

export default function LearningApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [installOpen, setInstallOpen] = useState(false);
  const { completed, complete } = useProgress();

  useEffect(() => {
    const update = () => setScreen(screenFromHash());
    update();
    window.addEventListener("hashchange", update);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(assetPath("/sw.js")).catch(() => undefined);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <>
      <TopBar screen={screen} onInstall={() => setInstallOpen(true)} />
      {screen.name === "home" && <HomeScreen completed={completed} />}
      {screen.name === "unit" && <UnitScreen unitId={screen.unitId} completed={completed} />}
      {screen.name === "lesson" && <LessonScreen key={screen.lessonId} lessonId={screen.lessonId} completed={completed} onComplete={complete} />}
      {installOpen && <InstallSheet onClose={() => setInstallOpen(false)} />}
    </>
  );
}
