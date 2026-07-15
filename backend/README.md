# SachAI Backend

Node.js + Express API implementing real AI-backed verification for photos,
videos, screenshots, messages, links, phone numbers, and news claims.

See the root `../README.md` for full setup, API key sources, and deployment
instructions (Render).

## Folder structure

```
src/
├── config/        # env + logger
├── middleware/     # rate limiting, error handling, uploads
├── services/       # aiGateway (provider fallback chain), cloudinary,
│                    # cache, url-security, exif metadata, video oEmbed,
│                    # RapidAPI wrapper
├── prompts/        # per-category Hindi system prompts (strict JSON contract)
├── controllers/     # one per verification category
├── routes/         # /api/verify/* routes
└── utils/          # response schema normalizer, envelope builder
```

## Local run

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev
```
