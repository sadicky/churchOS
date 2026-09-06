import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Church,
  ShieldCheck,
  Users,
  CalendarDays,
  Coins,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Terminal,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants/site";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-amber-500/15 blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-800 to-brand-600 text-white shadow-md shadow-brand-900/20">
              <Church className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-foreground">
                  ChurchOS
                </span>
                <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-semibold">
                  v0.1.0 • Foundation
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                SaaS Moderne de Gestion des Églises
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/auth/login">Connexion</Link>
            </Button>
            <Button size="sm" variant="default" asChild className="gap-1.5 shadow-sm">
              <Link href="/auth/register">
                <span>Démarrer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="container py-16 md:py-24 lg:py-28 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6 shadow-sm animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Architecture multi-tenant & PostgreSQL RLS de nouvelle génération</span>
          </div>

          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Gérez votre église.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-amber-400">
              Développez votre communauté.
            </span>{" "}
            Centralisez votre ministère.
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            ChurchOS est le système d&apos;exploitation tout-en-un conçu pour les assemblées,
            ministères et organisations chrétiennes. De l&apos;accueil des membres aux cultes,
            des finances au suivi pastoral, chaque action est sécurisée et unifiée.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-6 shadow-md" asChild>
              <Link href="/auth/register">
                <span>Créer mon église</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6" asChild>
              <Link href="/auth/login">Accéder à l&apos;espace membre</Link>
            </Button>
          </div>

          {/* Foundation Status Card */}
          <div className="mt-14 w-full max-w-3xl">
            <Card className="border-border/60 shadow-lg bg-card/70 backdrop-blur-md">
              <CardHeader className="text-left border-b border-border/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Phase 1 — Foundation Validée
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Socle technique opérationnel, typé et prêt pour la Phase 2 (Database & RLS)
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" className="self-start sm:self-auto gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    Opérationnel
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-lg border border-border/40 bg-background/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Frontend</span>
                  <span className="text-sm font-semibold text-foreground">Next.js 15 App Router</span>
                </div>
                <div className="p-3 rounded-lg border border-border/40 bg-background/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Design System</span>
                  <span className="text-sm font-semibold text-foreground">Tailwind + shadcn/ui</span>
                </div>
                <div className="p-3 rounded-lg border border-border/40 bg-background/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Backend & Auth</span>
                  <span className="text-sm font-semibold text-foreground">Supabase SSR</span>
                </div>
                <div className="p-3 rounded-lg border border-border/40 bg-background/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Multi-tenancy</span>
                  <span className="text-sm font-semibold text-foreground">PostgreSQL RLS Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modules Overview Grid */}
        <section className="container py-12 border-t border-border/40">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Les piliers modulaires de ChurchOS
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chaque dimension de la vie ecclésiale est prise en compte avec rigueur pastorale et précision technique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">CRM Membres & Familles</CardTitle>
                <CardDescription className="text-xs">
                  Fiches détaillées, statuts de baptême, groupes de maison, ministères et historique d&apos;engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Cultes & Présences QR</CardTitle>
                <CardDescription className="text-xs">
                  Gestion des services, pointage manuel ou par QR Code instantané, statistiques de fréquentation en direct.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <Coins className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Finances, Dîmes & Dons</CardTitle>
                <CardDescription className="text-xs">
                  Multi-devises (USD, EUR, BIF, CDF, KES), comptes de trésorerie, budgets prévisionnels et reçus fiscaux.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Sermons & Médiathèque</CardTitle>
                <CardDescription className="text-xs">
                  Partage d&apos;enseignements audio, vidéo, PDF de prédication reliés aux versets bibliques via Supabase Storage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Suivi Pastoral Confidentiel</CardTitle>
                <CardDescription className="text-xs">
                  Visites pastorales, requêtes de prière et notes strictement protégées par PostgreSQL Row Level Security.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Multi-Campus & Rôles RBAC</CardTitle>
                <CardDescription className="text-xs">
                  Isolation totale des données, gestion multi-campus et permissions granulaires pour pasteurs et responsables.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Church className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">ChurchOS</span>
            <span>— Plateforme SaaS moderne pour églises</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Next.js 15</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>TailwindCSS</span>
            <span>•</span>
            <span>PostgreSQL RLS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
