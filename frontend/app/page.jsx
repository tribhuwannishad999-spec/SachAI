'use client';
import { useRef, useState } from 'react';
import Nav from '../components/Nav';
import LoadingOverlay from '../components/LoadingOverlay';
import ResultPanel from '../components/ResultPanel';
import {
  verifyMessage, verifyLink, verifyVideo, verifyPhone,
  verifyPhoto, verifyScreenshot, verifyNews,
} from '../lib/api';

const VIDEO_HOST_REGEX = /youtube\.com|youtu\.be|vimeo\.com|instagram\.com|facebook\.com|fb\.watch|twitter\.com|x\.com/i;
const URL_REGEX = /^(https?:\/\/)/i;
const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

const CHIPS = [
  { key: 'photo', label: 'फोटो अपलोड करें', icon: '📷', accept: 'image/*' },
  { key: 'video', label: 'वीडियो अपलोड करें', icon: '🎥', hint: true },
  { key: 'screenshot', label: 'स्क्रीनशॉट अपलोड करें', icon: '📸', accept: 'image/*' },
  { key: 'message', label: 'मैसेज पेस्ट करें', icon: '💬', hint: true },
  { key: 'link', label: 'वीडियो / वेबसाइट लिंक', icon: '🔗', hint: true },
  { key: 'phone', label: 'कॉल नंबर जांचें', icon: '📞', hint: true },
  { key: 'news', label: 'न्यूज़ / वायरल दावा', icon: '📰', hint: true },
];

export default function HomePage() {
  const [input, setInput] = useState('');
  const [selectedChip, setSelectedChip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const pendingFileKind = useRef(null);

  function pickChip(chip) {
    setError('');
    setSelectedChip(chip.key);
    if (chip.accept) {
      pendingFileKind.current = chip.key;
      fileInputRef.current.accept = chip.accept;
      fileInputRef.current.click();
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const kind = pendingFileKind.current;
      const data = kind === 'photo' ? await verifyPhoto(file) : await verifyScreenshot(file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runTextAnalysis() {
    const value = input.trim();
    if (!value) {
      setError('कृपया कुछ लिखें या फ़ाइल अपलोड करें।');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let data;
      if (selectedChip === 'phone' || PHONE_REGEX.test(value)) {
        data = await verifyPhone(value);
      } else if (selectedChip === 'news') {
        data = await verifyNews(value);
      } else if (VIDEO_HOST_REGEX.test(value)) {
        data = await verifyVideo(value);
      } else if (URL_REGEX.test(value)) {
        data = await verifyLink(value);
      } else {
        data = await verifyMessage(value);
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Nav />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      <section className="max-w-3xl mx-auto px-5 pt-14 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full mb-5">
          ⚡ भारत का AI Fact Verification Platform
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
          🛡️ SachAI
        </h1>
        <p className="text-[#9AA7C7] max-w-xl mx-auto mb-8 leading-relaxed">
          फोटो, वीडियो लिंक, वेबसाइट लिंक, फ़ोन नंबर, न्यूज़ या मैसेज — कुछ भी लिखें, AI असली विश्लेषण देगा।
        </p>

        <div className="glass rounded-3xl p-2 flex gap-2 items-center shadow-xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runTextAnalysis()}
            placeholder="यहाँ वीडियो लिंक, वेबसाइट लिंक, फोन नंबर, न्यूज़ दावा या मैसेज लिखें..."
            className="flex-1 bg-transparent outline-none px-3 py-3.5 text-sm placeholder:text-[#9AA7C7]"
          />
          <button onClick={runTextAnalysis} className="bg-primary text-white rounded-2xl px-5 py-3.5 font-semibold whitespace-nowrap">
            🔍 जांच करें
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
          {CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => pickChip(chip)}
              className={`glass rounded-2xl px-3 py-4 text-sm flex flex-col items-center gap-1.5 transition hover:-translate-y-0.5 ${
                selectedChip === chip.key ? 'border-primary bg-primary/15' : ''
              }`}
            >
              <span className="text-2xl">{chip.icon}</span>
              {chip.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <button onClick={runTextAnalysis} className="mt-7 bg-gradient-to-r from-primary to-blue-500 text-white rounded-2xl px-10 py-4 font-bold shadow-lg hover:scale-[1.02] transition">
          🔍 जांच शुरू करें
        </button>
      </section>

      <LoadingOverlay show={loading} />
      <ResultPanel data={result} onClose={() => setResult(null)} />
    </main>
  );
}
