import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const originalSource = await readFile(resolve(projectRoot, "app/data/original-lessons.ts"), "utf8");
const contentSource = await readFile(resolve(projectRoot, "app/data/content.ts"), "utf8");

const originalMatch = originalSource.match(/export const originalLessons = ([\s\S]+) as const;/);
if (!originalMatch) throw new Error("Could not parse original lesson data.");
const originalLessons = JSON.parse(originalMatch[1]);

const singaporeBlock = contentSource.match(/const singaporeLessons:[\s\S]+?= \[([\s\S]+?)\n\];\n\nconst unitForLesson/);
if (!singaporeBlock) throw new Error("Could not parse Singapore lesson data.");

const singaporeLessons = [...singaporeBlock[1].matchAll(/\n {2}\{\n {4}id: (\d+),[\s\S]+?dialogue: \[([\s\S]+?)\n {4}\],\n {4}expressions: \[([^\]]+)\]/g)].map((lessonMatch) => ({
  id: Number(lessonMatch[1]),
  dialogue: [...lessonMatch[2].matchAll(/\{ speaker: "([^"]+)", zh: "[^"]*", en: "([^"]+)" \}/g)].map((lineMatch) => ({
    speaker: lineMatch[1],
    en: lineMatch[2],
  })),
  expressions: [...lessonMatch[3].matchAll(/"([^"]+)"/g)].map((expressionMatch) => expressionMatch[1]),
}));

const lessons = [...originalLessons, ...singaporeLessons];
if (lessons.length !== 87) throw new Error(`Expected 87 lessons, found ${lessons.length}.`);

const femaleSpeakers = new Set(["Mabel", "Emma", "Mum", "Teacher", "Cashier", "Pharmacist", "Local"]);
const voiceFor = (speaker) => femaleSpeakers.has(speaker) ? "en-SG-LunaNeural" : "en-SG-WayneNeural";
const dialogueJobs = lessons.flatMap((lesson) => lesson.dialogue.map((line, index) => ({
  kind: "dialogue",
  lessonId: lesson.id,
  lineIndex: index,
  speaker: line.speaker,
  text: line.en,
  voice: voiceFor(line.speaker),
  output: resolve(projectRoot, "public/audio", String(lesson.id).padStart(2, "0"), `${index + 1}.mp3`),
})));
const expressionJobs = lessons.flatMap((lesson) => lesson.expressions.map((expression, index) => ({
  kind: "expression",
  lessonId: lesson.id,
  lineIndex: index,
  speaker: "Mabel",
  text: expression.split(/[\u3400-\u9fff]/)[0].trim(),
  voice: "en-SG-LunaNeural",
  output: resolve(projectRoot, "public/audio/expressions", String(lesson.id).padStart(2, "0"), `${index + 1}.mp3`),
})));
const jobs = [...dialogueJobs, ...expressionJobs];

let cursor = 0;
let completed = 0;
const workerCount = Math.min(10, Math.max(4, cpus().length));

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    await mkdir(dirname(job.output), { recursive: true });
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await access(job.output);
        lastError = undefined;
        break;
      } catch {
        // Generate the clip below when it is not already present.
      }
      try {
        await execFileAsync("edge-tts", [
          "--voice", job.voice,
          "--rate=-5%",
          "--pitch=+0Hz",
          "--text", job.text,
          "--write-media", job.output,
        ], { maxBuffer: 2_000_000 });
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
        await new Promise((done) => setTimeout(done, 500 * attempt));
      }
    }
    if (lastError) throw lastError;
    completed++;
    if (completed % 50 === 0 || completed === jobs.length) console.log(`Generated ${completed}/${jobs.length}`);
  }
}

await Promise.all(Array.from({ length: workerCount }, worker));

const manifest = Object.fromEntries(jobs.map((job) => [
  `${job.kind}-${job.lessonId}-${job.lineIndex}`,
  {
    src: `/audio/${String(job.lessonId).padStart(2, "0")}/${job.lineIndex + 1}.mp3`,
    voice: job.voice,
    gender: femaleSpeakers.has(job.speaker) ? "female" : "male",
  },
]));

await writeFile(resolve(projectRoot, "public/audio/manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Finished ${jobs.length} Microsoft neural-voice clips.`);
