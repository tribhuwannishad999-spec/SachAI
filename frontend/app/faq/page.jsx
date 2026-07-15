import Nav from '../../components/Nav';

const FAQS = [
  { q: 'क्या SachAI सामग्री को 100% सच या झूठ बताता है?', a: 'नहीं। SachAI केवल उपलब्ध वास्तविक संकेतों के आधार पर विश्लेषण देता है और स्पष्ट रूप से बताता है जब निश्चितता नहीं है। अंतिम निर्णय के लिए भरोसेमंद स्रोतों से पुष्टि करें।' },
  { q: 'क्या मेरा डेटा सुरक्षित है?', a: 'हाँ। V1 में कोई लॉगिन, कोई डेटाबेस-आधारित history और कोई ट्रैकिंग नहीं है। अपलोड की गई फ़ाइलें केवल विश्लेषण के लिए Cloudinary पर संग्रहित होती हैं।' },
  { q: 'यदि एक AI सेवा काम न करे तो क्या होगा?', a: 'सिस्टम स्वतः अगली उपलब्ध AI सेवा (OpenRouter → Gemini → Groq → Hugging Face) आज़माता है। यदि सभी विफल हों तो ईमानदारी से त्रुटि दिखाई जाती है, कभी झूठा परिणाम नहीं।' },
];

export default function FaqPage() {
  return (
    <main>
      <Nav />
      <section className="max-w-2xl mx-auto px-5 py-14">
        <h1 className="font-display text-3xl font-extrabold text-center mb-8">❓ अक्सर पूछे जाने वाले सवाल</h1>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="glass rounded-2xl p-4">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="text-sm text-[#9AA7C7] mt-2 leading-7">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
