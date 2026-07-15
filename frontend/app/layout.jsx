import './globals.css';

export const metadata = {
  title: 'SachAI — सच्चाई की पहचान, AI के साथ',
  description: 'भारत का AI आधारित डिजिटल सत्यापन प्लेटफ़ॉर्म — फोटो, वीडियो, स्क्रीनशॉट, मैसेज, लिंक और फ़ोन नंबर की जांच करें।',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
