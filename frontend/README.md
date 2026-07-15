# SachAI Frontend

Next.js (App Router) + Tailwind CSS. Every verification action calls the real
backend API — there is no mock or randomized result anywhere in this app.

See the root `../README.md` for full setup and deployment instructions (Vercel).

## Local run

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```
