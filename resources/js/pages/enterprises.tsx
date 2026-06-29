import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import enterprisesRoute from '@/routes/enterprises';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Filter, 
    Plus, 
    Globe, 
    MapPin, 
    Phone, 
    Mail, 
    Star, 
    ExternalLink, 
    Edit, 
    Trash2, 
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface EnterpriseItem {
    id: number;
    category_id: number;
    name: string;
    description?: string;
    email_address: string;
    google_maps_link: string;
    telephone: string;
    website?: string;
    has_website: boolean;
    address: string;
    rating?: string | number;
    reviews_count?: number;
    outreach_status: string;
    categorie?: Category;
}

interface PaginatedEnterprises {
    data: EnterpriseItem[];
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
    enterprises: PaginatedEnterprises;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        outreach_status?: string;
        has_website?: string;
    };
}

export default function Enterprises({ enterprises, categories, filters }: Props) {
    // Search filter states
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [outreachStatus, setOutreachStatus] = useState(filters.outreach_status || '');
    const [hasWebsite, setHasWebsite] = useState(filters.has_website || '');
    
    // Modals visibility
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEnterprise, setEditingEnterprise] = useState<EnterpriseItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Inertia form for creation/updating
    const form = useForm({
        category_id: '',
        name: '',
        description: '',
        email_address: '',
        google_maps_link: '',
        telephone: '',
        website: '',
        has_website: false,
        address: '',
        rating: '',
        reviews_count: '',
        outreach_status: 'prospect',
    });

    // Populate form when editing
    useEffect(() => {
        if (editingEnterprise) {
            form.setData({
                category_id: editingEnterprise.category_id.toString(),
                name: editingEnterprise.name,
                description: editingEnterprise.description || '',
                email_address: editingEnterprise.email_address,
                google_maps_link: editingEnterprise.google_maps_link,
                telephone: editingEnterprise.telephone,
                website: editingEnterprise.website || '',
                has_website: editingEnterprise.has_website,
                address: editingEnterprise.address,
                rating: editingEnterprise.rating ? editingEnterprise.rating.toString() : '',
                reviews_count: editingEnterprise.reviews_count ? editingEnterprise.reviews_count.toString() : '',
                outreach_status: editingEnterprise.outreach_status,
            });
        } else {
            form.reset();
        }
    }, [editingEnterprise]);

    // Handle search/filter submission
    const applyFilters = () => {
        router.get(enterprisesRoute.index(), {
            search,
            category_id: categoryId,
            outreach_status: outreachStatus,
            has_website: hasWebsite
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Sync local states when server filters change (e.g. on menu navigation)
    useEffect(() => {
        setSearch(filters.search || '');
        setCategoryId(filters.category_id || '');
        setOutreachStatus(filters.outreach_status || '');
        setHasWebsite(filters.has_website || '');
    }, [filters]);

    // Trigger filter update on search/dropdown change
    useEffect(() => {
        const initialSearch = filters.search || '';
        const initialCategoryId = filters.category_id || '';
        const initialOutreachStatus = filters.outreach_status || '';
        const initialHasWebsite = filters.has_website || '';

        // If local states match the server filters, don't trigger a new request
        if (
            search === initialSearch &&
            String(categoryId) === String(initialCategoryId) &&
            outreachStatus === initialOutreachStatus &&
            String(hasWebsite) === String(initialHasWebsite)
        ) {
            return;
        }

        const timer = setTimeout(() => {
            applyFilters();
        }, 300); // debounce text search
        return () => clearTimeout(timer);
    }, [search, categoryId, outreachStatus, hasWebsite, filters]);

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setOutreachStatus('');
        setHasWebsite('');
    };

    // Submit Create Form
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/enterprises', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            }
        });
    };

    // Submit Edit Form
    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEnterprise) return;
        form.put(`/enterprises/${editingEnterprise.id}`, {
            onSuccess: () => {
                setEditingEnterprise(null);
            }
        });
    };

    // Handle Delete
    const handleDelete = (id: number) => {
        setDeletingId(id);
    };

    // Helper for outreach labels and colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'prospect':
                return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'contacted':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25';
            case 'negotiating':
                return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
            case 'signed':
                return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'refused':
                return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'prospect': return 'Prospect';
            case 'contacted': return 'Contacté';
            case 'negotiating': return 'Discussion';
            case 'signed': return 'Signé';
            case 'refused': return 'Refusé';
            default: return status;
        }
    };

    return (
        <>
            <Head title="Entreprises" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Entreprises</h1>
                        <p className="text-muted-foreground">Recensement et prospection des entreprises locales.</p>
                    </div>
                    
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                Nouvelle entreprise
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>Créer une Entreprise</DialogTitle>
                                <DialogDescription>Recenser une nouvelle entreprise issue de Google Maps.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <Label htmlFor="create-name">Nom de l'entreprise *</Label>
                                        <Input id="create-name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                        {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-category">Catégorie *</Label>
                                        <select 
                                            id="create-category"
                                            value={form.data.category_id} 
                                            onChange={e => form.setData('category_id', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                            required
                                        >
                                            <option value="" disabled className="dark:bg-zinc-950">Sélectionner...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id} className="dark:bg-zinc-950">{cat.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.category_id && <p className="text-xs text-rose-500 mt-1">{form.errors.category_id}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-status">Statut de démarchage *</Label>
                                        <select 
                                            id="create-status"
                                            value={form.data.outreach_status} 
                                            onChange={e => form.setData('outreach_status', e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                            required
                                        >
                                            <option value="prospect" className="dark:bg-zinc-950">Prospect</option>
                                            <option value="contacted" className="dark:bg-zinc-950">Contacté</option>
                                            <option value="negotiating" className="dark:bg-zinc-950">En discussion</option>
                                            <option value="signed" className="dark:bg-zinc-950">Signé (Contrat)</option>
                                            <option value="refused" className="dark:bg-zinc-950">Refusé</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <Label htmlFor="create-address">Adresse Physique *</Label>
                                        <Input id="create-address" value={form.data.address} onChange={e => form.setData('address', e.target.value)} required />
                                        {form.errors.address && <p className="text-xs text-rose-500 mt-1">{form.errors.address}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-email">Adresse Email *</Label>
                                        <Input id="create-email" type="email" value={form.data.email_address} onChange={e => form.setData('email_address', e.target.value)} required />
                                        {form.errors.email_address && <p className="text-xs text-rose-500 mt-1">{form.errors.email_address}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-phone">Téléphone *</Label>
                                        <Input id="create-phone" value={form.data.telephone} onChange={e => form.setData('telephone', e.target.value)} required />
                                        {form.errors.telephone && <p className="text-xs text-rose-500 mt-1">{form.errors.telephone}</p>}
                                    </div>

                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <Label htmlFor="create-maps">Lien Google Maps *</Label>
                                        <Input id="create-maps" type="url" placeholder="https://maps.google.com/..." value={form.data.google_maps_link} onChange={e => form.setData('google_maps_link', e.target.value)} required />
                                        {form.errors.google_maps_link && <p className="text-xs text-rose-500 mt-1">{form.errors.google_maps_link}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-rating">Note Google Maps (0 - 5)</Label>
                                        <Input id="create-rating" type="number" step="0.1" min="0" max="5" value={form.data.rating} onChange={e => form.setData('rating', e.target.value)} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-reviews">Nombre d'avis</Label>
                                        <Input id="create-reviews" type="number" min="0" value={form.data.reviews_count} onChange={e => form.setData('reviews_count', e.target.value)} />
                                    </div>

                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                id="create-has-website"
                                                type="checkbox" 
                                                checked={form.data.has_website}
                                                onChange={e => form.setData('has_website', e.target.checked)}
                                                className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            <Label htmlFor="create-has-website" className="cursor-pointer">Possède déjà un site internet</Label>
                                        </div>
                                    </div>

                                    {form.data.has_website && (
                                        <div className="grid gap-2 col-span-1 sm:col-span-2">
                                            <Label htmlFor="create-website">Lien du site actuel</Label>
                                            <Input id="create-website" type="url" placeholder="https://..." value={form.data.website} onChange={e => form.setData('website', e.target.value)} />
                                            {form.errors.website && <p className="text-xs text-rose-500 mt-1">{form.errors.website}</p>}
                                        </div>
                                    )}

                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <Label htmlFor="create-desc">Description / Notes de prospection</Label>
                                        <textarea 
                                            id="create-desc" 
                                            rows={3} 
                                            value={form.data.description} 
                                            onChange={e => form.setData('description', e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={form.processing}>Enregistrer</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters Row */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher nom, email, tél, adresse..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:flex-1">
                            <select 
                                value={categoryId} 
                                onChange={e => setCategoryId(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select 
                                value={outreachStatus} 
                                onChange={e => setOutreachStatus(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="prospect">Prospect</option>
                                <option value="contacted">Contacté</option>
                                <option value="negotiating">En discussion</option>
                                <option value="signed">Signé</option>
                                <option value="refused">Refusé</option>
                            </select>

                            <select 
                                value={hasWebsite} 
                                onChange={e => setHasWebsite(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Site Internet ?</option>
                                <option value="1">Oui</option>
                                <option value="0">Non</option>
                            </select>
                        </div>
                        
                        {(search || categoryId || outreachStatus || hasWebsite) && (
                            <Button variant="ghost" onClick={resetFilters} className="w-full md:w-auto text-muted-foreground gap-1.5 shrink-0">
                                <X className="h-4 w-4" />
                                Réinitialiser
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Enterprises Table / Cards */}
                <div className="w-full">
                    {enterprises.data.length === 0 ? (
                        <Card className="p-8 text-center border-border/60 shadow-xs">
                            <p className="text-muted-foreground">Aucune entreprise trouvée avec ces filtres.</p>
                        </Card>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
                                <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                                    <thead className="bg-neutral-50 dark:bg-neutral-800/40 text-xs font-semibold text-foreground border-b border-border/50">
                                        <tr>
                                            <th className="p-4">Entreprise</th>
                                            <th className="p-4">Contact</th>
                                            <th className="p-4">Google Maps & Web</th>
                                            <th className="p-4">Note / Avis</th>
                                            <th className="p-4">Statut</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {enterprises.data.map(ent => (
                                            <tr key={ent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="p-4 font-medium text-foreground">
                                                    <div className="space-y-0.5">
                                                        <div className="font-semibold text-base">{ent.name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded-sm">
                                                                {ent.categorie?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <a href={`mailto:${ent.email_address}`} className="hover:text-primary flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {ent.email_address}
                                                        </a>
                                                        <a href={`tel:${ent.telephone}`} className="hover:text-primary flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {ent.telephone}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <a href={ent.google_maps_link} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1.5 text-blue-500">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            Ouvrir Maps
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                        {ent.has_website && ent.website ? (
                                                            <a href={ent.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1.5 text-neutral-500">
                                                                <Globe className="h-3.5 w-3.5" />
                                                                Visiter le site
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-rose-500 font-semibold text-[10px] flex items-center gap-1 select-none">
                                                                <Globe className="h-3.5 w-3.5" />
                                                                Pas de site web
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {ent.rating ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                            <span className="font-semibold text-foreground">{ent.rating}</span>
                                                            <span className="text-xs text-muted-foreground">({ent.reviews_count} avis)</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Aucun avis</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusStyle(ent.outreach_status)}`}>
                                                        {getStatusLabel(ent.outreach_status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => setEditingEnterprise(ent)}
                                                            className="h-8 w-8 hover:text-indigo-500"
                                                            title="Modifier"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleDelete(ent.id)}
                                                            className="h-8 w-8 hover:text-rose-500"
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

                            {/* Mobile Grid Cards View */}
                            <div className="md:hidden grid gap-4 grid-cols-1">
                                {enterprises.data.map(ent => (
                                    <Card key={ent.id} className="border-border/60 shadow-xs hover:border-primary/25 transition-all">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-foreground leading-tight">{ent.name}</h3>
                                                    <span className="inline-block mt-1 text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-sm">
                                                        {ent.categorie?.name}
                                                    </span>
                                                </div>
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getStatusStyle(ent.outreach_status)}`}>
                                                    {getStatusLabel(ent.outreach_status)}
                                                </span>
                                            </div>

                                            {ent.rating && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="font-semibold text-foreground">{ent.rating}</span>
                                                    <span className="text-muted-foreground">({ent.reviews_count} avis)</span>
                                                </div>
                                            )}

                                            <div className="text-xs text-muted-foreground space-y-1.5 pt-1 border-t border-border/30">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{ent.address}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{ent.email_address}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{ent.telephone}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 gap-2 border-t border-border/30">
                                                <div className="flex gap-2">
                                                    <a href={ent.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                        Maps <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                    {ent.has_website && ent.website && (
                                                        <a href={ent.website} target="_blank" rel="noopener noreferrer" className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-border/40 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                            Site <ExternalLink className="h-2.5 w-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => setEditingEnterprise(ent)}
                                                        className="h-8 w-8 hover:text-indigo-500"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(ent.id)}
                                                        className="h-8 w-8 hover:text-rose-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination Row */}
                            {enterprises.last_page > 1 && (
                                <div className="flex items-center justify-between py-4 border-t border-border/40 mt-4 text-sm text-muted-foreground">
                                    <div>
                                        Page <span className="font-semibold text-foreground">{enterprises.current_page}</span> sur <span className="font-semibold text-foreground">{enterprises.last_page}</span> ({enterprises.total} résultats)
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={!enterprises.prev_page_url}
                                            onClick={() => router.get(enterprises.prev_page_url || '', {}, { preserveState: true, replace: true })}
                                            className="gap-1.5"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Précédent
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={!enterprises.next_page_url}
                                            onClick={() => router.get(enterprises.next_page_url || '', {}, { preserveState: true, replace: true })}
                                            className="gap-1.5"
                                        >
                                            Suivant <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Edit Modal (Dialog) */}
                <Dialog open={editingEnterprise !== null} onOpenChange={(open) => !open && setEditingEnterprise(null)}>
                    <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Modifier l'Entreprise</DialogTitle>
                            <DialogDescription>Mettre à jour les informations du lead recensé.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2 col-span-1 sm:col-span-2">
                                    <Label htmlFor="edit-name">Nom de l'entreprise *</Label>
                                    <Input id="edit-name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                    {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-category">Catégorie *</Label>
                                    <select 
                                        id="edit-category"
                                        value={form.data.category_id} 
                                        onChange={e => form.setData('category_id', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        required
                                    >
                                        <option value="" disabled className="dark:bg-zinc-950">Sélectionner...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="dark:bg-zinc-950">{cat.name}</option>
                                        ))}
                                    </select>
                                    {form.errors.category_id && <p className="text-xs text-rose-500 mt-1">{form.errors.category_id}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-status">Statut de démarchage *</Label>
                                    <select 
                                        id="edit-status"
                                        value={form.data.outreach_status} 
                                        onChange={e => form.setData('outreach_status', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        required
                                    >
                                        <option value="prospect" className="dark:bg-zinc-950">Prospect</option>
                                        <option value="contacted" className="dark:bg-zinc-950">Contacté</option>
                                        <option value="negotiating" className="dark:bg-zinc-950">En discussion</option>
                                        <option value="signed" className="dark:bg-zinc-950">Signé (Contrat)</option>
                                        <option value="refused" className="dark:bg-zinc-950">Refusé</option>
                                    </select>
                                </div>

                                <div className="grid gap-2 col-span-1 sm:col-span-2">
                                    <Label htmlFor="edit-address">Adresse Physique *</Label>
                                    <Input id="edit-address" value={form.data.address} onChange={e => form.setData('address', e.target.value)} required />
                                    {form.errors.address && <p className="text-xs text-rose-500 mt-1">{form.errors.address}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Adresse Email *</Label>
                                    <Input id="edit-email" type="email" value={form.data.email_address} onChange={e => form.setData('email_address', e.target.value)} required />
                                    {form.errors.email_address && <p className="text-xs text-rose-500 mt-1">{form.errors.email_address}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-phone">Téléphone *</Label>
                                    <Input id="edit-phone" value={form.data.telephone} onChange={e => form.setData('telephone', e.target.value)} required />
                                    {form.errors.telephone && <p className="text-xs text-rose-500 mt-1">{form.errors.telephone}</p>}
                                </div>

                                <div className="grid gap-2 col-span-1 sm:col-span-2">
                                    <Label htmlFor="edit-maps">Lien Google Maps *</Label>
                                    <Input id="edit-maps" type="url" value={form.data.google_maps_link} onChange={e => form.setData('google_maps_link', e.target.value)} required />
                                    {form.errors.google_maps_link && <p className="text-xs text-rose-500 mt-1">{form.errors.google_maps_link}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-rating">Note Google Maps (0 - 5)</Label>
                                    <Input id="edit-rating" type="number" step="0.1" min="0" max="5" value={form.data.rating} onChange={e => form.setData('rating', e.target.value)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-reviews">Nombre d'avis</Label>
                                    <Input id="edit-reviews" type="number" min="0" value={form.data.reviews_count} onChange={e => form.setData('reviews_count', e.target.value)} />
                                </div>

                                <div className="grid gap-2 col-span-1 sm:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            id="edit-has-website"
                                            type="checkbox" 
                                            checked={form.data.has_website}
                                            onChange={e => form.setData('has_website', e.target.checked)}
                                            className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <Label htmlFor="edit-has-website" className="cursor-pointer">Possède déjà un site internet</Label>
                                    </div>
                                </div>

                                {form.data.has_website && (
                                    <div className="grid gap-2 col-span-1 sm:col-span-2">
                                        <Label htmlFor="edit-website">Lien du site actuel</Label>
                                        <Input id="edit-website" type="url" placeholder="https://..." value={form.data.website} onChange={e => form.setData('website', e.target.value)} />
                                        {form.errors.website && <p className="text-xs text-rose-500 mt-1">{form.errors.website}</p>}
                                    </div>
                                )}

                                <div className="grid gap-2 col-span-1 sm:col-span-2">
                                    <Label htmlFor="edit-desc">Description / Notes de prospection</Label>
                                    <textarea 
                                        id="edit-desc" 
                                        rows={3} 
                                        value={form.data.description} 
                                        onChange={e => form.setData('description', e.target.value)}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                                <Button type="button" variant="outline" onClick={() => setEditingEnterprise(null)}>Annuler</Button>
                                <Button type="submit" disabled={form.processing}>Enregistrer les modifications</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible et supprimera également tous les projets associés.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0 pt-4">
                            <Button variant="outline" onClick={() => setDeletingId(null)}>Annuler</Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => {
                                    if (deletingId) {
                                        router.delete(`/enterprises/${deletingId}`, {
                                            onSuccess: () => setDeletingId(null)
                                        });
                                    }
                                }}
                            >
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Enterprises.layout = {
    breadcrumbs: [
        {
            title: 'Entreprises',
            href: enterprisesRoute.index(),
        },
    ],
};
