
import React, { useEffect, useRef, useState, useId, useCallback } from 'react';

export interface GlassSurfaceProps {
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    borderWidth?: number;
    brightness?: number;
    opacity?: number;
    blur?: number;
    displace?: number;
    backgroundOpacity?: number;
    saturation?: number;
    distortionScale?: number;
    redOffset?: number;
    greenOffset?: number;
    blueOffset?: number;
    xChannel?: 'R' | 'G' | 'B';
    yChannel?: 'R' | 'G' | 'B';
    mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'plus-darker'
    | 'plus-lighter';
    className?: string;
    style?: React.CSSProperties;
}

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDark(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return isDark;
};

const GlassSurface: React.FC<GlassSurfaceProps> = ({
    children,
    width = '100%',
    height = '100%',
    borderRadius = 20,
    borderWidth = 0.07,
    displace = 0,
    backgroundOpacity = 0,
    saturation = 1,
    redOffset = 0,
    greenOffset = 10,
    blueOffset = 20,
    className = '',
    style = {}
}) => {
    const uniqueId = useId().replace(/:/g, '-');
    const filterId = `glass-filter-${uniqueId}`;

    const [svgSupported, setSvgSupported] = useState<boolean>(false);
    const [backdropSupported, setBackdropSupported] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const feImageRef = useRef<SVGFEImageElement>(null);
    const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
    const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

    const isDarkMode = useDarkMode();

    const updateDisplacementMap = useCallback(() => {
        if (
            !redChannelRef.current ||
            !greenChannelRef.current ||
            !blueChannelRef.current ||
            !gaussianBlurRef.current
        )
            return;

        redChannelRef.current.scale.baseVal = displace * redOffset;
        greenChannelRef.current.scale.baseVal = displace * greenOffset;
        blueChannelRef.current.scale.baseVal = displace * blueOffset;

        gaussianBlurRef.current.setStdDeviation(0.7, 0.7);
    }, [displace, redOffset, greenOffset, blueOffset]);

    const generateDisplacementMap = useCallback(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        const actualWidth = rect?.width || 400;
        const actualHeight = rect?.height || 200;
        const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

        // This is the original logic before the 48px fix
        const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${actualWidth}" height="${actualHeight}">
        <filter id="noise">
          <feTurbulence type="turbulence" baseFrequency="0.005" numOctaves="2" seed="${Math.random()}" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
        <rect width="100%" height="100%" fill="transparent" stroke="white" stroke-width="${edgeSize}" rx="${borderRadius}" ry="${borderRadius}"/>
      </svg>
    `;

        const encoded = encodeURIComponent(svgString);
        feImageRef.current!.setAttribute('href', `data:image/svg+xml;charset=utf-8,${encoded}`);

        updateDisplacementMap();
    }, [borderRadius, borderWidth, updateDisplacementMap]);

    const supportsBackdropFilter = () => {
        if (typeof window === 'undefined') return false;
        return CSS.supports('backdrop-filter', 'blur(10px)');
    };

    const supportsSVGFilters = useCallback(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);

        if (isWebkit || isFirefox) {
            return false;
        }

        const div = document.createElement('div');
        div.style.backdropFilter = `url(#${filterId})`;

        return div.style.backdropFilter !== '';
    }, [filterId]);

    useEffect(() => {
        setSvgSupported(supportsSVGFilters());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBackdropSupported(supportsBackdropFilter());
    }, [supportsSVGFilters]);

    useEffect(() => {
        if (svgSupported) {
            generateDisplacementMap();

            const handleResize = () => {
                requestAnimationFrame(generateDisplacementMap);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [svgSupported, generateDisplacementMap]);

    useEffect(() => {
        if (svgSupported) {
            updateDisplacementMap();
        }
    }, [displace, redOffset, greenOffset, blueOffset, svgSupported, updateDisplacementMap]);

    const getContainerStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            ...style,
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: `${borderRadius}px`,
            '--glass-frost': backgroundOpacity,
            '--glass-saturation': saturation
        } as React.CSSProperties;

        const backdropFilterSupported = backdropSupported;

        if (svgSupported) {
            return {
                ...baseStyles,
                background: isDarkMode ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
                backdropFilter: `url(#${filterId}) saturate(${saturation})`,
                boxShadow: isDarkMode
                    ? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
             0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`
                    : `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset,
             0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`
            };
        } else {
            if (isDarkMode) {
                if (!backdropFilterSupported) {
                    return {
                        ...baseStyles,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
                    };
                } else {
                    return {
                        ...baseStyles,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
                        WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
                    };
                }
            } else {
                if (!backdropFilterSupported) {
                    return {
                        ...baseStyles,
                        background: 'rgba(255, 255, 255, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`
                    };
                } else {
                    return {
                        ...baseStyles,
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
                        WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2),
                        0 2px 16px 0 rgba(31, 38, 135, 0.1),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`
                    };
                }
            }
        }
    };

    const glassSurfaceClasses =
        'relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out';

    const focusVisibleClasses = isDarkMode
        ? 'focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2'
        : 'focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2';

    return (
        <div
            ref={containerRef}
            className={`${glassSurfaceClasses} ${focusVisibleClasses} ${className}`}
            style={getContainerStyles()}
        >
            <svg
                className="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
                        <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

                        <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
                        <feColorMatrix
                            in="dispRed"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="red"
                        />

                        <feDisplacementMap
                            ref={greenChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            id="greenchannel"
                            result="dispGreen"
                        />
                        <feColorMatrix
                            in="dispGreen"
                            type="matrix"
                            values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="green"
                        />

                        <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
                        <feColorMatrix
                            in="dispBlue"
                            type="matrix"
                            values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
                            result="blue"
                        />

                        <feBlend in="red" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue" mode="screen" result="output" />
                        <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
                    </filter>
                </defs>
            </svg>

            <div className="w-full h-full flex items-center justify-center rounded-[inherit] relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassSurface;
