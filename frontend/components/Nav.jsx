'use client';
import { useState, useEffect } from 'react';

export default function Nav() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !dark);
  }, [dark]);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 glass border-b">
      <a href="/" className="flex items-center gap-2 font-display font-extrabold text-xl">
        <span className="text-2xl">🛡️</span> SachAI
      </a>
      <div className="hidden md:flex gap-6 text-sm text-[color:var(--text-dim,#9AA7C7)]">
        <a href="/">🏠 Home</a>
        <a href="/features">⚡ Features</a>
        <a href="/faq">❓ FAQ</a>
        <a href="/about">ℹ️ About</a>
        <a href="/contact">📞 Contact</a>
      </div>
      <button
        onClick={() => setDark((d) => !d)}
        className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-105 transition"
        aria-label="Toggle theme"
      >
        {dark ? '🌙' : '☀️'}
      </button>
    </nav>
  );
}
