# 🛡️ SachAI 2.0

भारत का AI आधारित डिजिटल सत्यापन प्लेटफ़ॉर्म — Production-ready codebase.

## ⚠️ ज़रूरी बात (पढ़ें)

यह कोड **Mock/Random नहीं है** — हर endpoint वास्तव में AI API या वास्तविक तकनीकी जांच
(HTTPS/SSL/EXIF/WHOIS/oEmbed) को कॉल करता है। लेकिन इसे चलाने के लिए आपको **अपनी खुद की
API keys** डालनी होंगी (नीचे देखें) — बिना keys के सर्वर ईमानदारी से
`ALL_PROVIDERS_FAILED` त्रुटि देगा, कभी भी फर्जी परिणाम नहीं दिखाएगा।

यह प्रोजेक्ट दो हिस्सों में है:

```
sachai/
├── backend/   → Node.js + Express API (Render पर deploy करें)
└── frontend/  → Next.js + Tailwind website (Vercel पर deploy करें)
```

---

## 1. Backend सेटअप

```bash
cd backend
npm install
cp .env.example .env
# अब .env खोलें और अपनी keys भरें (नीचे "API Keys कहाँ से लें" देखें)
npm run dev      # local development (nodemon)
# या
npm start        # production
```

Backend `http://localhost:8080` पर चलेगा। स्वास्थ्य जांच: `GET /api/health`

### उपलब्ध Endpoints
| Method | Path | Body |
|---|---|---|
| POST | `/api/verify/photo` | `multipart/form-data` field `file` |
| POST | `/api/verify/screenshot` | `multipart/form-data` field `file` |
| POST | `/api/verify/video` | `{ "url": "..." }` |
| POST | `/api/verify/message` | `{ "message": "..." }` |
| POST | `/api/verify/link` | `{ "url": "..." }` |
| POST | `/api/verify/phone` | `{ "phone": "+91..." }` |
| POST | `/api/verify/news` | `{ "claim": "..." }` |

## 2. Frontend सेटअप

```bash
cd frontend
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL को अपने backend URL पर सेट करें
npm run dev
```

`http://localhost:3000` पर खोलें।

---

## 🔑 API Keys कहाँ से लें (कम से कम एक ज़रूर डालें)

सिस्टम इसी क्रम में प्रयास करता है — एक विफल हो तो अगला अपने आप आज़माया जाता है:

1. **OpenRouter** — https://openrouter.ai/keys
2. **Gemini (Google AI Studio)** — https://aistudio.google.com/apikey
3. **Groq** — https://console.groq.com/keys (नोट: Groq समय-समय पर पुराने मॉडल बंद करता
   है — चलाने से पहले https://console.groq.com/docs/models पर वर्तमान मॉडल ID जांच लें)
4. **Hugging Face** — https://huggingface.co/settings/tokens

अतिरिक्त सेवाएँ:
- **Cloudinary** (फोटो/स्क्रीनशॉट स्टोरेज) — https://cloudinary.com/console
- **RapidAPI** (फ़ोन नंबर स्पैम-चेक और WHOIS) — https://rapidapi.com — यह एक marketplace है,
  आपको किसी specific phone-validator/WHOIS API को subscribe करके उसका host + endpoint
  path `.env` में डालना होगा। बिना इसके फ़ोन/WHOIS जांच ईमानदारी से "स्पष्ट नहीं" दिखाएगी।

## 🚀 Deployment

- **Frontend → Vercel**: repo import करें, root directory `frontend` सेट करें,
  environment variable `NEXT_PUBLIC_API_URL` जोड़ें।
- **Backend → Render**: Web Service बनाएं, root directory `backend`, build command
  `npm install`, start command `npm start`, और सभी `.env` variables Render के
  Environment tab में जोड़ें। `CORS_ORIGIN` में अपना Vercel URL डालना न भूलें।

## ✅ वास्तव में क्या Real है

| फ़ीचर | तरीका |
|---|---|
| Photo/Screenshot AI विश्लेषण | वास्तविक vision-capable LLM कॉल (fallback chain सहित) |
| EXIF Metadata | वास्तविक — `exifr` लाइब्रेरी से निकाला गया |
| Link HTTPS/SSL/Domain पैटर्न | वास्तविक — Node के `tls` मॉड्यूल से लाइव जांच |
| Video Metadata | वास्तविक — YouTube/Vimeo का सार्वजनिक oEmbed |
| Message/News AI विश्लेषण | वास्तविक LLM कॉल |
| Phone spam-check, WHOIS | वास्तविक **अगर** आपने RapidAPI कॉन्फ़िगर किया है, अन्यथा ईमानदार "अनुपलब्ध" |
| Confidence Score | **जानबूझकर नहीं दिखाया** — केवल श्रेणी: अधिक विश्वसनीय / सत्यापन आवश्यक / संदेहास्पद / स्पष्ट नहीं |

## 🧭 सीमाएँ (ईमानदारी से)

- **वीडियो फ्रेम-स्तर Deepfake विश्लेषण** अभी शामिल नहीं है (इसके लिए ffmpeg + per-frame
  vision-model pipeline चाहिए — V2 roadmap का हिस्सा)। अभी विश्लेषण केवल public metadata
  और context पर आधारित है, और प्रॉम्प्ट खुद इस सीमा को बताता है।
- Instagram/WhatsApp जैसे प्लेटफ़ॉर्म से public oEmbed मेटाडेटा उपलब्ध नहीं है।

## 📄 License

MIT — देखें [`LICENSE`](./LICENSE)।

## 🔮 भविष्य के लिए तैयार Architecture

Login, Admin Panel, User History, Analytics, Subscription, Chrome Extension, Android App,
Telegram/WhatsApp Bot — इनमें से कोई भी अभी लागू नहीं है (जैसा माँगा गया था), लेकिन
`backend/src/routes/index.js` में इनके लिए placeholder comments छोड़े गए हैं, और हर
controller/service अलग फ़ाइल में है ताकि नई सुविधाएँ जोड़ना आसान हो — किसी मौजूदा फ़ाइल को
तोड़े बिना।
