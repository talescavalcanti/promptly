'use client';

import { HomeRedirectGuard } from './components/HomeRedirectGuard/HomeRedirectGuard';
import { Hero } from './components/Hero/Hero';
import { PreviewSection } from './components/PreviewSection/PreviewSection';
import { Features } from './components/Features/Features';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { Footer } from './components/Footer/Footer';
import { PageTransition } from './components/PageTransition/PageTransition';
import { ScrollReveal } from './components/ScrollReveal/ScrollReveal';
import { LogoTicker } from './components/LogoTicker/LogoTicker';
import MacbookScrollDemo from '@/components/macbook-scroll-demo';

export default function Home() {
  return (
    <HomeRedirectGuard>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        <main style={{ flex: 1, position: 'relative', zIndex: 1, background: 'transparent' }}>
          <PageTransition>
            <ScrollReveal>
              <Hero />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PreviewSection />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <LogoTicker />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <MacbookScrollDemo />
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
    </HomeRedirectGuard>
  );
}
