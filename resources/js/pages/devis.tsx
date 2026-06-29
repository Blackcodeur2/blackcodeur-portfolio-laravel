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
import { Label } from '@/components/ui/label';
import devisRoute from '@/routes/devis';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    Download,
    FileText,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useState } from 'react';

interface ProjectListItem {
    id: number;
    name: string;
}

interface EnterpriseListItem {
    id: number;
    name: string;
}

interface DevisItem {
    id: number;
    project_id: number;
    content: string;
    document: string;
    created_at: string;
    project?: {
        id: number;
        name: string;
        enterprises?: EnterpriseListItem;
    };
}

interface Props {
    devis: DevisItem[];
    projects: ProjectListItem[];
}

export default function Devis({ devis, projects }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const form = useForm<{
        project_id: string;
        content: string;
        document: File | null;
    }>({
        project_id: '',
        content: '',
        document: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            form.setData('document', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/devis', {
            onSuccess: () => {
                form.reset();
                // Reset file input manually since browser files are read-only
                const fileInput = document.getElementById('devis-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
        });
    };

    const confirmDelete = () => {
        if (deletingId === null) return;
        router.delete(`/devis/${deletingId}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Helper to get file size/label or simply clean file path
    const getFileName = (path: string) => {
        return path.split('/').pop() || 'document.pdf';
    };

    return (
        <>
            <Head title="Devis & Estimations" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Devis & Estimations</h1>
                    <p className="text-muted-foreground">Télécharger et archiver les devis et factures de vos projets.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Upload Form */}
                    <div className="lg:col-span-1">
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UploadCloud className="h-5 w-5 text-indigo-500" />
                                    Stocker un devis
                                </CardTitle>
                                <CardDescription>Associez un document PDF ou Word à un projet existant.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="devis-project">Projet associé *</Label>
                                        <select 
                                            id="devis-project"
                                            value={form.data.project_id}
                                            onChange={e => form.setData('project_id', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                            required
                                        >
                                            <option value="" disabled className="dark:bg-zinc-950">Sélectionner un projet...</option>
                                            {projects.map(proj => (
                                                <option key={proj.id} value={proj.id} className="dark:bg-zinc-950">{proj.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.project_id && <p className="text-xs text-rose-500 mt-1">{form.errors.project_id}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="devis-content">Description du contenu *</Label>
                                        <textarea 
                                            id="devis-content" 
                                            placeholder="Ex: Devis initial pour la refonte web, Facture d'acompte 30%..."
                                            rows={3} 
                                            value={form.data.content} 
                                            onChange={e => form.setData('content', e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                            required
                                        />
                                        {form.errors.content && <p className="text-xs text-rose-500 mt-1">{form.errors.content}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="devis-file">Fichier Document *</Label>
                                        <div className="border border-dashed border-border/80 dark:border-border/40 rounded-lg p-4 bg-neutral-50/50 dark:bg-neutral-900/10 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800/10 transition-colors relative cursor-pointer group">
                                            <input 
                                                id="devis-file"
                                                type="file" 
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                required
                                            />
                                            <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-indigo-500 transition-colors mb-2" />
                                            <span className="text-xs font-medium text-foreground block truncate">
                                                {form.data.document ? form.data.document.name : "Glissez ou cliquez pour choisir un fichier"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground mt-1 block">
                                                PDF, Word, Excel (Max: 10 Mo)
                                            </span>
                                        </div>
                                        {form.errors.document && <p className="text-xs text-rose-500 mt-1">{form.errors.document}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={form.processing}>
                                        Télécharger le devis
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Listing Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-lg">Fichiers sauvegardés</CardTitle>
                                <CardDescription>Liste des estimations et documents rattachés aux projets.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {devis.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground border-t border-border/40">
                                        Aucun document de devis téléchargé pour le moment.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                                            <thead className="bg-neutral-50 dark:bg-neutral-800/40 text-xs font-semibold text-foreground border-b border-border/50">
                                                <tr>
                                                    <th className="p-4">Projet / Client</th>
                                                    <th className="p-4">Description</th>
                                                    <th className="p-4">Document</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/40">
                                                {devis.map(item => (
                                                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                        <td className="p-4 font-medium text-foreground">
                                                            <div className="space-y-0.5">
                                                                <div className="font-semibold text-sm">{item.project?.name || 'Projet inconnu'}</div>
                                                                {item.project?.enterprises && (
                                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                        <Building2 className="h-3 w-3 shrink-0" />
                                                                        {item.project.enterprises.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs font-normal">
                                                            <div className="line-clamp-2 max-w-[200px] leading-relaxed">
                                                                {item.content}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(item.created_at)}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <a 
                                                                href={`/storage/${item.document}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                                                                title="Visualiser le fichier"
                                                            >
                                                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                <span className="max-w-[120px] truncate">{getFileName(item.document)}</span>
                                                                <Download className="h-3 w-3" />
                                                            </a>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeletingId(item.id)}
                                                                className="h-8 w-8 hover:text-rose-500"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-border/40">
                            <AlertCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span>Les fichiers sont stockés dans le dossier public. Assurez-vous d'avoir exécuté <code>php artisan storage:link</code> localement.</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le devis</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer ce devis ? Le fichier physique sera également effacé. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingId(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Devis.layout = {
    breadcrumbs: [
        {
            title: 'Devis',
            href: devisRoute.index(),
        },
    ],
};
