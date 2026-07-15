import Nav from '../../components/Nav';

export default function ContactPage() {
  return (
    <main>
      <Nav />
      <section className="max-w-xl mx-auto px-5 py-14 text-center">
        <h1 className="font-display text-3xl font-extrabold mb-6">📞 संपर्क करें</h1>
        <div className="glass rounded-2xl p-6">
          <p className="text-[#9AA7C7] mb-3">किसी सुझाव, समस्या या सहयोग के लिए हमें लिखें।</p>
          <p className="font-bold text-blue-300">support@sachai.in</p>
        </div>
      </section>
    </main>
  );
}
