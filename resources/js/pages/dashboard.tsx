import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import enterprises from '@/routes/enterprises';
import projects from '@/routes/projects';
import devis from '@/routes/devis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Building2, 
    Clock, 
    CheckCircle2, 
    FileText, 
    MapPin, 
    Calendar,
    ChevronRight,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

interface Stats {
    total_enterprises: number;
    total_projects: number;
    finished_projects: number;
    active_projects: number;
    total_devis: number;
    status_breakdown: {
        prospect: number;
        contacted: number;
        negotiating: number;
        signed: number;
        refused: number;
    };
}

interface Enterprise {
    id: number;
    name: string;
    email_address: string;
    telephone: string;
    outreach_status: string;
    address: string;
    rating: string | number;
    categorie?: {
        name: string;
    };
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    is_finished: boolean;
    enterprises?: {
        name: string;
    };
    created_at: string;
}

interface Props {
    stats: Stats;
    recent_enterprises: Enterprise[];
    recent_projects: Project[];
}

export default function Dashboard({ stats, recent_enterprises, recent_projects }: Props) {
    // Helper to format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    // Helper to get status badges
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'prospect':
                return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'contacted':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
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
            case 'negotiating': return 'En discussion';
            case 'signed': return 'Signé';
            case 'refused': return 'Refusé';
            default: return status;
        }
    };

    // Calculate percentage breakdown
    const totalStatusCount = Object.values(stats.status_breakdown).reduce((a, b) => a + b, 0) || 1;
    const getStatusPercentage = (count: number) => {
        return Math.round((count / totalStatusCount) * 100);
    };

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 transition-all duration-300">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Vue d'ensemble de vos leads et de vos projets en cours.</p>
                </div>

                {/* Grid Stat Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-border/60 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entreprises</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                <Building2 className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.total_enterprises}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Recensées sur Google Maps</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/60 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projets Actifs</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.active_projects}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                En cours de développement
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/60 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projets Terminés</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.finished_projects}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Livrés et validés par les clients
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/60 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Devis</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.total_devis}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Devis et factures enregistrés
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Secondary Layout */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Status Breakdown Panel */}
                    <Card className="lg:col-span-3 border-border/60 shadow-xs flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-lg">Statut du Démarchage</CardTitle>
                            <CardDescription>Répartition du statut de contact avec les entreprises.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Graphic Bar */}
                            <div className="flex h-5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <div 
                                    className="bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${getStatusPercentage(stats.status_breakdown.prospect)}%` }} 
                                    title={`Prospect: ${getStatusPercentage(stats.status_breakdown.prospect)}%`}
                                />
                                <div 
                                    className="bg-yellow-500 transition-all duration-500" 
                                    style={{ width: `${getStatusPercentage(stats.status_breakdown.contacted)}%` }} 
                                    title={`Contacté: ${getStatusPercentage(stats.status_breakdown.contacted)}%`}
                                />
                                <div 
                                    className="bg-purple-500 transition-all duration-500" 
                                    style={{ width: `${getStatusPercentage(stats.status_breakdown.negotiating)}%` }} 
                                    title={`En discussion: ${getStatusPercentage(stats.status_breakdown.negotiating)}%`}
                                />
                                <div 
                                    className="bg-emerald-500 transition-all duration-500" 
                                    style={{ width: `${getStatusPercentage(stats.status_breakdown.signed)}%` }} 
                                    title={`Signé: ${getStatusPercentage(stats.status_breakdown.signed)}%`}
                                />
                                <div 
                                    className="bg-rose-500 transition-all duration-500" 
                                    style={{ width: `${getStatusPercentage(stats.status_breakdown.refused)}%` }} 
                                    title={`Refusé: ${getStatusPercentage(stats.status_breakdown.refused)}%`}
                                />
                            </div>

                            {/* Details Rows */}
                            <div className="grid gap-3">
                                {[
                                    { key: 'prospect', label: 'Prospects', color: 'bg-blue-500' },
                                    { key: 'contacted', label: 'Contactés', color: 'bg-yellow-500' },
                                    { key: 'negotiating', label: 'En discussion', color: 'bg-purple-500' },
                                    { key: 'signed', label: 'Signés (Contrats)', color: 'bg-emerald-500' },
                                    { key: 'refused', label: 'Refusés', color: 'bg-rose-500' },
                                ].map((item) => {
                                    const count = stats.status_breakdown[item.key as keyof typeof stats.status_breakdown];
                                    const pct = getStatusPercentage(count);
                                    return (
                                        <div key={item.key} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                                                <span className="font-medium text-muted-foreground">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">{count}</span>
                                                <span className="text-xs text-muted-foreground">({pct}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Enterprises */}
                    <Card className="lg:col-span-4 border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Dernières Entreprises Recensées</CardTitle>
                                <CardDescription>Les derniers prospects ou contrats ajoutés.</CardDescription>
                            </div>
                            <Link 
                                href={enterprises.index()}
                                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group transition-colors"
                            >
                                Voir tout
                                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_enterprises.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">Aucune entreprise enregistrée.</div>
                                ) : (
                                    recent_enterprises.map((ent) => (
                                        <div key={ent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border border-transparent hover:border-border/30 transition-all duration-300">
                                            <div className="space-y-1 pr-4 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm text-foreground truncate">{ent.name}</h4>
                                                    {ent.categorie && (
                                                        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded-sm">
                                                            {ent.categorie.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{ent.address}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(ent.outreach_status)}`}>
                                                    {getStatusLabel(ent.outreach_status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Bottom Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Projects Card */}
                    <Card className="border-border/60 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Projets Récents</CardTitle>
                                <CardDescription>Suivi des derniers développements applicatifs.</CardDescription>
                            </div>
                            <Link 
                                href={projects.index()}
                                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group transition-colors"
                            >
                                Voir tout
                                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_projects.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">Aucun projet en cours.</div>
                                ) : (
                                    recent_projects.map((proj) => (
                                        <div key={proj.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border border-transparent hover:border-border/30 transition-all duration-300">
                                            <div className="space-y-1 pr-4 min-w-0">
                                                <h4 className="font-semibold text-sm text-foreground truncate">{proj.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                                    <Building2 className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{proj.enterprises?.name || 'Entreprise inconnue'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${proj.is_finished ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {proj.is_finished ? 'Terminé' : 'En cours'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Access Actions */}
                    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-lg">Raccourcis & Actions</CardTitle>
                            <CardDescription>Accédez directement aux principales fonctionnalités du logiciel.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-auto">
                            <Link 
                                href={enterprises.index()}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/80 dark:border-border/40 hover:border-indigo-500 dark:hover:border-indigo-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 group transition-all duration-300"
                            >
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold">Ajouter Entreprise</div>
                                    <div className="text-xs text-muted-foreground">Créer un nouveau prospect</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link 
                                href={projects.index()}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/80 dark:border-border/40 hover:border-indigo-500 dark:hover:border-indigo-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 group transition-all duration-300"
                            >
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold">Nouveau Projet</div>
                                    <div className="text-xs text-muted-foreground">Lancer un projet client</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link 
                                href={devis.index()}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/80 dark:border-border/40 hover:border-indigo-500 dark:hover:border-indigo-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 group transition-all duration-300"
                            >
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold">Télécharger Devis</div>
                                    <div className="text-xs text-muted-foreground">Stocker une facture/devis</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link 
                                href={dashboard()}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/80 dark:border-border/40 hover:border-indigo-500 dark:hover:border-indigo-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 group transition-all duration-300"
                            >
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold">Galerie Projet</div>
                                    <div className="text-xs text-muted-foreground">Gérer les screenshots</div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
