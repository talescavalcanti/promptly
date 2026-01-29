'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamic import with SSR disabled for WebGL component
const Plasma = dynamic(() => import('../Plasma/Plasma'), {
    ssr: false,
    loading: () => null
});

// Only show plasma on these routes for performance
const PLASMA_ROUTES = ['/', '/pricing'];

export function PlasmaBackground() {
    const pathname = usePathname();

    // Only render on specific routes to save performance
    if (!PLASMA_ROUTES.includes(pathname)) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                opacity: 0.35,
                pointerEvents: 'none',
                willChange: 'transform' // GPU acceleration hint
            }}
        >
            <Plasma color="#F5A524" speed={0.3} scale={1.5} />
        </div>
    );
}
