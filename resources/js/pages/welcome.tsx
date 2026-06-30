import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { 
    Building2, 
    CheckCircle2, 
    ArrowRight, 
    Phone, 
    Mail, 
    MapPin, 
    ExternalLink, 
    Layers, 
    Image as ImageIcon,
    FolderGit2,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    MessageSquare,
    Sun,
    Moon,
    Monitor
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface Project {
    id: number;
    name: string;
    description: string;
    is_finished: boolean;
    public_link?: string;
    github_link?: string;
    logo?: string;
    enterprises?: {
        name: string;
        address: string;
    };
}

interface GalleryItem {
    id: number;
    image_item: string;
    description?: string;
    project?: {
        name: string;
    };
}

interface Stats {
    enterprises_count: number;
    projects_count: number;
    projects_finished: number;
}

interface PortfolioProfile {
    id: number;
    name: string;
    email: string;
    telephone: string;
    birth_date: string;
    sexe: 'M' | 'F';
    bio: string | null;
    profile_picture: string | null;
    skills: string | null;
    education: string | null;
}

interface Props {
    projects: Project[];
    gallery: GalleryItem[];
    stats: Stats;
    profile?: PortfolioProfile | null;
}

// Scroll-reveal: adds .visible to elements with .sr class when they enter the viewport
function useScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.sr');
        if (!els.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

export default function Welcome({ projects, gallery, stats, profile }: Props) {
    const { auth } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const contactForm = useForm({
        name: '',
        email: '',
        message: '',
    });

    useScrollReveal();

    const submitContact = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                setFormSubmitted(true);
                contactForm.reset();
            },
        });
    };

    // Cycle through: light → dark → system
    const cycleTheme = () => {
        if (appearance === 'light') updateAppearance('dark');
        else if (appearance === 'dark') updateAppearance('system');
        else updateAppearance('light');
    };

    // Track scroll to change header appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lightbox actions
    const openLightbox = (idx: number) => setLightboxIndex(idx);
    const closeLightbox = () => setLightboxIndex(null);

    const prevImage = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : null));
    }, [lightboxIndex, gallery.length]);

    const nextImage = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % gallery.length : null));
    }, [lightboxIndex, gallery.length]);

    // Keydown hooks
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, prevImage, nextImage]);

    return (
        <>
            <Head title="Portfolio & Projets" />
            
            <div className="relative min-h-screen bg-neutral-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 overflow-x-hidden">
                <style>{`
                    @keyframes grid-slide {
                        0% { background-position: 0 0; }
                        100% { background-position: 40px 40px; }
                    }
                    @keyframes float-orb-1 {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(40px, -60px) scale(1.1); }
                        66% { transform: translate(-30px, 30px) scale(0.95); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    @keyframes float-orb-2 {
                        0% { transform: translate(0px, 0px) scale(1); }
                        50% { transform: translate(-50px, 70px) scale(1.15); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    @keyframes float-orb-3 {
                        0% { transform: translate(0px, 0px) scale(1); }
                        50% { transform: translate(60px, 30px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    @keyframes line-flow {
                        0% { stroke-dashoffset: 400; }
                        100% { stroke-dashoffset: 0; }
                    }
                    @keyframes node-pulse {
                        0%, 100% { opacity: 0.25; r: 3; }
                        50% { opacity: 0.7; r: 4.5; }
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
                        50% { transform: translateY(-12px) rotate(4deg); }
                    }
                    .tech-grid {
                        background-size: 40px 40px;
                        background-image:
                            linear-gradient(to right, rgba(99, 102, 241, 0.035) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.035) 1px, transparent 1px);
                        animation: grid-slide 24s linear infinite;
                    }
                    .dark .tech-grid {
                        background-image:
                            linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px);
                    }
                    .animate-orb-1 { animation: float-orb-1 28s ease-in-out infinite; }
                    .animate-orb-2 { animation: float-orb-2 32s ease-in-out infinite; }
                    .animate-orb-3 { animation: float-orb-3 36s ease-in-out infinite; }
                    .node-pulse { animation: node-pulse 4s ease-in-out infinite; }
                    .node-pulse-slow { animation: node-pulse 6s ease-in-out infinite; animation-delay: 1.5s; }
                    .node-pulse-xslow { animation: node-pulse 8s ease-in-out infinite; animation-delay: 3s; }
                    .chip-float-1 { animation: chip-float-1 7s ease-in-out infinite; }
                    .chip-float-2 { animation: chip-float-2 9s ease-in-out infinite; animation-delay: 2s; }
                    .chip-float-3 { animation: chip-float-3 11s ease-in-out infinite; animation-delay: 4s; }

                    /* ── Scroll Reveal System ── */
                    @keyframes reveal-up {
                        from { opacity: 0; transform: translateY(40px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes reveal-left {
                        from { opacity: 0; transform: translateX(-48px); }
                        to   { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes reveal-right {
                        from { opacity: 0; transform: translateX(48px); }
                        to   { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes reveal-zoom {
                        from { opacity: 0; transform: scale(0.88); }
                        to   { opacity: 1; transform: scale(1); }
                    }
                    /* Initial hidden state */
                    .sr { opacity: 0; }
                    /* Triggered state */
                    .sr.visible {
                        animation-fill-mode: both;
                        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                        animation-duration: 0.7s;
                    }
                    .sr.visible.sr-up    { animation-name: reveal-up; }
                    .sr.visible.sr-left  { animation-name: reveal-left; }
                    .sr.visible.sr-right { animation-name: reveal-right; }
                    .sr.visible.sr-zoom  { animation-name: reveal-zoom; }
                    /* Stagger delays for children */
                    .sr.visible.sr-d1 { animation-delay: 0.05s; }
                    .sr.visible.sr-d2 { animation-delay: 0.12s; }
                    .sr.visible.sr-d3 { animation-delay: 0.20s; }
                    .sr.visible.sr-d4 { animation-delay: 0.28s; }
                    .sr.visible.sr-d5 { animation-delay: 0.36s; }
                    .sr.visible.sr-d6 { animation-delay: 0.44s; }
                    /* Respect reduced-motion preference */
                    @media (prefers-reduced-motion: reduce) {
                        .sr { opacity: 1 !important; animation: none !important; }
                    }
                `}</style>

                {/* ── BACKGROUND ORNAMENTS (Tech & Dynamic) ── */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                    {/* Sliding Tech Grid */}
                    <div className="absolute inset-0 tech-grid opacity-80" />

                    {/* Glowing Orbs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] animate-orb-1" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[150px] animate-orb-2" />
                    <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-sky-500/8 dark:bg-sky-500/3 blur-[100px] animate-orb-3" />

                    {/* Dotted/Grid Intersections (subtle tech motif) */}
                    <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />

                    {/* Animated Tech Lines — Circuit Board Style */}
                    <svg className="absolute w-full h-full text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <defs>
                            <style>{`
                                .tl1 { animation: line-flow 18s linear infinite; }
                                .tl2 { animation: line-flow 24s linear infinite reverse; }
                                .tl3 { animation: line-flow 14s linear infinite; }
                                .tl4 { animation: line-flow 20s linear infinite reverse; }
                                .tl5 { animation: line-flow 30s linear infinite; }
                            `}</style>
                        </defs>

                        {/* Horizontal circuit traces */}
                        <path d="M -200,180 L 300,180 L 380,240 L 780,240 L 860,180 L 2000,180"
                            fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="12 8" opacity="0.18" className="tl1" />
                        <path d="M -200,520 L 250,520 L 330,460 L 850,460 L 930,520 L 2000,520"
                            fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 10" opacity="0.12" className="tl2" />
                        <path d="M -200,920 L 400,920 L 480,860 L 1000,860 L 1080,920 L 2000,920"
                            fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="14 6" opacity="0.15" className="tl3" />
                        <path d="M -200,1380 L 350,1380 L 430,1320 L 920,1320 L 1000,1380 L 2000,1380"
                            fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 8" opacity="0.1" className="tl4" />
                        <path d="M -200,1800 L 500,1800 L 580,1740 L 1100,1740 L 1180,1800 L 2200,1800"
                            fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 10" opacity="0.08" className="tl5" />

                        {/* Vertical accent traces */}
                        <path d="M 220,0 L 220,280 L 300,360 L 300,700 L 220,780 L 220,2000"
                            fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 8" opacity="0.1" className="tl2" />
                        <path d="M 680,0 L 680,140 L 760,220 L 760,600 L 680,680 L 680,2000"
                            fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="8 12" opacity="0.08" className="tl4" />
                        <path d="M 1200,0 L 1200,380 L 1120,460 L 1120,900 L 1200,980 L 1200,2000"
                            fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="12 8" opacity="0.12" className="tl1" />

                        {/* Circuit node dots — animated pulses at key intersections */}
                        <circle cx="300" cy="180" r="3" fill="currentColor" className="node-pulse" />
                        <circle cx="780" cy="240" r="3" fill="currentColor" className="node-pulse-slow" />
                        <circle cx="330" cy="520" r="2.5" fill="currentColor" className="node-pulse" style={{ animationDelay: '1s' }} />
                        <circle cx="850" cy="460" r="2.5" fill="currentColor" className="node-pulse-xslow" />
                        <circle cx="480" cy="920" r="3" fill="currentColor" className="node-pulse" style={{ animationDelay: '2s' }} />
                        <circle cx="1000" cy="860" r="3" fill="currentColor" className="node-pulse-slow" style={{ animationDelay: '0.5s' }} />
                        <circle cx="430" cy="1380" r="2" fill="currentColor" className="node-pulse-xslow" style={{ animationDelay: '1.5s' }} />
                        <circle cx="920" cy="1320" r="2" fill="currentColor" className="node-pulse" style={{ animationDelay: '3s' }} />
                        <circle cx="220" cy="360" r="3" fill="currentColor" className="node-pulse-slow" style={{ animationDelay: '2.5s' }} />
                        <circle cx="760" cy="220" r="2.5" fill="currentColor" className="node-pulse" style={{ animationDelay: '1.8s' }} />
                        <circle cx="1120" cy="460" r="3" fill="currentColor" className="node-pulse-slow" style={{ animationDelay: '0.8s' }} />
                    </svg>
                </div>

                {/* ── FLOATING TECH CHIPS ── */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
                    {/* Chip 1 — top right */}
                    <div className="chip-float-1 absolute top-[12%] right-[8%] opacity-[0.07] dark:opacity-[0.10]">
                        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="16" y="16" width="40" height="40" rx="4" stroke="#6366f1" strokeWidth="1.5"/>
                            <rect x="24" y="24" width="24" height="24" rx="2" stroke="#6366f1" strokeWidth="1"/>
                            <line x1="24" y1="8" x2="24" y2="16" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="36" y1="8" x2="36" y2="16" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="48" y1="8" x2="48" y2="16" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="24" y1="56" x2="24" y2="64" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="36" y1="56" x2="36" y2="64" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="48" y1="56" x2="48" y2="64" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="8" y1="24" x2="16" y2="24" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="8" y1="36" x2="16" y2="36" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="8" y1="48" x2="16" y2="48" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="56" y1="24" x2="64" y2="24" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="56" y1="36" x2="64" y2="36" stroke="#6366f1" strokeWidth="1.5"/>
                            <line x1="56" y1="48" x2="64" y2="48" stroke="#6366f1" strokeWidth="1.5"/>
                        </svg>
                    </div>
                    {/* Chip 2 — mid left */}
                    <div className="chip-float-2 absolute top-[40%] left-[4%] opacity-[0.06] dark:opacity-[0.09]">
                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="12" y="12" width="32" height="32" rx="3" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <rect x="18" y="18" width="20" height="20" rx="2" stroke="#8b5cf6" strokeWidth="1"/>
                            <line x1="18" y1="6" x2="18" y2="12" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="28" y1="6" x2="28" y2="12" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="38" y1="6" x2="38" y2="12" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="18" y1="44" x2="18" y2="50" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="28" y1="44" x2="28" y2="50" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="38" y1="44" x2="38" y2="50" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="6" y1="18" x2="12" y2="18" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="6" y1="28" x2="12" y2="28" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="6" y1="38" x2="12" y2="38" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="44" y1="18" x2="50" y2="18" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="44" y1="28" x2="50" y2="28" stroke="#8b5cf6" strokeWidth="1.5"/>
                            <line x1="44" y1="38" x2="50" y2="38" stroke="#8b5cf6" strokeWidth="1.5"/>
                        </svg>
                    </div>
                    {/* Chip 3 — bottom left */}
                    <div className="chip-float-3 absolute bottom-[20%] right-[12%] opacity-[0.05] dark:opacity-[0.08]">
                        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="20" y="20" width="50" height="50" rx="6" stroke="#06b6d4" strokeWidth="1.5"/>
                            <rect x="30" y="30" width="30" height="30" rx="3" stroke="#06b6d4" strokeWidth="1"/>
                            <line x1="30" y1="10" x2="30" y2="20" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="45" y1="10" x2="45" y2="20" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="60" y1="10" x2="60" y2="20" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="30" y1="70" x2="30" y2="80" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="45" y1="70" x2="45" y2="80" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="60" y1="70" x2="60" y2="80" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="10" y1="30" x2="20" y2="30" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="10" y1="45" x2="20" y2="45" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="10" y1="60" x2="20" y2="60" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="70" y1="30" x2="80" y2="30" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="70" y1="45" x2="80" y2="45" stroke="#06b6d4" strokeWidth="1.5"/>
                            <line x1="70" y1="60" x2="80" y2="60" stroke="#06b6d4" strokeWidth="1.5"/>
                        </svg>
                    </div>
                </div>

                {/* ── HEADER ── */}
                <header 
                    className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b 
                        ${scrolled 
                            ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-3 shadow-xs border-neutral-200 dark:border-zinc-800' 
                            : 'bg-transparent py-5 border-transparent'
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
                                <Layers className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                                Portfolio-Nguefack
                            </span>
                        </div>

                        {/* Mid Navigation */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                            <a href="#about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">À propos</a>
                            {profile && (profile.skills || profile.education) && (
                                <a href="#skills-education" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cursus</a>
                            )}
                            <a href="#stats" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Chiffres</a>
                            <a href="#projects" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Projets</a>
                            <a href="#gallery" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Galerie</a>
                            <a href="#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a>
                        </nav>

                        {/* Right: Theme Toggle + Auth */}
                        <div className="flex items-center gap-3">
                            {/* Theme toggle button */}
                            <button
                                id="theme-toggle"
                                onClick={cycleTheme}
                                title={appearance === 'light' ? 'Passer en mode sombre' : appearance === 'dark' ? 'Passer en mode système' : 'Passer en mode clair'}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-xs"
                            >
                                {appearance === 'light' && <Sun className="h-4 w-4" />}
                                {appearance === 'dark' && <Moon className="h-4 w-4" />}
                                {appearance === 'system' && <Monitor className="h-4 w-4" />}
                            </button>

                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all duration-200"
                                >
                                    Dashboard
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all duration-200"
                                    >
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── HERO SECTION ── */}
                <section id="about" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-linear-to-b from-indigo-500/5 via-transparent to-transparent">
                    {/* Decorative Background Blobs */}
                    <div className="absolute top-20 right-0 -z-10 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
                    <div className="absolute top-40 left-10 -z-10 h-64 w-64 rounded-full bg-violet-600/5 blur-3xl" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {profile ? (
                            <div className="grid gap-12 lg:grid-cols-12 items-center text-left">
                                {/* Left Side: Text Details */}
                                <div className="lg:col-span-7 space-y-6 sr sr-left">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 px-3 py-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Développeur Fullstack
                                    </span>
                                    
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                                        Bonjour, je suis<br />
                                        <span className="bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                            {profile.name}
                                        </span>
                                    </h1>

                                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                                        {profile.bio || "Découvrez mon portfolio de projets réalisés pour les entreprises et artisans recensés sur Google Maps. Devis optimisés, suivis de chantiers clairs, et réalisations de haute qualité."}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                                        <a
                                            href="#projects"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:translate-y-[px] active:translate-y-0 transition-all duration-200"
                                        >
                                            Voir mes projets
                                            <ArrowRight className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="#contact"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-foreground px-6 py-3.5 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-all duration-200"
                                        >
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Me contacter
                                        </a>
                                    </div>
                                </div>

                                {/* Right Side: Circular Glassmorphic Profile Pic */}
                                <div className="lg:col-span-5 flex justify-center lg:justify-end sr sr-right">
                                    <div className="relative group">
                                        {/* Glow effect */}
                                        <div className="absolute -inset-1.5 bg-linear-to-r from-indigo-600 to-violet-600 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition duration-300" />
                                        <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl bg-neutral-100 dark:bg-zinc-800">
                                            {profile.profile_picture ? (
                                                <img
                                                    src={`/storage/${profile.profile_picture}`}
                                                    alt={profile.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Briefcase className="h-20 w-20 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center sr sr-up">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    Réalisations & Projets
                                </span>
                                
                                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
                                    Suivi des Chantiers &<br />
                                    <span className="bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                        Projets Entreprises
                                    </span>
                                </h1>

                                <p className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10">
                                    Découvrez notre portfolio de projets réalisés pour les entreprises et artisans recensés sur Google Maps. Devis optimisés, suivis de chantiers clairs, et réalisations de haute qualité.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <a
                                        href="#projects"
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:translate-y-[px] active:translate-y-0 transition-all duration-200"
                                    >
                                        Voir les projets
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <a
                                        href="#contact"
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-neutral-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-foreground px-6 py-3.5 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-all duration-200"
                                    >
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Nous contacter
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── STATS SECTION ── */}
                <section id="stats" className="py-12 border-y border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-x divide-neutral-200 dark:divide-zinc-800">
                            <div className="sr sr-zoom sr-d1">
                                <p className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 leading-none mb-2">
                                    {stats.enterprises_count}
                                </p>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Entreprises recensées
                                </p>
                            </div>
                            <div className="sr sr-zoom sr-d3">
                                <p className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 leading-none mb-2">
                                    {stats.projects_finished}
                                </p>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Chantiers terminés
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-1 sr sr-zoom sr-d5">
                                <p className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 leading-none mb-2">
                                    {stats.projects_count - stats.projects_finished}
                                </p>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Projets en cours
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SKILLS & EDUCATION SECTION ── */}
                {profile && (profile.skills || profile.education) && (
                    <section id="skills-education" className="py-20 md:py-28 bg-neutral-100/50 dark:bg-zinc-900/10 border-b border-neutral-200 dark:border-zinc-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid gap-16 lg:grid-cols-2">
                                {/* Left: Skills */}
                                {profile.skills && (
                                    <div className="space-y-6 sr sr-left">
                                        <h2 className="text-3xl font-extrabold tracking-tight">
                                            Mes Compétences
                                        </h2>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            Voici un aperçu des technologies et outils que j'utilise au quotidien pour concevoir des applications performantes.
                                        </p>
                                        <div className="flex flex-wrap gap-2.5 pt-2">
                                            {profile.skills.split(',').map(s => s.trim()).filter(s => s.length > 0).map((skill, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="inline-flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 px-4 py-2 text-xs font-semibold shadow-xs hover:border-indigo-500 dark:hover:border-indigo-400 hover:scale-[1.02] transition-all duration-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Right: Education/Timeline */}
                                {profile.education && (
                                    <div className="space-y-6 sr sr-right">
                                        <h2 className="text-3xl font-extrabold tracking-tight">
                                            Cursus & Expérience
                                        </h2>
                                        <div className="relative border-l border-neutral-200 dark:border-zinc-800 ml-2.5 pl-6 space-y-8">
                                            {profile.education.split('\n').filter(line => line.trim().length > 0).map((line, idx) => {
                                                const parts = line.split(':');
                                                const time = parts.length >= 2 ? parts[0].trim() : '';
                                                const desc = parts.length >= 2 ? parts.slice(1).join(':').trim() : line.trim();
                                                return (
                                                    <div key={idx} className="relative group">
                                                        {/* Icon/Bullet */}
                                                        <div className="absolute -left-7.75 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-zinc-950 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 transition-colors duration-200" />
                                                        
                                                        {time && (
                                                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 tracking-wider uppercase">
                                                                {time}
                                                            </div>
                                                        )}
                                                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed">
                                                            {desc}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── PROJECTS PORTFOLIO ── */}
                <section id="projects" className="py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16 sr sr-up">
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                                Nos Projets Récents
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Découvrez les derniers projets initiés pour nos partenaires. Chaque projet témoigne d'un accompagnement personnalisé.
                            </p>
                        </div>

                        {projects.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800">
                                <FolderGit2 className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 font-medium">Aucun projet à afficher pour le moment</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project, idx) => (
                                    <article
                                        key={project.id}
                                        className={`sr sr-up sr-d${Math.min(idx % 3 + 1, 6)} group relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:translate-y-[0.5]`}
                                    >
                                        {project.logo && (
                                            <div className="relative h-48 w-full bg-neutral-100 dark:bg-zinc-800">
                                                <img
                                                    src={project.logo}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            {/* Badge status */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border
                                                    ${project.is_finished 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                                                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {project.is_finished ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Terminé
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            En cours
                                                        </>
                                                    )}
                                                </span>
                                                
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {project.enterprises?.name || 'Artisan Local'}
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {project.name}
                                            </h3>

                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                                                {project.description || "Aucune description fournie pour ce projet."}
                                            </p>
                                        </div>

                                        <div className="px-6 pb-6 pt-4 border-t border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
                                            {project.enterprises && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{project.enterprises.address}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 shrink-0">
                                                {project.public_link && (
                                                    <a 
                                                        href={project.public_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors"
                                                        title="Visiter le site"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── PHOTO GALLERY ── */}
                <section id="gallery" className="py-20 md:py-28 border-t border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16 sr sr-up">
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                                Galerie des Réalisations
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Un aperçu en images de nos chantiers, produits ou refontes d'enseignes d'entreprises locales.
                            </p>
                        </div>

                        {gallery.length === 0 ? (
                            <div className="text-center py-16 bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-neutral-200 dark:border-zinc-800">
                                <ImageIcon className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 font-medium">Aucun visuel disponible dans la galerie publique</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {gallery.map((item, idx) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => openLightbox(idx)}
                                        className={`sr sr-zoom sr-d${Math.min((idx % 4) + 1, 6)} group relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-square cursor-zoom-in border border-neutral-200 dark:border-zinc-800 hover:border-indigo-500/50 shadow-xs hover:shadow-lg transition-all duration-300`}
                                    >
                                        <img 
                                            src={`/storage/${item.image_item}`} 
                                            alt={item.description ?? 'Réalisation'} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                                            {item.project && (
                                                <p className="text-white text-xs font-semibold truncate">
                                                    {item.project.name}
                                                </p>
                                            )}
                                            {item.description && (
                                                <p className="text-white/70 text-[10px] truncate mt-0.5">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── CONTACT SECTION ── */}
                <section id="contact" className="py-20 md:py-28 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-2">
                            <div className="sr sr-left">
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                                    Une question ? Un projet ?
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg">
                                    N'hésitez pas à nous contacter pour toute demande de renseignement ou pour solliciter un devis de réalisation.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Téléphone</p>
                                            <a href={`tel:${profile?.telephone ?? '+33102030405'}`} className="text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400">
                                                {profile?.telephone ?? '+33 (0)1 02 03 04 05'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Email</p>
                                            <a href={`mailto:${profile?.email ?? 'contact@larareact-maps.com'}`} className="text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400">
                                                {profile?.email ?? 'contact@larareact-maps.com'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Localisation</p>
                                            <p className="text-sm font-semibold">
                                                Paris, France
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simple beautiful static contact form/mockup */}
                            <div className="sr sr-right bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    Envoyer un message
                                </h3>
                                
                                {formSubmitted ? (
                                    <div className="p-6 text-center bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-2">
                                        <CheckCircle2 className="h-8 w-8 mx-auto text-indigo-600 dark:text-indigo-400" />
                                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Message simulé envoyé avec succès !</p>
                                        <p className="text-xs text-muted-foreground">Merci pour votre intérêt. Les mails réels ne sont pas actifs sur cette démo.</p>
                                        <button 
                                            onClick={() => setFormSubmitted(false)}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-2"
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={submitContact} className="space-y-4">
                                        <div className="grid gap-2">
                                            <label className="text-xs font-semibold" htmlFor="contact-name">Nom complet</label>
                                            <input 
                                                id="contact-name" 
                                                type="text" 
                                                placeholder="Votre nom..." 
                                                value={contactForm.data.name}
                                                onChange={e => contactForm.setData('name', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                                                required 
                                            />
                                            {contactForm.errors.name && (
                                                <p className="text-xs text-rose-500">{contactForm.errors.name}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-xs font-semibold" htmlFor="contact-email">Email</label>
                                            <input 
                                                id="contact-email" 
                                                type="email" 
                                                placeholder="votre@email.com" 
                                                value={contactForm.data.email}
                                                onChange={e => contactForm.setData('email', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                                                required 
                                            />
                                            {contactForm.errors.email && (
                                                <p className="text-xs text-rose-500">{contactForm.errors.email}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-xs font-semibold" htmlFor="contact-msg">Message</label>
                                            <textarea 
                                                id="contact-msg" 
                                                placeholder="Décrivez votre besoin..." 
                                                rows={4}
                                                value={contactForm.data.message}
                                                onChange={e => contactForm.setData('message', e.target.value)}
                                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                                                required 
                                            />
                                            {contactForm.errors.message && (
                                                <p className="text-xs text-rose-500">{contactForm.errors.message}</p>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={contactForm.processing}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 font-semibold text-xs transition-colors shadow-md shadow-indigo-600/15 disabled:opacity-50"
                                        >
                                            {contactForm.processing ? 'Envoi...' : 'Envoyer le message'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="border-t border-neutral-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
                        <p>© {new Date().getFullYear()} {profile?.name ?? 'Portfolio Pro'}. Tous droits réservés.</p>
                        <div className="flex gap-6">
                            <a href="#about" className="hover:text-foreground">À propos</a>
                            <a href="#projects" className="hover:text-foreground">Projets</a>
                            <a href="#gallery" className="hover:text-foreground">Galerie</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ── LIGHTBOX ── */}
            {lightboxIndex !== null && gallery[lightboxIndex] && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={closeLightbox}
                >
                    <button 
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {lightboxIndex + 1} / {gallery.length}
                    </div>

                    {gallery.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    <div 
                        className="relative max-w-5xl max-h-[80vh] mx-16 flex flex-col items-center gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <img 
                            src={`/storage/${gallery[lightboxIndex].image_item}`} 
                            alt={gallery[lightboxIndex].description ?? 'Réalisation'} 
                            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />
                        <div className="text-center">
                            {gallery[lightboxIndex].project && (
                                <p className="text-white font-bold text-sm">{gallery[lightboxIndex].project.name}</p>
                            )}
                            {gallery[lightboxIndex].description && (
                                <p className="text-white/70 text-xs mt-1">{gallery[lightboxIndex].description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
