
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { PreviewSection } from './components/PreviewSection/PreviewSection';
import { Features } from './components/Features/Features';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Footer } from './components/Footer/Footer';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, marginTop: '5rem' }}>
        <Hero />
        <PreviewSection />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
