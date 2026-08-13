import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "static-site");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(resolve(outputRoot, "assets"), { recursive: true });
await cp(resolve(projectRoot, "public"), outputRoot, { recursive: true });

await build({
  entryPoints: [resolve(projectRoot, "app/static-entry.tsx")],
  outfile: resolve(outputRoot, "assets/app.js"),
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});

const sourceCss = await readFile(resolve(projectRoot, "app/globals.css"), "utf8");
const compiledCss = await postcss([tailwindcss()]).process(sourceCss, {
  from: resolve(projectRoot, "app/globals.css"),
  to: resolve(outputRoot, "assets/app.css"),
});
await writeFile(resolve(outputRoot, "assets/app.css"), compiledCss.css);
const html = `<!doctype html>
<html lang="zh-CN" data-asset-base=".">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#167f83" />
    <meta name="description" content="Mabel 的儿童日常与新加坡旅行英语角色对话学习程序" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="stylesheet" href="./assets/app.css" />
    <title>Mabel’s English Passport｜儿童场景英语</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./assets/app.js"></script>
  </body>
</html>
`;
await writeFile(resolve(outputRoot, "index.html"), html);
await writeFile(resolve(outputRoot, ".nojekyll"), "");

for (const filename of ["manifest.webmanifest", "sw.js"]) {
  const path = resolve(outputRoot, filename);
  const value = await readFile(path, "utf8");
  await writeFile(path, value.replaceAll('"/', '"./').replaceAll("'/", "'./"));
}

console.log(`Static site written to ${outputRoot}`);
