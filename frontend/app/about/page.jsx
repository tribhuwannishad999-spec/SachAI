import Nav from '../../components/Nav';

export default function AboutPage() {
  return (
    <main>
      <Nav />
      <section className="max-w-2xl mx-auto px-5 py-14 text-center">
        <h1 className="font-display text-3xl font-extrabold mb-4">ℹ️ SachAI के बारे में</h1>
        <p className="text-[#9AA7C7] leading-8">
          SachAI भारत के हर व्यक्ति के लिए बनाया गया एक AI आधारित सत्यापन उपकरण है, जो फोटो, वीडियो, स्क्रीनशॉट,
          मैसेज, लिंक और फ़ोन नंबर से जुड़े डिजिटल भ्रम को समझने में मदद करता है। यह एक तकनीकी सहायक है, कानूनी
          प्रमाण नहीं — अंतिम सत्यापन हमेशा भरोसेमंद, आधिकारिक स्रोतों से करें।
        </p>
      </section>
    </main>
  );
}
