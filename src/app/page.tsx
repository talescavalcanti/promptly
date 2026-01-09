
import { Hero } from './components/Hero/Hero';
import { PreviewSection } from './components/PreviewSection/PreviewSection';
import { Features } from './components/Features/Features';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Footer } from './components/Footer/Footer';
import { PageTransition } from './components/PageTransition/PageTransition';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, marginTop: '2rem' }}>
        <PageTransition>
          <Hero />
          <PreviewSection />
          <Features />
          <HowItWorks />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
