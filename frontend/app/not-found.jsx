import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-bgdark text-white">
      <div className="text-5xl">🔍</div>
      <h1 className="text-xl font-display">404 — पेज नहीं मिला</h1>
      <p className="text-sm text-[#9AA7C7] max-w-md">
        आपने जिस पेज को खोजा वह मौजूद नहीं है या हटा दिया गया है।
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium hover:opacity-90"
      >
        होम पर वापस जाएं
      </Link>
    </div>
  );
}
