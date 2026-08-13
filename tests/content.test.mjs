import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("source PDF contains all 75 original scenes", () => {
  const text = execFileSync("pdftotext", ["-raw", "../Mabel 日常与旅行英语场景对话.pdf", "-"], { encoding: "utf8" });
  const scenes = [...text.matchAll(/场景\s*(\d{2})｜/g)].map((match) => Number(match[1]));
  assert.equal(scenes.length, 75);
  assert.deepEqual(scenes, Array.from({ length: 75 }, (_, index) => index + 1));
});

test("generated lesson data and Singapore unit are complete", () => {
  const original = readFileSync("app/data/original-lessons.ts", "utf8");
  const content = readFileSync("app/data/content.ts", "utf8");
  assert.equal((original.match(/"id":/g) ?? []).length, 75);
  assert.equal((content.match(/id: (7[6-9]|8[0-7]),/g) ?? []).length, 12);
  assert.match(content, /start: 76, end: 87/);
});

test("all final illustration and PWA assets exist", () => {
  const required = [
    "public/manifest.webmanifest",
    "public/sw.js",
    "public/og.png",
    "public/images/brand/adventure-map.webp",
    "public/images/brand/mabel-character-anchor.webp",
    ...Array.from({ length: 13 }, (_, index) => {
      const names = ["social", "family", "school", "friends", "shopping", "dining", "health", "transport", "airport", "hotel", "attractions", "speaking", "singapore"];
      return `public/images/units/unit-${String(index + 1).padStart(2, "0")}-${names[index]}.webp`;
    }),
  ];
  for (const path of required) assert.ok(existsSync(path), `missing ${path}`);
});
