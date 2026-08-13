import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const pdfPath = resolve(projectRoot, "..", "Mabel 日常与旅行英语场景对话.pdf");
const raw = execFileSync("pdftotext", ["-raw", pdfPath, "-"], {
  encoding: "utf8",
  maxBuffer: 5_000_000,
});

const speakerNames = [
  "Receptionist",
  "Shop Assistant",
  "Pharmacist",
  "Passenger",
  "Assistant",
  "Attendant",
  "Cashier",
  "Teacher",
  "Stranger",
  "Officer",
  "Doctor",
  "Driver",
  "Server",
  "Staff",
  "Local",
  "Mabel",
  "Emma",
  "Mum",
  "Dad",
];

const hasHan = (value) => /[\u3400-\u9fff]/.test(value);
const clean = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

const pages = raw
  .replace(/Receptionis\s*\n\s*t/g, "Receptionist")
  .split("\f")
  .map((page) => page.trim())
  .filter(Boolean);

const lessons = [];

for (const page of pages) {
  const header = page.match(/场景\s*(\d{2})｜([^\n]+)/);
  if (!header) continue;

  const id = Number(header[1]);
  const title = clean(header[2]);
  const afterHeader = page.slice((header.index ?? 0) + header[0].length);
  const [dialogueSource, expressionAndMore = ""] = afterHeader.split("重点表达");
  const [expressionSource = ""] = expressionAndMore.split("口语挑战");
  const lines = dialogueSource
    .split("\n")
    .map((line) => clean(line))
    .filter((line) => line && !/^\d+$/.test(line) && !line.includes("MABEL ·"));

  const dialogue = [];
  let current = null;
  for (const line of lines) {
    const speaker = speakerNames.find(
      (candidate) => line === candidate || line.startsWith(`${candidate} `),
    );
    if (speaker) {
      if (current) dialogue.push(current);
      const remainder = clean(line.slice(speaker.length));
      current = { speaker, zh: hasHan(remainder) ? remainder : "", en: "" };
      continue;
    }
    if (!current) continue;
    if (hasHan(line) && !current.en) current.zh = clean(`${current.zh} ${line}`);
    else current.en = clean(`${current.en} ${line}`);
  }
  if (current) dialogue.push(current);

  const expressionLines = expressionSource
    .split("\n")
    .map((line) => clean(line))
    .filter((line) => line && !/^\d+$/.test(line) && !line.includes("MABEL ·"));
  const expressions = [];
  let expression = "";
  for (const line of expressionLines) {
    if (line.startsWith("•")) {
      if (expression) expressions.push(clean(expression));
      expression = clean(line.slice(1));
    } else if (expression) {
      expression = clean(`${expression} ${line}`);
    }
  }
  if (expression) expressions.push(clean(expression));

  lessons.push({ id, title, dialogue, expressions: expressions.slice(0, 2) });
}

if (lessons.length !== 75) {
  throw new Error(`Expected 75 lessons, found ${lessons.length}`);
}

for (const lesson of lessons) {
  if (lesson.dialogue.length < 4 || lesson.dialogue.some((line) => !line.zh || !line.en)) {
    throw new Error(`Incomplete dialogue in lesson ${lesson.id}: ${JSON.stringify(lesson)}`);
  }
}

const output = `// Generated from the source PDF by scripts/extract-lessons.mjs.\n` +
  `// Do not hand-edit the original 75 lessons; rerun the extractor instead.\n` +
  `export const originalLessons = ${JSON.stringify(lessons, null, 2)} as const;\n`;

writeFileSync(resolve(projectRoot, "app", "data", "original-lessons.ts"), output);
console.log(`Extracted ${lessons.length} complete lessons.`);
