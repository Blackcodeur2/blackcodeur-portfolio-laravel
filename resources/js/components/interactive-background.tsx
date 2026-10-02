import { useEffect, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseAlpha: number;
    pulseSpeed: number;
    pulseAngle: number;
    color: string;
}

export function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    // Mouse position state (screen coords relative to viewport)
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
        x: -9999,
        y: -9999,
        active: false,
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
                active: true,
            };
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
            setMousePos(null);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Canvas particle constellation simulation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isVisible = true;

        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        // Dimensions
        let width = 0;
        let height = 0;
        let dpr = 1;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Palette setup based on theme
        const colors = isDark
            ? [
                  'rgba(99, 102, 241,', // Indigo
                  'rgba(139, 92, 246,', // Violet
                  'rgba(6, 182, 212,',  // Cyan
                  'rgba(56, 189, 248,', // Sky
                  'rgba(217, 70, 239,', // Fuchsia
              ]
            : [
                  'rgba(79, 70, 229,',  // Deep Indigo
                  'rgba(124, 58, 237,', // Deep Violet
                  'rgba(8, 145, 178,',  // Teal/Cyan
                  'rgba(2, 132, 199,',  // Sky
              ];

        // Particle count: responsive based on screen width
        const count = width < 768 ? 28 : Math.min(65, Math.floor(width / 22));
        const particles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: Math.random() * 1.8 + 1.2,
                baseAlpha: Math.random() * 0.35 + (isDark ? 0.35 : 0.25),
                pulseSpeed: 0.015 + Math.random() * 0.02,
                pulseAngle: Math.random() * Math.PI * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        // Handle visibility
        const handleVisibilityChange = () => {
            isVisible = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const connectionDistance = width < 768 ? 95 : 125;
        const mouseConnectionDistance = 160;

        const render = () => {
            if (!isVisible) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            const mouse = mouseRef.current;

            // Update & draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (!prefersReducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Pulse brightness
                    p.pulseAngle += p.pulseSpeed;

                    // Edge wrapping with padding
                    if (p.x < -20) p.x = width + 20;
                    else if (p.x > width + 20) p.x = -20;
                    if (p.y < -20) p.y = height + 20;
                    else if (p.y > height + 20) p.y = -20;

                    // Mouse proximity interaction (gentle avoidance / fluid drift)
                    if (mouse.active) {
                        const dx = mouse.x - p.x;
                        const dy = mouse.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 120 && dist > 0) {
                            const force = (120 - dist) / 120;
                            const angle = Math.atan2(dy, dx);
                            p.x -= Math.cos(angle) * force * 0.6;
                            p.y -= Math.sin(angle) * force * 0.6;
                        }
                    }
                }

                const currentAlpha = Math.max(
                    0.1,
                    p.baseAlpha + Math.sin(p.pulseAngle) * 0.18
                );

                // Draw particle node
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color} ${currentAlpha})`;
                ctx.fill();

                // Glow ring on brighter particles
                if (p.radius > 2.2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
                    ctx.fillStyle = `${p.color} ${currentAlpha * 0.25})`;
                    ctx.fill();
                }

                // Connect with nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const alpha =
                            (1 - dist / connectionDistance) *
                            (isDark ? 0.22 : 0.14);

                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isDark
                            ? `rgba(129, 140, 248, ${alpha})`
                            : `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.9;
                        ctx.stroke();
                    }
                }

                // Connect particle to mouse if nearby
                if (mouse.active) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseConnectionDistance) {
                        const alpha =
                            (1 - dist / mouseConnectionDistance) *
                            (isDark ? 0.45 : 0.3);

                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = isDark
                            ? `rgba(6, 182, 212, ${alpha})`
                            : `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isDark]);

    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
            aria-hidden="true"
        >
            <style>{`
                @keyframes aurora-1 {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
                    }
                    33% {
                        transform: translate3d(4%, -6%, 0) scale(1.15) rotate(5deg);
                    }
                    66% {
                        transform: translate3d(-3%, 4%, 0) scale(0.92) rotate(-4deg);
                    }
                }
                @keyframes aurora-2 {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
                    }
                    40% {
                        transform: translate3d(-6%, 5%, 0) scale(1.18) rotate(-6deg);
                    }
                    80% {
                        transform: translate3d(3%, -4%, 0) scale(0.95) rotate(3deg);
                    }
                }
                @keyframes aurora-3 {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                    50% {
                        transform: translate3d(5%, 3%, 0) scale(1.12);
                    }
                }
                @keyframes aurora-4 {
                    0%, 100% {
                        transform: translate3d(0, 0, 0) scale(0.95);
                    }
                    50% {
                        transform: translate3d(-4%, -5%, 0) scale(1.1);
                    }
                }
                @keyframes grid-slide-tech {
                    0% {
                        background-position: 0px 0px;
                    }
                    100% {
                        background-position: 48px 48px;
                    }
                }
                @keyframes beam-flow-h {
                    0% {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(200%);
                        opacity: 0;
                    }
                }
                @keyframes beam-flow-v {
                    0% {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(200%);
                        opacity: 0;
                    }
                }
                .aurora-orb-1 {
                    animation: aurora-1 26s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                    will-change: transform;
                }
                .aurora-orb-2 {
                    animation: aurora-2 32s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                    will-change: transform;
                }
                .aurora-orb-3 {
                    animation: aurora-3 28s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                    will-change: transform;
                }
                .aurora-orb-4 {
                    animation: aurora-4 36s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                    will-change: transform;
                }
                .bg-tech-grid-pattern {
                    background-size: 48px 48px;
                    background-image:
                        linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
                    animation: grid-slide-tech 30s linear infinite;
                }
                .dark .bg-tech-grid-pattern {
                    background-image:
                        linear-gradient(to right, rgba(129, 140, 248, 0.07) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(129, 140, 248, 0.07) 1px, transparent 1px);
                }
                .beam-h-1 {
                    animation: beam-flow-h 9s ease-in-out infinite;
                }
                .beam-h-2 {
                    animation: beam-flow-h 13s ease-in-out infinite;
                    animation-delay: 4.5s;
                }
                .beam-v-1 {
                    animation: beam-flow-v 11s ease-in-out infinite;
                    animation-delay: 2s;
                }
                @keyframes chip-float-1 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-18px) rotate(3deg); }
                }
                @keyframes chip-float-2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(16px) rotate(-2deg); }
                }
                @keyframes chip-float-3 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-14px) rotate(4deg); }
                }
                .chip-float-1 { animation: chip-float-1 8s ease-in-out infinite; will-change: transform; }
                .chip-float-2 { animation: chip-float-2 10s ease-in-out infinite 2s; will-change: transform; }
                .chip-float-3 { animation: chip-float-3 12s ease-in-out infinite 4s; will-change: transform; }
                @media (prefers-reduced-motion: reduce) {
                    .aurora-orb-1, .aurora-orb-2, .aurora-orb-3, .aurora-orb-4,
                    .bg-tech-grid-pattern, .beam-h-1, .beam-h-2, .beam-v-1,
                    .chip-float-1, .chip-float-2, .chip-float-3 {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* ── 1. FLUID AURORA NEON ORBS (Vibrant mesh gradient) ── */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Indigo/Blue Primary Orb (Top-Left) */}
                <div className="aurora-orb-1 absolute -top-[12%] -left-[10%] h-[55vw] w-[55vw] min-h-[380px] min-w-[380px] max-h-[750px] max-w-[750px] rounded-full bg-linear-to-tr from-indigo-600/20 via-blue-500/18 to-cyan-400/15 blur-[120px] dark:from-indigo-500/15 dark:via-blue-600/12 dark:to-cyan-500/10" />

                {/* Violet/Purple Secondary Orb (Bottom-Right) */}
                <div className="aurora-orb-2 absolute -right-[10%] bottom-[5%] h-[60vw] w-[60vw] min-h-[420px] min-w-[420px] max-h-[850px] max-w-[850px] rounded-full bg-linear-to-bl from-violet-600/20 via-purple-600/16 to-pink-500/12 blur-[140px] dark:from-violet-600/14 dark:via-purple-600/12 dark:to-pink-600/8" />

                {/* Cyan/Teal Mid Orb (Center-Left) */}
                <div className="aurora-orb-3 absolute top-[38%] -left-[5%] h-[40vw] w-[40vw] min-h-[300px] min-w-[300px] max-h-[600px] max-w-[600px] rounded-full bg-linear-to-br from-cyan-500/15 via-teal-400/12 to-emerald-400/10 blur-[100px] dark:from-cyan-500/10 dark:via-teal-500/8 dark:to-emerald-500/5" />

                {/* Fuchsia Accent Orb (Center-Right) */}
                <div className="aurora-orb-4 absolute top-[48%] right-[5%] h-[35vw] w-[35vw] min-h-[260px] min-w-[260px] max-h-[500px] max-w-[500px] rounded-full bg-linear-to-tl from-fuchsia-600/14 via-rose-500/10 to-indigo-500/10 blur-[110px] dark:from-fuchsia-600/10 dark:via-rose-600/8 dark:to-indigo-500/6" />
            </div>

            {/* ── 2. DYNAMIC TECH GRID WITH RADIAL VIGNETTE ── */}
            <div
                className="bg-tech-grid-pattern absolute inset-0 opacity-80"
                style={{
                    maskImage:
                        'radial-gradient(ellipse 75% 75% at 50% 50%, black 35%, transparent 100%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 75% 75% at 50% 50%, black 35%, transparent 100%)',
                }}
            />

            {/* Subtle Tech Micro-Dots Matrix */}
            <div
                className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, currentColor 1.2px, transparent 1.2px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* ── 3. INTERACTIVE SPOTLIGHT (Glow tracks mouse cursor) ── */}
            {mousePos && (
                <div
                    className="transition-opacity duration-500 ease-out"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: isDark
                            ? `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.05) 40%, transparent 75%)`
                            : `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.04) 45%, transparent 70%)`,
                    }}
                />
            )}

            {/* ── 4. LIGHT BEAMS / ENERGY FLOWS ON GRID ── */}
            <div className="absolute inset-0 overflow-hidden opacity-60 dark:opacity-40">
                {/* Horizontal light beam 1 */}
                <div className="beam-h-1 absolute top-[28%] left-0 h-[1.5px] w-48 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

                {/* Horizontal light beam 2 */}
                <div className="beam-h-2 absolute top-[68%] left-0 h-[1.5px] w-64 bg-linear-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)]" />

                {/* Vertical light beam 1 */}
                <div className="beam-v-1 absolute top-0 left-[35%] h-48 w-[1.5px] bg-linear-to-b from-transparent via-violet-400 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>

            {/* ── 5. FLOATING HARDWARE MICROCHIPS ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Chip 1 — Indigo (Top Right) */}
                <div className="chip-float-1 absolute top-[12%] right-[8%] opacity-15 dark:opacity-20">
                    <svg width="68" height="68" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="16" y="16" width="40" height="40" rx="4" stroke="#6366f1" strokeWidth="1.5" />
                        <rect x="24" y="24" width="24" height="24" rx="2" stroke="#6366f1" strokeWidth="1" />
                        <line x1="24" y1="8" x2="24" y2="16" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="36" y1="8" x2="36" y2="16" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="48" y1="8" x2="48" y2="16" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="24" y1="56" x2="24" y2="64" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="36" y1="56" x2="36" y2="64" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="48" y1="56" x2="48" y2="64" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="8" y1="24" x2="16" y2="24" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="8" y1="36" x2="16" y2="36" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="8" y1="48" x2="16" y2="48" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="56" y1="24" x2="64" y2="24" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="56" y1="36" x2="64" y2="36" stroke="#6366f1" strokeWidth="1.5" />
                        <line x1="56" y1="48" x2="64" y2="48" stroke="#6366f1" strokeWidth="1.5" />
                    </svg>
                </div>

                {/* Chip 2 — Violet (Mid Left) */}
                <div className="chip-float-2 absolute top-[45%] left-[5%] opacity-15 dark:opacity-20">
                    <svg width="54" height="54" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="12" width="32" height="32" rx="3" stroke="#8b5cf6" strokeWidth="1.5" />
                        <rect x="18" y="18" width="20" height="20" rx="2" stroke="#8b5cf6" strokeWidth="1" />
                        <line x1="18" y1="6" x2="18" y2="12" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="28" y1="6" x2="28" y2="12" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="38" y1="6" x2="38" y2="12" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="18" y1="44" x2="18" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="28" y1="44" x2="28" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="38" y1="44" x2="38" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="6" y1="18" x2="12" y2="18" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="6" y1="28" x2="12" y2="28" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="6" y1="38" x2="12" y2="38" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="44" y1="18" x2="50" y2="18" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="44" y1="28" x2="50" y2="28" stroke="#8b5cf6" strokeWidth="1.5" />
                        <line x1="44" y1="38" x2="50" y2="38" stroke="#8b5cf6" strokeWidth="1.5" />
                    </svg>
                </div>

                {/* Chip 3 — Cyan (Bottom Right) */}
                <div className="chip-float-3 absolute bottom-[18%] right-[10%] opacity-15 dark:opacity-20">
                    <svg width="60" height="60" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="50" height="50" rx="6" stroke="#06b6d4" strokeWidth="1.5" />
                        <rect x="30" y="30" width="30" height="30" rx="3" stroke="#06b6d4" strokeWidth="1" />
                        <line x1="30" y1="10" x2="30" y2="20" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="45" y1="10" x2="45" y2="20" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="60" y1="10" x2="60" y2="20" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="30" y1="70" x2="30" y2="80" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="45" y1="70" x2="45" y2="80" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="60" y1="70" x2="60" y2="80" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="10" y1="30" x2="20" y2="30" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="10" y1="45" x2="20" y2="45" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="10" y1="60" x2="20" y2="60" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="70" y1="30" x2="80" y2="30" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="70" y1="45" x2="80" y2="45" stroke="#06b6d4" strokeWidth="1.5" />
                        <line x1="70" y1="60" x2="80" y2="60" stroke="#06b6d4" strokeWidth="1.5" />
                    </svg>
                </div>
            </div>

            {/* ── 6. CANVAS CONSTELLATION (Connected interactive particles) ── */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
            />
        </div>
    );
}
