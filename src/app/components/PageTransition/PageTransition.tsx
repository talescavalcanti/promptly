'use client';

import React from 'react';

/**
 * Neutralized PageTransition component.
 * Page animations are now handled globally via src/app/template.tsx.
 * This component remains as a pass-through to avoid breaking existing imports.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
