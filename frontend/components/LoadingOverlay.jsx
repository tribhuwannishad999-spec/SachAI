'use client';
import { useEffect, useState } from 'react';

const MESSAGES = [
  'AI विश्लेषण कर रही है...',
  'Photo Scan...',
  'Video Scan...',
  'Metadata Scan...',
  'Deep Analysis...',
  'Cross Verification...',
  'Report तैयार हो रही है...',
];

export default function LoadingOverlay({ show }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 900);
    return () => clearInterval(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-md bg-[#0F172A]/60">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-400 border-transparent animate-[spin-slow_3s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full border-2 border-b-green-400 border-transparent animate-[spin-rev_2.2s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border-2 border-l-amber-400 border-transparent animate-[spin-slow_1.6s_linear_infinite]" />
        <span className="text-4xl animate-[pulse-brain_1.6s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 0 18px rgba(37,99,235,0.8))' }}>
          🧠
        </span>
      </div>
      <p className="mt-7 text-[#9AA7C7] text-base transition-opacity">{MESSAGES[idx]}</p>
      <div className="mt-4 w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-green-400 animate-[spin-slow_2.4s_linear_infinite] w-2/3" />
      </div>
    </div>
  );
}
