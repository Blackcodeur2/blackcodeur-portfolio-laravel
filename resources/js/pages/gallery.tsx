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
import { index as galleryIndex, destroy as galleryDestroy } from '@/routes/gallery';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Image as ImageIcon,
    ImagePlus,
    Loader2,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectListItem {
    id: number;
    name: string;
}

interface EnterpriseListItem {
    id: number;
    name: string;
}

interface GalleryItem {
    id: number;
    project_id: number;
    description: string | null;
    image_item: string;
    created_at: string;
    project?: {
        id: number;
        name: string;
        enterprises?: EnterpriseListItem;
    };
}

interface Props {
    galleries: GalleryItem[];
    projects: ProjectListItem[];
}

export default function Gallery({ galleries, projects }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [filterProjectId, setFilterProjectId] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lightboxRef = useRef<HTMLDivElement>(null);

    const form = useForm<{
        project_id: string;
        description: string;
        image_item: File | null;
    }>({
        project_id: '',
        description: '',
        image_item: null,
    });

    // Filtered galleries based on project selector
    const filteredGalleries = filterProjectId
        ? galleries.filter((g) => String(g.project_id) === filterProjectId)
        : galleries;

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        form.setData('image_item', file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/gallery', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const confirmDelete = () => {
        if (deletingId === null) return;
        router.delete(galleryDestroy.url(deletingId), {
            onFinish: () => setDeletingId(null),
        });
    };

    // Lightbox navigation
    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goToPrev = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex - 1 + filteredGalleries.length) % filteredGalleries.length);
    }, [lightboxIndex, filteredGalleries.length]);

    const goToNext = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + 1) % filteredGalleries.length);
    }, [lightboxIndex, filteredGalleries.length]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIndex, goToPrev, goToNext]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const currentLightboxItem = lightboxIndex !== null ? filteredGalleries[lightboxIndex] : null;

    return (
        <>
            <Head title="Galerie des Projets" />

            <div className="flex flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Galerie des Projets</h1>
                    <p className="text-muted-foreground">
                        Centralisez et visualisez les visuels de vos chantiers et réalisations.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* ── Left: Upload Form ── */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="border-border/60 shadow-xs">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ImagePlus className="h-5 w-5 text-indigo-500" />
                                    Ajouter une image
                                </CardTitle>
                                <CardDescription>
                                    Associez une photo ou capture d'écran à un projet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Project select */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="gallery-project">Projet associé *</Label>
                                        <select
                                            id="gallery-project"
                                            value={form.data.project_id}
                                            onChange={(e) => form.setData('project_id', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                            required
                                        >
                                            <option value="" disabled className="dark:bg-zinc-950">
                                                Sélectionner un projet...
                                            </option>
                                            {projects.map((proj) => (
                                                <option key={proj.id} value={proj.id} className="dark:bg-zinc-950">
                                                    {proj.name}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.project_id && (
                                            <p className="text-xs text-rose-500">{form.errors.project_id}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="gallery-description">Description (optionnel)</Label>
                                        <textarea
                                            id="gallery-description"
                                            placeholder="Ex: Façade avant du bâtiment, rendu final..."
                                            rows={2}
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        />
                                        {form.errors.description && (
                                            <p className="text-xs text-rose-500">{form.errors.description}</p>
                                        )}
                                    </div>

                                    {/* File drop zone */}
                                    <div className="grid gap-2">
                                        <Label>Image *</Label>
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                                                ${isDragging
                                                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20'
                                                    : 'border-border/70 hover:border-indigo-400 bg-neutral-50/50 dark:bg-neutral-900/10 dark:hover:bg-neutral-800/10'
                                                }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                id="gallery-file"
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                                onChange={handleInputChange}
                                                className="hidden"
                                                required
                                            />

                                            {previewUrl ? (
                                                <div className="relative">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-40 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-xs text-white font-medium">
                                                            Cliquer pour changer
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <UploadCloud
                                                        className={`h-9 w-9 mx-auto mb-2 transition-colors ${
                                                            isDragging ? 'text-indigo-500' : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                    <span className="text-xs font-medium text-foreground block">
                                                        Glissez une image ici
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                                        ou cliquez pour parcourir — JPG, PNG, WebP (max 5 Mo)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {form.errors.image_item && (
                                            <p className="text-xs text-rose-500">{form.errors.image_item}</p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={form.processing}>
                                        {form.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <ImagePlus className="h-4 w-4 mr-2" />
                                                Ajouter à la galerie
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Info notice */}
                        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-border/40">
                            <AlertCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                                Les images sont stockées dans le dossier public. Assurez-vous d'avoir exécuté{' '}
                                <code className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1 rounded">
                                    php artisan storage:link
                                </code>
                                .
                            </span>
                        </div>
                    </div>

                    {/* ── Right: Gallery Grid ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Toolbar: filter + count */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-1">
                                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                                <select
                                    value={filterProjectId}
                                    onChange={(e) => setFilterProjectId(e.target.value)}
                                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 min-w-[180px]"
                                >
                                    <option value="">Tous les projets</option>
                                    {projects.map((proj) => (
                                        <option key={proj.id} value={proj.id}>
                                            {proj.name}
                                        </option>
                                    ))}
                                </select>
                                {filterProjectId && (
                                    <button
                                        onClick={() => setFilterProjectId('')}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        title="Réinitialiser le filtre"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {filteredGalleries.length} image{filteredGalleries.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Grid */}
                        {filteredGalleries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border/60 text-muted-foreground gap-3">
                                <ImageIcon className="h-10 w-10 opacity-30" />
                                <p className="text-sm font-medium">Aucune image dans la galerie</p>
                                <p className="text-xs opacity-70">Ajoutez votre première photo via le formulaire.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredGalleries.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800/50 aspect-square cursor-zoom-in border border-border/40 hover:border-indigo-400/60 transition-all duration-200 shadow-xs hover:shadow-md"
                                    >
                                        <img
                                            src={`/storage/${item.image_item}`}
                                            alt={item.description ?? `Image ${item.id}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onClick={() => openLightbox(idx)}
                                            loading="lazy"
                                        />

                                        {/* Overlay on hover */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3"
                                            onClick={() => openLightbox(idx)}
                                        >
                                            {item.project && (
                                                <div className="space-y-0.5">
                                                    <p className="text-white text-xs font-semibold truncate leading-tight">
                                                        {item.project.name}
                                                    </p>
                                                    {item.project.enterprises && (
                                                        <div className="flex items-center gap-1 text-white/70 text-[10px]">
                                                            <Building2 className="h-2.5 w-2.5 shrink-0" />
                                                            <span className="truncate">{item.project.enterprises.name}</span>
                                                        </div>
                                                    )}
                                                    {item.description && (
                                                        <p className="text-white/60 text-[10px] line-clamp-1 mt-0.5">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(item.id);
                                            }}
                                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 duration-150"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>

                                        {/* Date badge */}
                                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                                                {formatDate(item.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {currentLightboxItem && (
                <div
                    ref={lightboxRef}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
                        {(lightboxIndex ?? 0) + 1} / {filteredGalleries.length}
                    </div>

                    {/* Prev button */}
                    {filteredGalleries.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            className="absolute left-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}

                    {/* Image container */}
                    <div
                        className="relative max-w-5xl max-h-[80vh] mx-16 flex flex-col items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={`/storage/${currentLightboxItem.image_item}`}
                            alt={currentLightboxItem.description ?? 'Image'}
                            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        {/* Caption */}
                        <div className="text-center space-y-1">
                            {currentLightboxItem.project && (
                                <p className="text-white font-semibold text-sm">
                                    {currentLightboxItem.project.name}
                                    {currentLightboxItem.project.enterprises && (
                                        <span className="text-white/50 font-normal ml-2 text-xs">
                                            — {currentLightboxItem.project.enterprises.name}
                                        </span>
                                    )}
                                </p>
                            )}
                            {currentLightboxItem.description && (
                                <p className="text-white/60 text-xs">{currentLightboxItem.description}</p>
                            )}
                            <p className="text-white/40 text-[10px]">{formatDate(currentLightboxItem.created_at)}</p>
                        </div>
                    </div>

                    {/* Next button */}
                    {filteredGalleries.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l'image</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer cette image de la galerie ? Cette action est irréversible.
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

Gallery.layout = {
    breadcrumbs: [
        {
            title: 'Galerie',
            href: galleryIndex(),
        },
    ],
};
