"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  toggleSessionStatusAction,
  checkInMemberAction,
  checkInVisitorAction,
  removeCheckInRecordAction,
} from "@/actions/attendance.actions";
import { searchMembersForCheckIn, type SessionDetailWithRecords } from "@/services/attendance.service";
import { toast } from "sonner";
import {
  CalendarCheck,
  Check,
  Clock,
  QrCode,
  Search,
  UserPlus,
  Users,
  X,
  Loader2,
  ArrowLeft,
  Building2,
  Lock,
  Unlock,
  Sparkles,
  Phone,
  Trash2,
} from "lucide-react";

interface CheckInStationProps {
  session: SessionDetailWithRecords;
  organizationId: string;
}

export function CheckInStation({ session, organizationId }: CheckInStationProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  // Search members state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<
    { id: string; first_name: string; last_name: string; phone: string | null; isAlreadyCheckedIn: boolean }[]
  >([]);

  // Visitor check-in state
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorPhone, setVisitorPhone] = React.useState("");
  const [visitorEmail, setVisitorEmail] = React.useState("");
  const [isAddingVisitor, setIsAddingVisitor] = React.useState(false);

  // QR modal toggle
  const [showQrModal, setShowQrModal] = React.useState(false);

  // Debounced member search
  React.useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchMembersForCheckIn(organizationId, session.id, searchTerm);
        setSearchResults(results);
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, organizationId, session.id]);

  // Handle Member Check-in
  const handleCheckInMember = (memberId: string, name: string) => {
    startTransition(async () => {
      try {
        const res = await checkInMemberAction(session.id, memberId);
        if (res.success) {
          toast.success(`${name} émargé(e) avec succès !`);
          setSearchTerm("");
          setSearchResults([]);
          router.refresh();
        } else {
          toast.error(res.error || "Erreur lors de l'émargement.");
        }
      } catch {
        toast.error("Erreur de connexion.");
      }
    });
  };

  // Handle Visitor Check-in
  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      toast.error("Veuillez renseigner le nom du visiteur.");
      return;
    }

    try {
      setIsAddingVisitor(true);
      const res = await checkInVisitorAction(session.id, {
        name: visitorName.trim(),
        phone: visitorPhone.trim() || undefined,
        email: visitorEmail.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Visiteur ${visitorName} enregistré avec succès !`);
        setVisitorName("");
        setVisitorPhone("");
        setVisitorEmail("");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement du visiteur.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setIsAddingVisitor(false);
    }
  };

  // Handle Remove Record
  const handleRemoveRecord = (recordId: string, name: string) => {
    if (!confirm(`Annuler l'émargement de ${name} ?`)) return;

    startTransition(async () => {
      try {
        const res = await removeCheckInRecordAction(recordId, session.id);
        if (res.success) {
          toast.success("Émargement annulé.");
          router.refresh();
        } else {
          toast.error(res.error || "Impossible d'annuler.");
        }
      } catch {
        toast.error("Erreur de communication.");
      }
    });
  };

  // Toggle Session Status
  const handleToggleStatus = () => {
    const nextStatus = !session.is_open;
    startTransition(async () => {
      try {
        const res = await toggleSessionStatusAction(session.id, nextStatus);
        if (res.success) {
          toast.success(nextStatus ? "Session rouverte." : "Session clôturée.");
          router.refresh();
        } else {
          toast.error(res.error || "Erreur de modification du statut.");
        }
      } catch {
        toast.error("Erreur de communication.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      {/* 1. Header Card with Session Details & Actions */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/dashboard/attendance">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {session.title}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0.5 px-2 font-medium border ${
                    session.is_open
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border/40"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                      session.is_open ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  {session.is_open ? "Session Ouverte" : "Clôturée"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>{session.services?.name || "Culte"}</span>
                <span>•</span>
                <span>
                  {new Date(session.session_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-muted-foreground/70" />
                  {session.campuses?.name || "Campus Principal"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQrModal(true)}
              className="h-8 text-xs gap-1.5 border-border/60 hover:bg-accent"
            >
              <QrCode className="h-3.5 w-3.5 text-brand-600" />
              <span>Afficher QR Code</span>
            </Button>

            <Button
              variant={session.is_open ? "outline" : "default"}
              size="sm"
              disabled={isPending}
              onClick={handleToggleStatus}
              className={`h-8 text-xs gap-1.5 ${
                session.is_open
                  ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {session.is_open ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Clôturer</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Rouvrir</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Real-time counters row */}
        <div className="grid grid-cols-3 gap-4 pt-4 text-center">
          <div className="p-3 rounded-lg bg-accent/40 border border-border/30">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Présents
            </span>
            <span className="text-2xl font-black text-foreground">
              {session.stats.total}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-accent/40 border border-border/30">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Membres Émargés
            </span>
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {session.stats.members}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-accent/40 border border-border/30">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Visiteurs & Invités
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {session.stats.visitors}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Split Screen: Check-In Controls (Left) & Real-Time Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Member Search + Visitor Form */}
        <div className="lg:col-span-6 space-y-6">
          {/* Member Search & Rapid Check-in */}
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40">
              <Search className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <CardTitle className="text-sm font-bold text-foreground">
                Pointage Rapide d&apos;un Fidèle
              </CardTitle>
            </div>

            <div className="pt-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tapez un prénom, nom ou numéro..."
                  className="pl-9 h-10 text-xs bg-background"
                  disabled={!session.is_open}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Autocomplete Results */}
              {searchResults.length > 0 && (
                <div className="rounded-lg border border-border/60 bg-popover divide-y divide-border/40 shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 flex items-center justify-between gap-2 hover:bg-accent/60 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {m.first_name} {m.last_name}
                        </p>
                        {m.phone && (
                          <p className="text-[10px] text-muted-foreground">
                            {m.phone}
                          </p>
                        )}
                      </div>

                      {m.isAlreadyCheckedIn ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                          <Check className="h-3 w-3 mr-1" /> Déjà présent
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isPending || !session.is_open}
                          onClick={() => handleCheckInMember(m.id, `${m.first_name} ${m.last_name}`)}
                          className="h-7 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Pointer</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Aucun membre trouvé. Enregistrez-le en tant que visiteur ci-dessous.
                </p>
              )}
            </div>
          </Card>

          {/* Visitor Express Form */}
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40">
              <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-bold text-foreground">
                Émarger un Nouveau Visiteur / Invité
              </CardTitle>
            </div>

            <form onSubmit={handleVisitorSubmit} className="pt-3 space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="visitor_name" className="text-xs font-semibold">
                  Nom complet du visiteur <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="visitor_name"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Ex: Patient Baranyikwa"
                  className="h-9 text-xs bg-background"
                  disabled={!session.is_open}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="visitor_phone" className="text-xs font-semibold">
                    Téléphone (WhatsApp)
                  </Label>
                  <Input
                    id="visitor_phone"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+257 79 000 000"
                    className="h-9 text-xs bg-background"
                    disabled={!session.is_open}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="visitor_email" className="text-xs font-semibold">
                    Email
                  </Label>
                  <Input
                    id="visitor_email"
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="visiteur@example.com"
                    className="h-9 text-xs bg-background"
                    disabled={!session.is_open}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isAddingVisitor || !session.is_open}
                className="w-full h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              >
                {isAddingVisitor ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Enregistrer & Émarger le visiteur</span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Attendees Feed */}
        <div className="lg:col-span-6">
          <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-sm font-bold text-foreground">
                    Liste des Présents en Direct ({session.records.length})
                  </CardTitle>
                </div>

                <span className="text-[11px] text-muted-foreground">
                  Dernières entrées en haut
                </span>
              </div>

              <div className="divide-y divide-border/30 mt-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {session.records.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    Aucun émargement pour l&apos;instant. Utilisez le champ de recherche pour pointer des fidèles.
                  </div>
                ) : (
                  session.records.map((r) => {
                    const isVis = r.is_visitor;
                    const displayName = isVis
                      ? r.visitor_name || "Visiteur Inconnu"
                      : r.member
                      ? `${r.member.first_name} ${r.member.last_name}`
                      : "Fidèle";

                    const timeFormatted = new Date(r.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={r.id}
                        className="py-2.5 flex items-center justify-between gap-3 group hover:bg-accent/40 px-1 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarFallback
                              className={`text-xs font-bold ${
                                isVis
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                  : "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                              }`}
                            >
                              {displayName.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground">
                                {displayName}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] py-0 px-1 font-normal ${
                                  isVis
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                    : "bg-brand-500/10 text-brand-600 border-brand-500/30"
                                }`}
                              >
                                {isVis ? "Visiteur" : "Membre"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
                                {timeFormatted}
                              </span>
                              <span>•</span>
                              <span>{r.check_in_method === "QR_CODE" ? "Scan QR" : "Manuel"}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending || !session.is_open}
                          onClick={() => handleRemoveRecord(r.id, displayName)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Annuler l'émargement"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. QR Code Projection Modal / Popup */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-sm p-6 bg-card border-border shadow-2xl relative space-y-4 text-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-foreground">
                QR Code de Pointage
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Projetez ce code sur grand écran ou imprimez-le à l&apos;entrée
              </CardDescription>
            </div>

            {/* Visual SVG QR Code Mockup */}
            <div className="p-6 bg-white rounded-2xl mx-auto inline-block shadow-inner border border-border/30">
              <svg
                viewBox="0 0 160 160"
                className="w-44 h-44 mx-auto text-black fill-current"
              >
                {/* 3 corner markers */}
                <rect x="10" y="10" width="40" height="40" rx="4" fill="currentColor" />
                <rect x="16" y="16" width="28" height="28" fill="white" />
                <rect x="22" y="22" width="16" height="16" fill="currentColor" />

                <rect x="110" y="10" width="40" height="40" rx="4" fill="currentColor" />
                <rect x="116" y="16" width="28" height="28" fill="white" />
                <rect x="122" y="22" width="16" height="16" fill="currentColor" />

                <rect x="10" y="110" width="40" height="40" rx="4" fill="currentColor" />
                <rect x="16" y="116" width="28" height="28" fill="white" />
                <rect x="22" y="122" width="16" height="16" fill="currentColor" />

                {/* Pattern blocks */}
                <rect x="60" y="20" width="10" height="20" fill="currentColor" />
                <rect x="80" y="10" width="20" height="10" fill="currentColor" />
                <rect x="60" y="60" width="40" height="40" fill="currentColor" />
                <rect x="20" y="60" width="20" height="20" fill="currentColor" />
                <rect x="120" y="60" width="20" height="10" fill="currentColor" />
                <rect x="110" y="80" width="20" height="20" fill="currentColor" />
                <rect x="60" y="110" width="20" height="30" fill="currentColor" />
                <rect x="90" y="120" width="30" height="20" fill="currentColor" />
                <rect x="130" y="120" width="10" height="20" fill="currentColor" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-semibold text-foreground">
                Token : {session.qr_code_token?.slice(0, 18) || "SESSION-ACTIVE"}...
              </p>
              <p className="text-[11px] text-muted-foreground">
                Les fidèles scannent avec leur smartphone pour émarger automatiquement.
              </p>
            </div>

            <Button
              onClick={() => setShowQrModal(false)}
              className="w-full text-xs h-9"
            >
              Fermer
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
