"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendBroadcastAction } from "@/actions/communication.actions";
import type { AudienceCounts } from "@/types";
import {
  Loader2,
  ArrowLeft,
  Send,
  Smartphone,
  Mail,
  Bell,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface BroadcastFormProps {
  audienceCounts: AudienceCounts;
}

export function BroadcastForm({ audienceCounts }: BroadcastFormProps) {
  const router = useRouter();

  const [channel, setChannel] = useState<"SMS" | "EMAIL" | "NOTIFICATION">("SMS");
  const [targetAudience, setTargetAudience] = useState<"ALL" | "LEADERS" | "VOLUNTEERS" | "VISITORS">("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentResult, setSentResult] = useState<{ recipients: number } | null>(null);

  const getTargetCount = () => {
    switch (targetAudience) {
      case "LEADERS":
        return audienceCounts.leaders;
      case "VOLUNTEERS":
        return audienceCounts.volunteers;
      case "VISITORS":
        return audienceCounts.visitors;
      case "ALL":
      default:
        return audienceCounts.all;
    }
  };

  const recipientCount = getTargetCount();
  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Veuillez renseigner le titre et le message de diffusion.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await sendBroadcastAction({
        channel,
        target_audience: targetAudience,
        title: title.trim(),
        message: message.trim(),
      });

      if (!res.success) {
        setError(res.error || "Erreur lors de l'envoi de la diffusion.");
        setLoading(false);
        return;
      }

      setSentResult({ recipients: res.recipientsCount || recipientCount });
      setTimeout(() => {
        router.push("/dashboard/communication?tab=broadcasts");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/dashboard/communication?tab=broadcasts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux diffusions
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {sentResult && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Diffusion envoyée avec succès à <strong>{sentResult.recipients} fidèles</strong> ! Redirection en cours...
          </span>
        </div>
      )}

      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Lancer une campagne de communication
            </h2>
            <p className="text-xs text-muted-foreground">
              Sélectionnez le canal et l&apos;audience cible pour diffuser instantanément votre message.
            </p>
          </div>
        </div>

        {/* Sélection du canal */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">
            Canal de diffusion <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setChannel("SMS")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                channel === "SMS"
                  ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="p-2 rounded-lg bg-secondary text-primary shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SMS Groupé</p>
                <p className="text-[11px] text-muted-foreground">Téléphones portables</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setChannel("EMAIL")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                channel === "EMAIL"
                  ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="p-2 rounded-lg bg-secondary text-blue-500 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Emailing</p>
                <p className="text-[11px] text-muted-foreground">Courrier électronique</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setChannel("NOTIFICATION")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition ${
                channel === "NOTIFICATION"
                  ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="p-2 rounded-lg bg-secondary text-purple-500 shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Notification</p>
                <p className="text-[11px] text-muted-foreground">Application interne</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sélection de l'audience */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">
            Audience ciblée <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetAudience("ALL")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                targetAudience === "ALL"
                  ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Tous les membres actifs</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {audienceCounts.all} fidèles
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetAudience("LEADERS")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                targetAudience === "LEADERS"
                  ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-foreground">Conducteurs de cellules</span>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {audienceCounts.leaders} leaders
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetAudience("VOLUNTEERS")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                targetAudience === "VOLUNTEERS"
                  ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-foreground">Bénévoles de ministères</span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {audienceCounts.volunteers} serviteurs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetAudience("VISITORS")}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                targetAudience === "VISITORS"
                  ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">Nouveaux visiteurs récents</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {audienceCounts.visitors} visiteurs
              </span>
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Objet / Titre du message <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Rappel Culte Spécial de Pâques, Convocation des Responsables..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Corps du message <span className="text-primary">*</span>
              </label>

              {channel === "SMS" && (
                <span className="text-xs font-mono text-muted-foreground">
                  {charCount} car. • {smsSegments} SMS / pers.
                </span>
              )}
            </div>

            <textarea
              rows={4}
              required
              placeholder="Rédigez le texte qui sera transmis à l'audience sélectionnée..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Portée estimée : <strong className="text-foreground">{recipientCount} destinataires</strong>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/communication?tab=broadcasts"
            className="px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || recipientCount === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Diffuser aux {recipientCount} fidèles
          </button>
        </div>
      </div>
    </form>
  );
}
