'use client';

const STATUS_COLOR = {
  'अधिक विश्वसनीय': 'text-success border-success bg-success/10',
  'सत्यापन आवश्यक': 'text-warning border-warning bg-warning/10',
  'संदेहास्पद': 'text-danger border-danger bg-danger/10',
  'स्पष्ट नहीं': 'text-slate-300 border-slate-400 bg-slate-400/10',
};

export default function ResultPanel({ data, onClose }) {
  if (!data) return null;
  const { result, provider, disclaimer, details } = data;
  const badgeClass = STATUS_COLOR[result.status] || STATUS_COLOR['स्पष्ट नहीं'];

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-lg rounded-3xl p-7 relative mt-8 mb-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 left-4 text-xl text-[#9AA7C7]" aria-label="बंद करें">✕</button>

        <div className="text-center text-success font-bold mb-4">✅ AI जांच पूरी हुई</div>

        <div className={`block mx-auto w-fit px-5 py-2 rounded-full font-bold border mb-5 ${badgeClass}`}>
          {result.emoji} {result.status}
        </div>

        {result.reasons?.length > 0 && (
          <ul className="grid gap-2 mb-5">
            {result.reasons.map((r, i) => (
              <li key={i} className="glass rounded-xl px-3 py-2 text-sm">{r}</li>
            ))}
          </ul>
        )}

        <div className="glass rounded-2xl p-4 text-sm leading-7 mb-5">{result.summary}</div>

        <div className="text-sm font-bold mb-2">🛡️ बचने के तरीके</div>
        <ul className="grid gap-1.5 mb-5 text-sm text-[#9AA7C7]">
          {result.safetyTips.map((t, i) => (
            <li key={i}>✅ {t}</li>
          ))}
        </ul>

        {details?.officialVerificationLinks && (
          <div className="mb-5 text-sm">
            <div className="font-bold mb-2">🔗 आधिकारिक सत्यापन स्रोत</div>
            <ul className="grid gap-1.5">
              {details.officialVerificationLinks.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-400 underline">{l.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {details?.reverseSearchLinks && (
          <div className="mb-5 text-sm">
            <div className="font-bold mb-2">🔍 Reverse Image Search</div>
            <div className="flex gap-4">
              <a href={details.reverseSearchLinks.google} target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Lens</a>
              <a href={details.reverseSearchLinks.tineye} target="_blank" rel="noreferrer" className="text-blue-400 underline">TinEye</a>
            </div>
          </div>
        )}

        <div className="text-xs text-center text-[#9AA7C7] border-t border-dashed border-white/10 pt-3">
          {disclaimer}
          <div className="mt-1 opacity-70">विश्लेषण स्रोत: {provider}</div>
        </div>

        <button onClick={onClose} className="mt-4 w-full bg-primary text-white rounded-2xl py-3 font-bold">
          🔁 नई जांच करें
        </button>
      </div>
    </div>
  );
}
