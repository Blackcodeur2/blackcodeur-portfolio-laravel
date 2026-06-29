import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground transition-colors duration-300">
            {/* Left Column - Decorative Panel */}
            <div className="relative hidden h-full flex-col bg-zinc-950 p-10 text-white lg:flex border-r border-zinc-800 overflow-hidden">
                {/* Modern Mesh Gradient + Blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 z-0" />
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/15 blur-[120px]" />
                
                {/* Dotted pattern overlay */}
                <div 
                    className="absolute inset-0 opacity-10" 
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold tracking-tight gap-2"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                        {name}
                    </span>
                </Link>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-4">
                        <p className="text-xl font-medium leading-relaxed text-zinc-100/90 tracking-tight">
                            "Cette plateforme a complètement transformé ma gestion de leads issus de Google Maps et le suivi de mes projets clients. Un gain de temps inestimable."
                        </p>
                        <footer className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                                BC
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-zinc-200">Black_codeur</div>
                                <div className="text-xs text-zinc-400">Fullstack Engineer & Founder</div>
                            </div>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:p-8 relative z-10 flex flex-col justify-center min-h-dvh">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[360px] p-6 rounded-2xl bg-card border border-border/70 dark:border-border/40 backdrop-blur-xs shadow-md lg:shadow-none lg:border-none lg:bg-transparent">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden mb-4"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                            <AppLogoIcon className="h-6 w-6 fill-current text-white dark:text-black" />
                        </div>
                    </Link>
                    
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
