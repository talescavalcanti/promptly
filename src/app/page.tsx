
import { Hero } from './components/Hero/Hero';
import { PreviewSection } from './components/PreviewSection/PreviewSection';
import { Features } from './components/Features/Features';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Footer } from './components/Footer/Footer';
import { PageTransition } from './components/PageTransition/PageTransition';
import { ScrollReveal } from './components/ScrollReveal/ScrollReveal';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, marginTop: '2rem' }}>
        <PageTransition>
          <ScrollReveal>
            <Hero />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <PreviewSection />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <Features />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <HowItWorks />
          </ScrollReveal>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
