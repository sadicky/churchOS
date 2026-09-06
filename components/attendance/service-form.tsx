"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createServiceAction } from "@/actions/attendance.actions";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { Campus } from "@/types";
import type { ServiceFormInput } from "@/schemas/attendance.schema";

interface ServiceFormProps {
  campuses: Campus[];
}

export function ServiceForm({ campuses }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<ServiceFormInput>({
    name: "Culte de Célébration Dominicale",
    service_date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_time: "11:30",
    preacher_name: "",
    worship_leader_name: "",
    theme: "",
    scripture_reference: "",
    campus_id: campuses[0]?.id || "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.service_date || !formData.start_time) {
      toast.error("Veuillez remplir au moins le nom, la date et l'heure du culte.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createServiceAction(formData);

      if (res.success) {
        toast.success("Culte planifié avec succès !");
        router.push("/dashboard/attendance");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la planification.");
      }
    } catch {
      toast.error("Erreur inattendue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Paramètres du Culte & Liturgie
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Définissez les détails de la réunion pour le programme et le pointage
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Intitulé du culte / rassemblement <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Culte de Célébration & Sainte-Cène"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service_date" className="text-xs font-semibold">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="service_date"
                name="service_date"
                type="date"
                required
                value={formData.service_date}
                onChange={handleChange}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_time" className="text-xs font-semibold">
                Heure début <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_time" className="text-xs font-semibold">
                Heure fin
              </Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time || ""}
                onChange={handleChange}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="preacher_name" className="text-xs font-semibold">
                Prédicateur / Orateur
              </Label>
              <Input
                id="preacher_name"
                name="preacher_name"
                value={formData.preacher_name || ""}
                onChange={handleChange}
                placeholder="Ex: Pasteur Jean-Paul"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="worship_leader_name" className="text-xs font-semibold">
                Conducteur de Louange
              </Label>
              <Input
                id="worship_leader_name"
                name="worship_leader_name"
                value={formData.worship_leader_name || ""}
                onChange={handleChange}
                placeholder="Ex: Frère Christian"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="theme" className="text-xs font-semibold">
                Thème du message
              </Label>
              <Input
                id="theme"
                name="theme"
                value={formData.theme || ""}
                onChange={handleChange}
                placeholder="Ex: La puissance de la foi persévérante"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scripture_reference" className="text-xs font-semibold">
                Passage biblique clé
              </Label>
              <Input
                id="scripture_reference"
                name="scripture_reference"
                value={formData.scripture_reference || ""}
                onChange={handleChange}
                placeholder="Ex: Hébreux 11:1-6"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="campus_id" className="text-xs font-semibold">
              Campus de célébration
            </Label>
            <select
              id="campus_id"
              name="campus_id"
              value={formData.campus_id || ""}
              onChange={handleChange}
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Campus par défaut</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Notes liturgiques & Consignes d&apos;accueil
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Consignes particulières pour l'équipe du protocole, communion, offrandes..."
              className="w-full rounded-md border border-border/60 bg-background p-3 text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-10 text-xs border-border/60 hover:bg-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Retour
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-6 text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Planifier le culte</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
