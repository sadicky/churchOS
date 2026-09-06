"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPrayerRequestAction } from "@/actions/pastoral.actions";
import type { SimpleMemberSelect } from "@/services/pastoral.service";
import {
  Loader2,
  ArrowLeft,
  Save,
  HeartHandshake,
  AlertCircle,
  Globe,
  Users,
  Lock,
} from "lucide-react";

interface PrayerFormProps {
  members: SimpleMemberSelect[];
}

export function PrayerForm({ members }: PrayerFormProps) {
  const router = useRouter();

  const [requesterName, setRequesterName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "MEMBERS_ONLY" | "PASTORAL_ONLY">("MEMBERS_ONLY");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS">("PENDING");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMemberChange = (id: string) => {
    setMemberId(id);
    if (id) {
      const found = members.find((m) => m.id === id);
      if (found) {
        setRequesterName(`${found.first_name} ${found.last_name}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || !title.trim() || !description.trim()) {
      setError("Veuillez renseigner le nom du demandeur, le sujet et la description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createPrayerRequestAction({
        requester_name: requesterName.trim(),
        member_id: memberId || null,
        title: title.trim(),
        description: description.trim(),
        visibility,
        status,
      });

      if (!res.success) {
        setError(res.error || "Erreur lors de l'enregistrement.");
        setLoading(false);
        return;
      }

      router.push("/dashboard/pastoral?tab=prayers");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/dashboard/pastoral?tab=prayers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au mur d&apos;intercession
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Déposer une requête d&apos;intercession
            </h2>
            <p className="text-xs text-muted-foreground">
              Sujet de prière confié par un fidèle ou une famille pour soutien spirituel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Fidèle répertorié (optionnel)
            </label>
            <select
              value={memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="">Sélectionner un membre de l&apos;église</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name.toUpperCase()} {m.first_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Nom du demandeur <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Marie Dubois, Frère Joseph..."
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Sujet de prière <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex : Guérison après intervention, Réussite aux examens, Voyage missionnaire..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Détail de l&apos;intercession <span className="text-primary">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Circonstances, date de l'opération, fardeau partagé, versets à proclamer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Niveau de visibilité
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="MEMBERS_ONLY">Membres de l&apos;église uniquement</option>
              <option value="PASTORAL_ONLY">Équipe pastorale seule (Confidentiel)</option>
              <option value="PUBLIC">Publique (Visible de tous)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Statut initial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="PENDING">En attente de prise en charge</option>
              <option value="IN_PROGRESS">Directement pris en intercession</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link
          href="/dashboard/pastoral?tab=prayers"
          className="px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Déposer le sujet de prière
        </button>
      </div>
    </form>
  );
}
