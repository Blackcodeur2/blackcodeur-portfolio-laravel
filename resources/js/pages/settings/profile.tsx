import { Form, Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';
import { Camera, Phone, Calendar, User2, Mail, FileText, UploadCloud, Loader2, Briefcase } from 'lucide-react';
import { useRef, useState } from 'react';

type PageProps = {
    auth: Auth;
};

interface PortfolioProfile {
    id: number;
    name: string;
    email: string;
    telephone: string;
    birth_date: string;
    sexe: 'M' | 'F';
    bio: string | null;
    profile_picture: string | null;
}

export default function Profile({
    mustVerifyEmail,
    status,
    portfolioProfile,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    portfolioProfile?: PortfolioProfile | null;
}) {
    const { auth } = usePage<PageProps>().props;

    // Portfolio profile form state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        portfolioProfile?.profile_picture ? `/storage/${portfolioProfile.profile_picture}` : null,
    );
    const [portfolioData, setPortfolioData] = useState({
        name: portfolioProfile?.name ?? auth.user.name,
        email: portfolioProfile?.email ?? auth.user.email,
        telephone: portfolioProfile?.telephone ?? '',
        birth_date: portfolioProfile?.birth_date ? portfolioProfile.birth_date.substring(0, 10) : '',
        sexe: portfolioProfile?.sexe ?? 'M',
        bio: portfolioProfile?.bio ?? '',
        skills: portfolioProfile?.skills ?? '',
        education: portfolioProfile?.education ?? '',
    });
    const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
    const [portfolioProcessing, setPortfolioProcessing] = useState(false);
    const [portfolioErrors, setPortfolioErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setPortfolioFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handlePortfolioSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPortfolioProcessing(true);
        setPortfolioErrors({});

        const formData = new FormData();
        Object.entries(portfolioData).forEach(([k, v]) => formData.append(k, v));
        if (portfolioFile) {
            formData.append('profile_picture', portfolioFile);
        }
        formData.append('_method', 'POST');

        router.post('/settings/portfolio-profile', formData, {
            forceFormData: true,
            onError: (errors) => setPortfolioErrors(errors),
            onFinish: () => setPortfolioProcessing(false),
        });
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-10">
                {/* ── Section 1: Account info (name + email) ── */}
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Compte"
                        description="Mettez à jour votre nom et adresse e-mail de connexion."
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nom complet"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Adresse e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Votre adresse e-mail n'est pas vérifiée.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Cliquez ici pour renvoyer l'email de vérification.
                                            </Link>
                                        </p>
                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                Un nouveau lien de vérification a été envoyé.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} data-test="update-profile-button">
                                        Enregistrer
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="border-t border-border/50" />

                {/* ── Section 2: Portfolio public profile ── */}
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profil public"
                        description="Ces informations s'affichent sur votre portfolio public (page d'accueil)."
                    />

                    <form onSubmit={handlePortfolioSubmit} className="space-y-6">
                        {/* Avatar upload */}
                        <div className="flex items-center gap-6">
                            <div className="relative shrink-0">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 border-border ring-2 ring-indigo-500/20">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Photo de profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <User2 className="h-10 w-10 opacity-30" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-500 transition-colors"
                                    title="Changer la photo"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Photo de profil</p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG ou WebP. Max 2 Mo. Cette photo apparaîtra dans la section Hero.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                >
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    Choisir une photo
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio-name" className="flex items-center gap-1.5">
                                    <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    Nom affiché *
                                </Label>
                                <Input
                                    id="portfolio-name"
                                    value={portfolioData.name}
                                    onChange={(e) => setPortfolioData({ ...portfolioData, name: e.target.value })}
                                    placeholder="Votre nom ou pseudonyme"
                                    required
                                />
                                {portfolioErrors.name && <p className="text-xs text-rose-500">{portfolioErrors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio-email" className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    Email de contact *
                                </Label>
                                <Input
                                    id="portfolio-email"
                                    type="email"
                                    value={portfolioData.email}
                                    onChange={(e) => setPortfolioData({ ...portfolioData, email: e.target.value })}
                                    placeholder="contact@exemple.com"
                                    required
                                />
                                {portfolioErrors.email && (
                                    <p className="text-xs text-rose-500">{portfolioErrors.email}</p>
                                )}
                            </div>

                            {/* Telephone */}
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio-telephone" className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    Téléphone *
                                </Label>
                                <Input
                                    id="portfolio-telephone"
                                    type="tel"
                                    value={portfolioData.telephone}
                                    onChange={(e) => setPortfolioData({ ...portfolioData, telephone: e.target.value })}
                                    placeholder="+33 6 00 00 00 00"
                                    required
                                />
                                {portfolioErrors.telephone && (
                                    <p className="text-xs text-rose-500">{portfolioErrors.telephone}</p>
                                )}
                            </div>

                            {/* Birth date */}
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio-birth-date" className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    Date de naissance *
                                </Label>
                                <Input
                                    id="portfolio-birth-date"
                                    type="date"
                                    value={portfolioData.birth_date}
                                    onChange={(e) => setPortfolioData({ ...portfolioData, birth_date: e.target.value })}
                                    required
                                />
                                {portfolioErrors.birth_date && (
                                    <p className="text-xs text-rose-500">{portfolioErrors.birth_date}</p>
                                )}
                            </div>

                            {/* Sexe */}
                            <div className="grid gap-2">
                                <Label htmlFor="portfolio-sexe">Genre *</Label>
                                <select
                                    id="portfolio-sexe"
                                    value={portfolioData.sexe}
                                    onChange={(e) =>
                                        setPortfolioData({ ...portfolioData, sexe: e.target.value as 'M' | 'F' })
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                                    required
                                >
                                    <option value="M">Homme</option>
                                    <option value="F">Femme</option>
                                </select>
                                {portfolioErrors.sexe && (
                                    <p className="text-xs text-rose-500">{portfolioErrors.sexe}</p>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="grid gap-2">
                            <Label htmlFor="portfolio-bio" className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                Biographie / Description
                            </Label>
                            <textarea
                                id="portfolio-bio"
                                rows={4}
                                value={portfolioData.bio}
                                onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                                placeholder="Décrivez votre activité, vos compétences, votre approche..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">
                                {portfolioData.bio.length}/1000 caractères
                            </p>
                            {portfolioErrors.bio && <p className="text-xs text-rose-500">{portfolioErrors.bio}</p>}
                        </div>

                        {/* Skills */}
                        <div className="grid gap-2">
                            <Label htmlFor="portfolio-skills" className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                Compétences (Séparées par des virgules)
                            </Label>
                            <Input
                                id="portfolio-skills"
                                value={portfolioData.skills}
                                onChange={(e) => setPortfolioData({ ...portfolioData, skills: e.target.value })}
                                placeholder="React, Laravel, Tailwind CSS, TypeScript, SQL..."
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Saisissez vos compétences séparées par des virgules pour qu'elles s'affichent sous forme de badges.
                            </p>
                            {portfolioErrors.skills && <p className="text-xs text-rose-500">{portfolioErrors.skills}</p>}
                        </div>

                        {/* Education */}
                        <div className="grid gap-2">
                            <Label htmlFor="portfolio-education" className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                Cursus de formation / Expérience (Un par ligne)
                            </Label>
                            <textarea
                                id="portfolio-education"
                                rows={5}
                                value={portfolioData.education}
                                onChange={(e) => setPortfolioData({ ...portfolioData, education: e.target.value })}
                                placeholder="Ex: 2024 - Présent : Développeur Lead chez LaraReact&#10;2022 - 2024 : Master Ingénierie Web à Paris&#10;2019 - 2022 : Licence Informatique..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Entrez chaque étape sur une nouvelle ligne au format : **Années : Titre / Description** pour générer un parcours chronologique.
                            </p>
                            {portfolioErrors.education && <p className="text-xs text-rose-500">{portfolioErrors.education}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={portfolioProcessing}>
                                {portfolioProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer le profil public'
                                )}
                            </Button>
                            {portfolioProfile && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Profil public actif
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
