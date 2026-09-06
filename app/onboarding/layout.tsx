import { Church } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-900 text-white shadow-sm">
              <Church className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">ChurchOS</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                  Onboarding
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:inline">
                Configuration de votre église en 6 étapes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-4xl py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        ChurchOS — Système multi-tenant sécurisé par PostgreSQL Row Level Security
      </footer>
    </div>
  );
}
