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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import categoriesRoute from '@/routes/categories';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Tags,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface CategoryItem {
    id: number;
    name: string;
    description: string | null;
    enterprises_count: number;
}

interface PaginatedCategories {
    data: CategoryItem[];
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
    categories: PaginatedCategories;
    filters: {
        search?: string;
    };
}

export default function Categories({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

    // Form for create/update
    const form = useForm({
        name: '',
        description: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/categories', { search }, { preserveState: true, replace: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/categories', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const handleEditClick = (cat: CategoryItem) => {
        setEditingCategory(cat);
        form.setData({
            name: cat.name,
            description: cat.description || '',
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        form.put(`/categories/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
                form.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingCategory) return;

        router.delete(`/categories/${deletingCategory.id}`, {
            onSuccess: () => {
                setDeletingCategory(null);
            },
        });
    };

    return (
        <>
            <Head title="Catégories d'entreprises" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            Catégories
                        </h1>
                        <p className="text-muted-foreground">Gérez les secteurs d'activité de vos entreprises prospects.</p>
                    </div>

                    <Button 
                        onClick={() => { form.reset(); setIsCreateOpen(true); }}
                        className="sm:self-center gap-1.5 self-start"
                    >
                        <Plus className="h-4 w-4" /> Ajouter une catégorie
                    </Button>
                </div>

                {/* Filters card */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher une catégorie..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">Rechercher</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Table */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-0">
                        {categories.data.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <Tags className="h-12 w-12 mx-auto opacity-35 mb-3" />
                                <p className="font-semibold text-sm">Aucune catégorie trouvée</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-neutral-50/50 dark:bg-zinc-900/40 text-xs font-semibold text-muted-foreground uppercase">
                                            <th className="p-4">Nom de la catégorie</th>
                                            <th className="p-4">Description</th>
                                            <th className="p-4 text-center">Entreprises</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {categories.data.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                                <td className="p-4 font-bold text-foreground">{cat.name}</td>
                                                <td className="p-4 text-muted-foreground/80 max-w-md truncate">{cat.description || '-'}</td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                                        {cat.enterprises_count}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditClick(cat)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingCategory(cat)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Row */}
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
                        <div>
                            Page <span className="font-semibold text-foreground">{categories.current_page}</span> sur <span className="font-semibold text-foreground">{categories.last_page}</span> ({categories.total} résultats)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!categories.prev_page_url}
                                onClick={() => router.get(categories.prev_page_url || '')}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!categories.next_page_url}
                                onClick={() => router.get(categories.next_page_url || '')}
                            >
                                Suivant <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => !open && setIsCreateOpen(false)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ajouter une catégorie</DialogTitle>
                        <DialogDescription>Créez un nouveau secteur d'activité pour classer vos entreprises prospects.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Nom de la catégorie *</Label>
                            <Input
                                id="create-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-desc">Description</Label>
                            <textarea
                                id="create-desc"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                            />
                            {form.errors.description && <p className="text-xs text-rose-500">{form.errors.description}</p>}
                        </div>
                        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                            <Button type="submit" disabled={form.processing}>Créer la catégorie</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editingCategory !== null} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifier la catégorie</DialogTitle>
                        <DialogDescription>Mettre à jour les informations du secteur d'activité.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nom de la catégorie *</Label>
                            <Input
                                id="edit-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-desc">Description</Label>
                            <textarea
                                id="edit-desc"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                            />
                            {form.errors.description && <p className="text-xs text-rose-500">{form.errors.description}</p>}
                        </div>
                        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>Annuler</Button>
                            <Button type="submit" disabled={form.processing}>Enregistrer les modifications</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deletingCategory !== null} onOpenChange={(open) => !open && setDeletingCategory(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-5 w-5" />
                            Attention : Cascade de suppression
                        </DialogTitle>
                        <DialogDescription className="space-y-2 pt-2 text-sm">
                            <p>
                                Êtes-vous sûr de vouloir supprimer définitivement la catégorie{' '}
                                <strong className="text-foreground">"{deletingCategory?.name}"</strong> ?
                            </p>
                            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl space-y-1 text-xs">
                                <p className="font-bold">Cette action supprimera également :</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Les entreprises associées ({deletingCategory?.enterprises_count})</li>
                                    <li>Tous les projets, devis et images rattachés</li>
                                </ul>
                            </div>
                            <p className="text-muted-foreground text-xs">Cette action est irréversible.</p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-4">
                        <Button variant="outline" onClick={() => setDeletingCategory(null)}>Annuler</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Supprimer définitivement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Categories.layout = {
    breadcrumbs: [
        {
            title: 'Catégories',
            href: categoriesRoute.index(),
        },
    ],
};
