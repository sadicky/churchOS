import Link from "next/link";
import { Church, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left panel: Spiritual & Modern SaaS branding (visible on desktop) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white overflow-hidden border-r border-brand-800/40">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-500 blur-[130px]" />
        </div>

        {/* Top header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white shadow-lg shadow-brand-900/50">
            <Church className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ChurchOS</h1>
            <p className="text-xs text-brand-200/80">
              SaaS Moderne de Gestion des Églises
            </p>
          </div>
        </div>

        {/* Middle quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-brand-100 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Excellence dans l&apos;intendance de l&apos;Église</span>
          </div>
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-brand-50">
            « Car Dieu n&apos;est pas un Dieu de désordre, mais de paix. Que tout
            se fasse avec bienséance et avec ordre. »
          </blockquote>
          <p className="text-sm font-semibold text-amber-400">
            1 Corinthiens 14:33, 40
          </p>

          <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 text-xs text-brand-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Données isolées & sécurisées RLS</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-brand-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Multi-campus & devises locales</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-brand-300/70">
          © {new Date().getFullYear()} ChurchOS. Tous droits réservés.
        </div>
      </div>

      {/* Right panel: Auth Forms */}
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between p-6 md:px-10">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
