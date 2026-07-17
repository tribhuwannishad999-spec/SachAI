'use client';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-bgdark text-white">
      <div className="text-5xl">⚠️</div>
      <h1 className="text-xl font-display">कुछ गलत हो गया</h1>
      <p className="text-sm text-[#9AA7C7] max-w-md">
        पेज लोड करने में समस्या आई। कृपया पुनः प्रयास करें, या कुछ देर बाद वापस आएं।
      </p>
      <button
        onClick={() => reset()}
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium hover:opacity-90"
      >
        पुनः प्रयास करें
      </button>
    </div>
  );
}
