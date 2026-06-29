import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import contactMessagesRoute from '@/routes/contact-messages';
import { Head, router } from '@inertiajs/react';
import {
    Mail,
    MailOpen,
    Trash2,
    CheckCircle2,
    Calendar,
    User,
    Inbox,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface ContactMessageItem {
    id: number;
    name: string;
    email: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface PaginatedMessages {
    data: ContactMessageItem[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    messages: PaginatedMessages;
    unreadCount: number;
}

export default function ContactMessagesIndex({ messages, unreadCount }: Props) {
    const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSelectMessage = (msg: ContactMessageItem) => {
        setSelectedMessage(msg);
        if (!msg.read_at) {
            router.patch(`/contact-messages/${msg.id}/read`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Update the local state read status if success
                    setSelectedMessage(prev => prev && prev.id === msg.id ? { ...prev, read_at: new Date().toISOString() } : prev);
                }
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingId) return;

        router.delete(`/contact-messages/${deletingId}`, {
            onSuccess: () => {
                if (selectedMessage?.id === deletingId) {
                    setSelectedMessage(null);
                }
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Messages reçus" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            Messages
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </h1>
                        <p className="text-muted-foreground">Consultez les messages reçus de la part des visiteurs de votre portfolio.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    {/* Left Pane: Message List */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader className="p-4 border-b border-border/40">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Inbox className="h-4 w-4 text-indigo-500" />
                                    Boîte de réception
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 divide-y divide-border/40 max-h-[60vh] overflow-y-auto">
                                {messages.data.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Mail className="h-10 w-10 mx-auto opacity-30 mb-2" />
                                        <p className="text-sm font-medium">Aucun message reçu</p>
                                    </div>
                                ) : (
                                    messages.data.map((msg) => (
                                        <div
                                            key={msg.id}
                                            onClick={() => handleSelectMessage(msg)}
                                            className={`p-4 cursor-pointer transition-all duration-200 flex items-start gap-3 select-none hover:bg-neutral-50 dark:hover:bg-zinc-900/60
                                                ${selectedMessage?.id === msg.id ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600' : ''}
                                                ${!msg.read_at ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                                            `}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {msg.read_at ? (
                                                    <MailOpen className="h-4 w-4 text-muted-foreground opacity-60" />
                                                ) : (
                                                    <Mail className="h-4 w-4 text-indigo-500 animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <p className="text-xs truncate font-medium text-foreground">{msg.name}</p>
                                                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                                <p className="text-xs font-semibold truncate text-muted-foreground/80 mb-1">{msg.email}</p>
                                                <p className="text-xs line-clamp-2 text-muted-foreground/60">{msg.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Pagination Row */}
                        {messages.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                                <div>
                                    Page {messages.current_page} sur {messages.last_page}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!messages.prev_page_url}
                                        onClick={() => router.get(messages.prev_page_url || '')}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!messages.next_page_url}
                                        onClick={() => router.get(messages.next_page_url || '')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Message Reader */}
                    <div className="lg:col-span-7">
                        {selectedMessage ? (
                            <Card className="border-border/60 shadow-xs h-full flex flex-col">
                                <CardHeader className="border-b border-border/40 p-4 sm:p-6 flex flex-row items-start justify-between gap-4">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2 leading-tight">
                                            <User className="h-4 w-4 text-indigo-500 shrink-0" />
                                            <span className="truncate">{selectedMessage.name}</span>
                                        </CardTitle>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 pt-1">
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedMessage.email}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(selectedMessage.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-rose-500 h-8 w-8"
                                        onClick={() => setDeletingId(selectedMessage.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
                                    {selectedMessage.message}
                                </CardContent>
                                {selectedMessage.read_at && (
                                    <div className="px-6 py-4 bg-neutral-50/50 dark:bg-zinc-900/50 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground rounded-b-xl">
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Lu le {formatDate(selectedMessage.read_at)}
                                        </span>
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card className="border-border/60 shadow-xs h-[300px] flex items-center justify-center text-center p-6">
                                <div className="space-y-2">
                                    <Mail className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
                                    <h3 className="font-bold text-foreground">Aucun message sélectionné</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm">Choisissez un message dans la liste à gauche pour en afficher le contenu complet.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer définitivement ce message de contact ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-4">
                        <Button variant="outline" onClick={() => setDeletingId(null)}>Annuler</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ContactMessagesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Messages',
            href: contactMessagesRoute.index(),
        },
    ],
};
