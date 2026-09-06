"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { answerPrayerRequestAction } from "@/actions/pastoral.actions";
import { Loader2, X, Sparkles, AlertCircle } from "lucide-react";

interface AnswerPrayerModalProps {
  prayerId: string;
  prayerTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AnswerPrayerModal({
  prayerId,
  prayerTitle,
  isOpen,
  onClose,
}: AnswerPrayerModalProps) {
  const router = useRouter();
  const [testimony, setTestimony] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimony.trim()) {
      setError("Veuillez renseigner le témoignage de l'exaucement.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await answerPrayerRequestAction({
        prayer_id: prayerId,
        answer_testimony: testimony.trim(),
      });

      if (!res.success) {
        setError(res.error || "Impossible d'enregistrer l'exaucement.");
        setLoading(false);
        return;
      }

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 bg-card border border-border rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Prière Exaucée</h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{prayerTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Témoignage de grâce & Louange à Dieu <span className="text-primary">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Décrivez comment le Seigneur est intervenu pour exaucer cette prière (guérison, déblocage financier, conversion, paix)..."
              value={testimony}
              onChange={(e) => setTestimony(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Enregistrer le témoignage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
