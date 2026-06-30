import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import projectsRoute from '@/routes/projects';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Plus, 
    Building2, 
    ExternalLink, 
    Github, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    X,
    ArrowRightLeft
} from 'lucide-react';

interface EnterpriseListItem {
    id: number | string;
    name: string;
}

interface ProjectItem {
    id: number;
    enterprise_id: number | null;
    name: string;
    description?: string;
    is_finished: boolean;
    is_published: boolean;
    public_link?: string;
    github_link?: string;
    logo?: string;
    enterprises?: EnterpriseListItem;
}

interface Props {
    projects: ProjectItem[];
    enterprises: EnterpriseListItem[];
    filters: {
        search?: string;
        enterprise_id?: string;
        status?: string;
    };
}

export default function Projects({ projects, enterprises, filters }: Props) {
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [enterpriseId, setEnterpriseId] = useState(filters.enterprise_id || '');
    
    // Modals visibility
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Inertia form for creation/updating
    const form = useForm({
        enterprise_id: null as string | null,
        name: '',
        description: '',
        is_finished: false,
        is_published: true,
        public_link: '',
        github_link: '',
        logo: '' as string,
    });

    // Populate form when editing
    useEffect(() => {
        if (editingProject) {
            form.setData({
                enterprise_id: editingProject.enterprise_id ? editingProject.enterprise_id.toString() : null,
                name: editingProject.name,
                description: editingProject.description || '',
                is_finished: editingProject.is_finished,
                is_published: editingProject.is_published,
                public_link: editingProject.public_link || '',
                github_link: editingProject.github_link || '',
                logo: editingProject.logo || '',
            });
        } else {
            form.reset();
        }
    }, [editingProject]);

    // Handle search/filters
    const applyFilters = () => {
        router.get(projectsRoute.index(), {
            search,
            enterprise_id: enterpriseId,
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Sync local states when server filters change (e.g. on menu navigation)
    useEffect(() => {
        setSearch(filters.search || '');
        setEnterpriseId(filters.enterprise_id || '');
    }, [filters]);

    // Trigger filters on update
    useEffect(() => {
        const initialSearch = filters.search || '';
        const initialEnterpriseId = filters.enterprise_id || '';

        // If local states match the server filters, don't trigger a new request
        if (
            search === initialSearch &&
            String(enterpriseId) === String(initialEnterpriseId)
        ) {
            return;
        }

        const timer = setTimeout(() => {
            applyFilters();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, enterpriseId, filters]);

    const resetFilters = () => {
        setSearch('');
        setEnterpriseId('');
    };

    // Submit Create Form
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/projects', {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            }
        });
    };

    // Submit Edit Form
    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;
        form.put(`/projects/${editingProject.id}`, {
            onSuccess: () => {
                setEditingProject(null);
            }
        });
    };

    // Toggle Project Status (Finished / Active)
    const handleToggleStatus = (project: ProjectItem) => {
        router.put(`/projects/${project.id}`, {
            enterprise_id: project.enterprise_id || null,
            name: project.name,
            description: project.description || '',
            is_finished: !project.is_finished,
            is_published: project.is_published,
            public_link: project.public_link || '',
            github_link: project.github_link || '',
            logo: project.logo || '',
        }, {
            preserveScroll: true
        });
    };

    // Delete Project
    const handleDelete = (id: number) => {
        setDeletingId(id);
    };

    // Group projects by status
    const activeProjects = projects.filter(p => !p.is_finished);
    const finishedProjects = projects.filter(p => p.is_finished);

    return (
        <>
            <Head title="Projets" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Projets</h1>
                        <p className="text-muted-foreground">Suivi du développement des applications et services clients.</p>
                    </div>
                    
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                Nouveau projet
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Créer un Projet</DialogTitle>
                                <DialogDescription>Lancer un projet de développement, avec ou sans entreprise cliente.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-enterprise">Entreprise Cliente</Label>
                                        <select
                                            id="create-enterprise"
                                            value={form.data.enterprise_id || ''}
                                            onChange={e => form.setData('enterprise_id', e.target.value || null)}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        >
                                            <option value="" className="dark:bg-zinc-950">Aucune entreprise</option>
                                            {enterprises.map(ent => (
                                                <option key={ent.id} value={ent.id} className="dark:bg-zinc-950">{ent.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.enterprise_id && <p className="text-xs text-rose-500 mt-1">{form.errors.enterprise_id}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-name">Nom du projet *</Label>
                                        <Input id="create-name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                        {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-desc">Description</Label>
                                        <textarea 
                                            id="create-desc" 
                                            rows={3} 
                                            value={form.data.description} 
                                            onChange={e => form.setData('description', e.target.value)}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-public-link">Lien public (production/site)</Label>
                                        <Input id="create-public-link" type="url" placeholder="https://..." value={form.data.public_link} onChange={e => form.setData('public_link', e.target.value)} />
                                        {form.errors.public_link && <p className="text-xs text-rose-500 mt-1">{form.errors.public_link}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-github-link">Lien Repository GitHub</Label>
                                        <Input id="create-github-link" type="url" placeholder="https://github.com/..." value={form.data.github_link} onChange={e => form.setData('github_link', e.target.value)} />
                                        {form.errors.github_link && <p className="text-xs text-rose-500 mt-1">{form.errors.github_link}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="create-logo">URL du Logo</Label>
                                        <Input id="create-logo" type="url" placeholder="https://..." value={form.data.logo} onChange={e => form.setData('logo', e.target.value)} />
                                        {form.errors.logo && <p className="text-xs text-rose-500 mt-1">{form.errors.logo}</p>}
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <input 
                                            id="create-is-finished"
                                            type="checkbox" 
                                            checked={form.data.is_finished}
                                            onChange={e => form.setData('is_finished', e.target.checked)}
                                            className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <Label htmlFor="create-is-finished" className="cursor-pointer">Projet terminé et livré</Label>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <input 
                                            id="create-is-published"
                                            type="checkbox" 
                                            checked={form.data.is_published}
                                            onChange={e => form.setData('is_published', e.target.checked)}
                                            className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <Label htmlFor="create-is-published" className="cursor-pointer">Publier le projet (visible pour les visiteurs)</Label>
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

                {/* Filters Board */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-1/2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Rechercher par nom ou description..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        
                        <select 
                            value={enterpriseId} 
                            onChange={e => setEnterpriseId(e.target.value)}
                            className="flex h-9 w-full sm:w-1/2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Toutes les entreprises</option>
                            {enterprises.map(ent => (
                                <option key={ent.id} value={ent.id}>{ent.name}</option>
                            ))}
                        </select>
                        
                        {(search || enterpriseId) && (
                            <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground gap-1.5 shrink-0 w-full sm:w-auto">
                                <X className="h-4 w-4" />
                                Effacer
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Kanban Style Columns */}
                <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Active Projects (En Cours) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-foreground">En Cours ({activeProjects.length})</h2>
                            </div>
                            <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-semibold">Actifs</span>
                        </div>
                        
                        <div className="space-y-3 min-h-[400px] rounded-xl bg-neutral-50/50 dark:bg-neutral-900/10 border border-dashed border-border/40 p-2">
                            {activeProjects.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted-foreground">Aucun projet en cours de développement.</div>
                            ) : (
                                activeProjects.map(proj => (
                                    <ProjectCard 
                                        key={proj.id} 
                                        project={proj} 
                                        onEdit={() => setEditingProject(proj)}
                                        onToggle={() => handleToggleStatus(proj)}
                                        onDelete={() => handleDelete(proj.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Finished Projects (Terminés) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <h2 className="text-lg font-bold text-foreground">Terminés ({finishedProjects.length})</h2>
                            </div>
                            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Livrés</span>
                        </div>

                        <div className="space-y-3 min-h-[400px] rounded-xl bg-neutral-50/50 dark:bg-neutral-900/10 border border-dashed border-border/40 p-2">
                            {finishedProjects.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted-foreground">Aucun projet terminé.</div>
                            ) : (
                                finishedProjects.map(proj => (
                                    <ProjectCard 
                                        key={proj.id} 
                                        project={proj} 
                                        onEdit={() => setEditingProject(proj)}
                                        onToggle={() => handleToggleStatus(proj)}
                                        onDelete={() => handleDelete(proj.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <Dialog open={editingProject !== null} onOpenChange={open => !open && setEditingProject(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Modifier le Projet</DialogTitle>
                            <DialogDescription>Mettre à jour les informations ou les liens de production.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-enterprise">Entreprise Cliente</Label>
                                    <select
                                        id="edit-enterprise"
                                        value={form.data.enterprise_id || ''}
                                        onChange={e => form.setData('enterprise_id', e.target.value || null)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                    >
                                        <option value="" className="dark:bg-zinc-950">Aucune entreprise</option>
                                        {enterprises.map(ent => (
                                            <option key={ent.id} value={ent.id} className="dark:bg-zinc-950">{ent.name}</option>
                                        ))}
                                    </select>
                                    {form.errors.enterprise_id && <p className="text-xs text-rose-500 mt-1">{form.errors.enterprise_id}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nom du projet *</Label>
                                    <Input id="edit-name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                    {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-desc">Description</Label>
                                    <textarea 
                                        id="edit-desc" 
                                        rows={3} 
                                        value={form.data.description} 
                                        onChange={e => form.setData('description', e.target.value)}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-public-link">Lien public (production/site)</Label>
                                    <Input id="edit-public-link" type="url" value={form.data.public_link} onChange={e => form.setData('public_link', e.target.value)} />
                                    {form.errors.public_link && <p className="text-xs text-rose-500 mt-1">{form.errors.public_link}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-github-link">Lien Repository GitHub</Label>
                                    <Input id="edit-github-link" type="url" value={form.data.github_link} onChange={e => form.setData('github_link', e.target.value)} />
                                    {form.errors.github_link && <p className="text-xs text-rose-500 mt-1">{form.errors.github_link}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-logo">URL du Logo</Label>
                                    <Input id="edit-logo" type="url" placeholder="https://..." value={form.data.logo} onChange={e => form.setData('logo', e.target.value)} />
                                    {form.errors.logo && <p className="text-xs text-rose-500 mt-1">{form.errors.logo}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input 
                                        id="edit-is-finished"
                                        type="checkbox" 
                                        checked={form.data.is_finished}
                                        onChange={e => form.setData('is_finished', e.target.checked)}
                                        className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <Label htmlFor="edit-is-finished" className="cursor-pointer">Projet terminé et livré</Label>
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <input 
                                        id="edit-is-published"
                                        type="checkbox" 
                                        checked={form.data.is_published}
                                        onChange={e => form.setData('is_published', e.target.checked)}
                                        className="rounded-sm border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <Label htmlFor="edit-is-published" className="cursor-pointer">Publier le projet (visible pour les visiteurs)</Label>
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                                <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>Annuler</Button>
                                <Button type="submit" disabled={form.processing}>Enregistrer les modifications</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

// Subcomponent for Project Card to keep code clean and modular
function ProjectCard({ project, onEdit, onToggle, onDelete }: { project: ProjectItem; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
    return (
        <Card className="border-border/60 shadow-xs hover:border-primary/25 hover:shadow-sm transition-all duration-300 group">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    {project.logo && (
                        <img
                            src={project.logo}
                            alt={project.name}
                            className="w-12 h-12 rounded-md object-cover shrink-0 border border-border/50"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-base text-foreground leading-tight">{project.name}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                                project.is_published
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400"
                            }`}>
                                {project.is_published ? "Public" : "Brouillon"}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-medium truncate">{project.enterprises?.name || 'Aucune entreprise'}</span>
                        </div>
                    </div>
                </div>

                {project.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {project.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/30 gap-2">
                    {/* Action Links */}
                    <div className="flex items-center gap-2">
                        {project.public_link ? (
                            <a 
                                href={project.public_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="h-7 w-7 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors"
                                title="Lien de Production"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        ) : (
                            <span className="h-7 w-7 rounded-md bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-center text-neutral-300 dark:text-neutral-700 select-none cursor-not-allowed">
                                <ExternalLink className="h-3.5 w-3.5" />
                            </span>
                        )}

                        {project.github_link ? (
                            <a 
                                href={project.github_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="h-7 w-7 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors"
                                title="Repository GitHub"
                            >
                                <Github className="h-3.5 w-3.5" />
                            </a>
                        ) : (
                            <span className="h-7 w-7 rounded-md bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-center text-neutral-300 dark:text-neutral-700 select-none cursor-not-allowed">
                                <Github className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onToggle}
                            className="h-7 w-7 hover:bg-indigo-500/10 hover:text-indigo-500 text-muted-foreground"
                            title={project.is_finished ? "Remettre en cours" : "Marquer comme terminé"}
                        >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onEdit}
                            className="h-7 w-7 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground"
                            title="Modifier"
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onDelete}
                            className="h-7 w-7 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                            title="Supprimer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

Projects.layout = {
    breadcrumbs: [
        {
            title: 'Projets',
            href: projectsRoute.index(),
        },
    ],
};
