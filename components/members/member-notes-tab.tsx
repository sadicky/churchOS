"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createMemberNoteAction } from "@/actions/member.actions";
import { toast } from "sonner";
import {
  Lock,
  MessageSquare,
  Plus,
  Send,
  Loader2,
  Calendar,
  User,
  ShieldAlert,
} from "lucide-react";
import type { MemberDetailed } from "@/services/member.service";

interface MemberNotesTabProps {
  memberId: string;
  notes: MemberDetailed["pastoralNotes"];
}

export function MemberNotesTab({ memberId, notes }: MemberNotesTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Veuillez saisir le texte de la note pastorale.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createMemberNoteAction(memberId, {
        title: title.trim() || undefined,
        content: content.trim(),
        is_private: isPrivate,
      });

      if (res.success) {
        toast.success("Note pastorale consignée avec succès.");
        setTitle("");
        setContent("");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement de la note.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. New Note Form */}
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-bold text-foreground">
              Ajouter une Note Pastorale
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] py-0 px-2 font-medium text-amber-600 border-amber-500/30"
          >
            <Lock className="h-2.5 w-2.5 mr-1" /> Accès réservé aux pasteurs
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Objet de la note (ex: Entretien de fiançailles, Visite d'affermissement...)"
              className="h-9 text-xs bg-background"
            />
          </div>

          <div>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compte-rendu d'entretien, sujets de prière, besoins spirituels ou matériels exprimés..."
              className="w-full rounded-md border border-border/60 bg-background p-3 text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <span>Note confidentielle (visible uniquement par l&apos;équipe pastorale)</span>
            </label>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="h-8 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Enregistrer la note</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Existing Notes Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Historique des Notes Pastorales ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground border-border/40">
            Aucune note pastorale n&apos;a encore été enregistrée pour ce membre.
          </Card>
        ) : (
          notes.map((note) => {
            const authorName = note.author
              ? `${note.author.first_name} ${note.author.last_name}`.trim()
              : "Équipe Pastorale";

            return (
              <Card
                key={note.id}
                className="p-4 border-border/50 bg-card/60 backdrop-blur-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    {note.title && (
                      <p className="text-xs font-bold text-foreground">
                        {note.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="h-3 w-3 text-brand-600" />
                        {authorName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/60" />
                        {new Date(note.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {note.is_private && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground bg-muted/60 shrink-0"
                    >
                      <Lock className="h-2.5 w-2.5 mr-1" /> Confidentiel
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed pt-1 border-t border-border/30">
                  {note.content}
                </p>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
