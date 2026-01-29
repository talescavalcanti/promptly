import React, { useEffect, useRef, useCallback, CSSProperties } from 'react';

function hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#', '');
    if (h.length === 3) {
        h = h
            .split('')
            .map(c => c + c)
            .join('');
    }
    const int = parseInt(h, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ElectricBorderProps {
    color?: string;
    speed?: number;
    chaos?: number;
    borderRadius?: number;
    className?: string;
    style?: CSSProperties;
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({
    color = '#F5A524',
    speed = 1,
    chaos = 0.5,
    borderRadius = 24,
    className,
    style
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);

    const random = useCallback((x: number): number => {
        return (Math.sin(x * 12.9898) * 43758.5453) % 1;
    }, []);

    const noise2D = useCallback(
        (x: number, y: number): number => {
            const i = Math.floor(x);
            const j = Math.floor(y);
            const fx = x - i;
            const fy = y - j;

            const a = random(i + j * 57);
            const b = random(i + 1 + j * 57);
            const c = random(i + (j + 1) * 57);
            const d = random(i + 1 + (j + 1) * 57);

            const ux = fx * fx * (3.0 - 2.0 * fx);
            const uy = fy * fy * (3.0 - 2.0 * fy);

            return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
        },
        [random]
    );

    const octavedNoise = useCallback(
        (
            x: number,
            y: number,
            octaves: number,
            lacunarity: number,
            gain: number,
            baseAmplitude: number,
            frequency: number,
            time: number
        ): number => {
            let value = 0;
            let amplitude = baseAmplitude;
            let currentFreq = 1;

            for (let i = 0; i < octaves; i++) {
                const tx = x * currentFreq + time * 0.5;
                const ty = y * currentFreq + time * 0.5;

                value += amplitude * noise2D(tx, ty);

                currentFreq *= lacunarity;
                amplitude *= gain;
            }

            return value;
        },
        [noise2D]
    );

    const getPointOnPath = useCallback((t: number, w: number, h: number, r: number, xOff: number, yOff: number) => {
        const topW = Math.max(0, w - 2 * r);
        const rightH = Math.max(0, h - 2 * r);
        const botW = topW;
        const leftH = rightH;
        const cornerLen = 0.5 * Math.PI * r;

        const totalLen = topW + rightH + botW + leftH + 4 * cornerLen;
        let d = t * totalLen;

        // 1. Top Line
        if (d <= topW) {
            return { x: xOff + r + d, y: yOff };
        }
        d -= topW;

        // 2. Top-Right Corner
        if (d <= cornerLen) {
            const ang = -Math.PI / 2 + (d / cornerLen) * (Math.PI / 2);
            return {
                x: xOff + w - r + Math.cos(ang) * r,
                y: yOff + r + Math.sin(ang) * r
            };
        }
        d -= cornerLen;

        // 3. Right Line
        if (d <= rightH) {
            return { x: xOff + w, y: yOff + r + d };
        }
        d -= rightH;

        // 4. Bottom-Right Corner
        if (d <= cornerLen) {
            const ang = 0 + (d / cornerLen) * (Math.PI / 2);
            return {
                x: xOff + w - r + Math.cos(ang) * r,
                y: yOff + h - r + Math.sin(ang) * r
            };
        }
        d -= cornerLen;

        // 5. Bottom Line (Right to Left)
        if (d <= botW) {
            return { x: xOff + w - r - d, y: yOff + h };
        }
        d -= botW;

        // 6. Bottom-Left Corner
        if (d <= cornerLen) {
            const ang = Math.PI / 2 + (d / cornerLen) * (Math.PI / 2);
            return {
                x: xOff + r + Math.cos(ang) * r,
                y: yOff + h - r + Math.sin(ang) * r
            };
        }
        d -= cornerLen;

        // 7. Left Line (Bottom to Top)
        if (d <= leftH) {
            return { x: xOff, y: yOff + h - r - d };
        }
        d -= leftH;

        // 8. Top-Left Corner
        const ang = Math.PI + (d / cornerLen) * (Math.PI / 2);
        return {
            x: xOff + r + Math.cos(ang) * r,
            y: yOff + r + Math.sin(ang) * r
        };

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const octaves = 6;
        const lacunarity = 2;
        const gain = 0.5;
        const noiseScale = 0.5;
        const borderOffset = 14;
        const displacement = 6; // Keep tight displacement

        let animationId = 0;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const w = rect.width + borderOffset * 2;
            const h = rect.height + borderOffset * 2;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);

            return { w, h };
        };

        let { w, h } = updateSize();

        const draw = (timeVal: number) => {
            const time = timeVal * 0.001 * speed;

            ctx.clearRect(0, 0, w, h);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const mainPath = new Path2D();

            const pathW = w - borderOffset * 2;
            const pathH = h - borderOffset * 2;

            const perimeter = 2 * (pathW + pathH) + 2 * Math.PI * borderRadius;
            const steps = Math.floor(perimeter / 2);

            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;

                const base = getPointOnPath(progress, pathW, pathH, borderRadius, borderOffset, borderOffset);

                // Cyclic noise
                const angle = progress * Math.PI * 2;
                const nx = Math.cos(angle) * noiseScale;
                const ny = Math.sin(angle) * noiseScale;

                const n1 = octavedNoise(nx, ny, octaves, lacunarity, gain, chaos, 1.5, time);
                const n2 = octavedNoise(nx + 100, ny + 100, octaves, lacunarity, gain, chaos, 1.5, time);

                // REVERTED to original offset behavior (not centered)
                // This gives the "electric" look flowing OUT of the border
                const dx = n1 * displacement;
                const dy = n2 * displacement;

                const finalX = base.x + dx;
                const finalY = base.y + dy;

                if (i === 0) {
                    mainPath.moveTo(finalX, finalY);
                } else {
                    mainPath.lineTo(finalX, finalY);
                }
            }

            mainPath.closePath();

            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.lineWidth = 1.5;
            ctx.stroke(mainPath);

            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FFFFFF';
            ctx.globalAlpha = 0.5;
            ctx.stroke(mainPath);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            animationId = requestAnimationFrame(draw);
        };

        const resizeObserver = new ResizeObserver(() => {
            const s = updateSize();
            w = s.w;
            h = s.h;
        });
        resizeObserver.observe(container);

        animationId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
        };
    }, [color, speed, chaos, borderRadius, octavedNoise, getPointOnPath]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                ...style
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default ElectricBorder;
