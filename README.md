# Mabel’s English Passport

An iPad-first role-play English learning PWA made for Mabel. It turns the 75 scenes in *Mabel 日常与旅行英语场景对话.pdf* into interactive lessons and adds a 12-scene Singapore travel mission.

## What is included

- 13 illustrated learning units and 87 complete bilingual scenes
- 609 pre-generated Microsoft neural-voice clips covering every dialogue line and key expression
- Singapore English female voice for Mabel/female roles and male voice for male roles
- role selection, microphone recording and local playback
- quick response challenges and passport stamps
- iPad-responsive layout, home-screen installation and offline cache
- device-local progress only; no account and no recording upload

## Local development

Requires Node.js 22.13 or newer and Poppler (`pdftotext`) when regenerating the original lesson data.

```bash
npm install
npm run content:extract
npm run audio:generate
npm test
npm run dev
```

Production validation:

```bash
npm run lint
npm run build
npm run build:static
npm start
```

The main deployment uses OpenAI Sites. A second fully static build is published with GitHub Pages so families can switch networks/CDNs if one route is unavailable.

## Content ownership

The source PDF and the generated illustrations are personal learning materials for Mabel. The original PDF remains one directory above this project and is intentionally not committed into the application repository.
