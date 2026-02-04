'use client';

import { InfiniteSlider } from '@/components/ui/infinite-slider';

export const LogoTicker = () => {
    return (
        <section className="w-full pt-4 pb-12 md:py-20 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="relative">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

                    <div className="flex justify-center mb-10 relative z-10 px-4 text-center">
                        <p className="text-lg md:text-xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-sm">
                            Otimizado para as plataformas que definem o futuro
                        </p>
                    </div>

                    <InfiniteSlider gap={60} duration={30} durationOnHover={50} direction="horizontal">
                        <img src="/logos/lovable.png" alt="Lovable" className="h-14 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 transform hover:scale-105 cursor-pointer object-contain" />
                        <img src="/logos/vercel.png" alt="Vercel" className="h-14 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 transform hover:scale-105 cursor-pointer object-contain" />
                        <img src="/logos/bolt.png" alt="Bolt" className="h-14 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 transform hover:scale-105 cursor-pointer object-contain" />
                        <img src="/logos/replit.png" alt="Replit" className="h-14 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 transform hover:scale-105 cursor-pointer object-contain" />
                        <img src="/logos/google_ai.png" alt="Google AI Studio" className="h-14 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 transform hover:scale-105 cursor-pointer object-contain" />
                    </InfiniteSlider>
                </div>
            </div>
        </section>
    );
};
