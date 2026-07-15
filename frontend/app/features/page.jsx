import Nav from '../../components/Nav';

const FEATURES = [
  { icon: '📷', title: 'फोटो सत्यापन', points: ['AI Generated संकेत', 'EXIF Metadata', 'Editing के संकेत'] },
  { icon: '🎥', title: 'वीडियो सत्यापन', points: ['Public Metadata Context', 'संभावित भ्रामक शीर्षक', 'Deepfake संकेत (सीमित)'] },
  { icon: '📸', title: 'स्क्रीनशॉट सत्यापन', points: ['Text Tampering संकेत', 'Fake Screenshot संकेत'] },
  { icon: '💬', title: 'मैसेज सत्यापन', points: ['Scam / Phishing', 'OTP व UPI Fraud', 'Fake News व Rumour'] },
  { icon: '🔗', title: 'लिंक सत्यापन', points: ['वास्तविक HTTPS/SSL जांच', 'Domain पैटर्न विश्लेषण', 'WHOIS (यदि उपलब्ध)'] },
  { icon: '📞', title: 'फ़ोन नंबर सत्यापन', points: ['सार्वजनिक Spam संकेत (यदि उपलब्ध)', 'ईमानदार "स्पष्ट नहीं" जब डेटा न हो'] },
  { icon: '📰', title: 'न्यूज़ / वायरल दावा', points: ['दावा सारांश', 'आधिकारिक सत्यापन स्रोत सुझाव'] },
];

export default function FeaturesPage() {
  return (
    <main>
      <Nav />
      <section className="max-w-5xl mx-auto px-5 py-14">
        <h1 className="font-display text-3xl font-extrabold text-center mb-3">⚡ मुख्य सुविधाएँ</h1>
        <p className="text-center text-[#9AA7C7] mb-10">हर सुविधा वास्तविक AI विश्लेषण और/या वास्तविक तकनीकी जांच पर आधारित है — कोई random स्कोर नहीं।</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5">
              <span className="text-2xl block mb-2">{f.icon}</span>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <ul className="text-sm text-[#9AA7C7] space-y-1.5 list-disc pr-4">
                {f.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
