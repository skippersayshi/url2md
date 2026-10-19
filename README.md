# URL2MD

Simpele, functionele webapp om websites te scrapen en video-transcripts te genereren als schone Markdown.

## Features

- URL invoer met auto-detect (website vs YouTube)
- Volledigheid: Alles / Main content / AI-gefilterd
- Filters: tekst, links, metadata, tabellen, afbeeldingen, code, headers
- Download .md, kopieer, mailto
- Optionele API-keys (Jina, Grok, Gemini) — lokaal opgeslagen
- Preview (rendered + raw)
- Local history

## Tech

- Next.js App Router
- Jina Reader voor website → Markdown
- youtube-transcript library voor YouTube
- Gemini fallback voor video’s
- AI-polish via Grok of Gemini

## Setup

```bash
npm install
npm run dev
```

## Deploy

Vercel (automatisch via Git).

## Disclaimer

Gebruiker is verantwoordelijk voor ToS en robots.txt. Zie /terms.
