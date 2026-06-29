import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export function Toaster() {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        if (flash?.success) {
            addToast(flash.success, 'success');
            // Clear the flash message in Laravel by modifying state or let Inertia handle it on next visit
        }
        if (flash?.error) {
            addToast(flash.error, 'error');
        }
    }, [flash]);

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 scale-100 animate-in slide-in-from-bottom-5 fade-in duration-200
                        ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                        }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 text-sm font-medium leading-normal break-words pr-2">
                        {toast.message}
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
