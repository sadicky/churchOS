"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createMemberAction, updateMemberAction } from "@/actions/member.actions";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Briefcase,
  Church,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";
import type { Member, Campus } from "@/types";
import type { MemberFormInput } from "@/schemas/member.schema";

interface MemberFormProps {
  initialData?: Member;
  campuses: Campus[];
  mode: "create" | "edit";
}

export function MemberForm({ initialData, campuses, mode }: MemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<MemberFormInput>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    gender: (initialData?.gender as "MALE" | "FEMALE" | "OTHER") || "MALE",
    date_of_birth: initialData?.date_of_birth || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    country: initialData?.country || "Burundi",
    marital_status:
      (initialData?.marital_status as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED") || "SINGLE",
    occupation: initialData?.occupation || "",
    membership_status: initialData?.membership_status || "ACTIVE",
    campus_id: initialData?.campus_id || (campuses[0]?.id || ""),
    join_date: initialData?.join_date || new Date().toISOString().slice(0, 10),
    baptism_date: initialData?.baptism_date || "",
    emergency_contact_name: initialData?.emergency_contact_name || "",
    emergency_contact_phone: initialData?.emergency_contact_phone || "",
    emergency_contact_relation: initialData?.emergency_contact_relation || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("Veuillez renseigner le prénom et le nom de famille.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const res = await createMemberAction(formData);
        if (res.success && res.memberId) {
          toast.success("Membre enregistré avec succès.");
          router.push(`/dashboard/members/${res.memberId}`);
          router.refresh();
        } else {
          toast.error(res.error || "Erreur lors de l'enregistrement.");
        }
      } else if (initialData?.id) {
        const res = await updateMemberAction(initialData.id, formData);
        if (res.success) {
          toast.success("Fiche du membre mise à jour.");
          router.push(`/dashboard/members/${initialData.id}`);
          router.refresh();
        } else {
          toast.error(res.error || "Erreur lors de la mise à jour.");
        }
      }
    } catch {
      toast.error("Erreur inattendue de communication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Identité & État civil */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Identité & État Civil
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Renseignements légaux et démographiques du fidèle
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name" className="text-xs font-semibold">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Ex: David"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name" className="text-xs font-semibold">
              Nom de famille <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Ex: Ndayisaba"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs font-semibold">
              Genre
            </Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || "MALE"}
              onChange={handleChange}
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs focus:ring-1 focus:ring-brand-500"
            >
              <option value="MALE">Masculin (Homme)</option>
              <option value="FEMALE">Féminin (Femme)</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date_of_birth" className="text-xs font-semibold">
              Date de naissance
            </Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marital_status" className="text-xs font-semibold">
              État matrimonial
            </Label>
            <select
              id="marital_status"
              name="marital_status"
              value={formData.marital_status || "SINGLE"}
              onChange={handleChange}
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs focus:ring-1 focus:ring-brand-500"
            >
              <option value="SINGLE">Célibataire</option>
              <option value="MARRIED">Marié(e)</option>
              <option value="DIVORCED">Divorcé(e)</option>
              <option value="WIDOWED">Veuf / Veuve</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="occupation" className="text-xs font-semibold">
              Profession / Activité
            </Label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              placeholder="Ex: Médecin, Enseignant, Étudiant..."
              className="h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Coordonnées & Domicile */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Coordonnées & Localisation
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Contacts pour communications pastorales et visites à domicile
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Numéro de téléphone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Ex: +257 79 000 000"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Adresse email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Ex: david@example.com"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold">
              Adresse résidentielle / Quartier
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Ex: Quartier Rohero, Av. de l'Université No 12"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold">
              Ville
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              placeholder="Ex: Bujumbura"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs font-semibold">
              Pays
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              placeholder="Ex: Burundi"
              className="h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Vie d'église & Spiritualité */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Church className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Vie d&apos;Église & Jalons Spirituels
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Rattachement, engagement chrétien et sacrements
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="membership_status" className="text-xs font-semibold">
              Statut d&apos;appartenance
            </Label>
            <select
              id="membership_status"
              name="membership_status"
              value={formData.membership_status}
              onChange={handleChange}
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs focus:ring-1 focus:ring-brand-500"
            >
              <option value="ACTIVE">Membre actif</option>
              <option value="VISITOR">Visiteur régulier / Invité</option>
              <option value="NEW_CONVERT">Nouveau converti</option>
              <option value="INACTIVE">Inactif</option>
              <option value="TRANSFERRED">Transféré vers une autre église</option>
              <option value="DECEASED">Décédé</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="campus_id" className="text-xs font-semibold">
              Campus de rattachement
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
            <Label htmlFor="join_date" className="text-xs font-semibold">
              Date de première venue / adhésion
            </Label>
            <Input
              id="join_date"
              name="join_date"
              type="date"
              value={formData.join_date || ""}
              onChange={handleChange}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="baptism_date" className="text-xs font-semibold">
              Date du baptême par immersion
            </Label>
            <Input
              id="baptism_date"
              name="baptism_date"
              type="date"
              value={formData.baptism_date || ""}
              onChange={handleChange}
              className="h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Contact d'Urgence & Notes */}
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Contact d&apos;Urgence & Remarques
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Personne à prévenir en cas de besoin et suivi particulier
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact_name" className="text-xs font-semibold">
              Nom du contact d&apos;urgence
            </Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name || ""}
              onChange={handleChange}
              placeholder="Ex: Marie Ndayisaba"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact_phone" className="text-xs font-semibold">
              Téléphone d&apos;urgence
            </Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone || ""}
              onChange={handleChange}
              placeholder="Ex: +257 79 111 222"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact_relation" className="text-xs font-semibold">
              Lien de parenté
            </Label>
            <Input
              id="emergency_contact_relation"
              name="emergency_contact_relation"
              value={formData.emergency_contact_relation || ""}
              onChange={handleChange}
              placeholder="Ex: Épouse, Frère, Mère..."
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Notes générales & Observations
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Historique pastoral, souhaits d'intégration, dons spirituels remarqués..."
              className="w-full rounded-md border border-border/60 bg-background p-3 text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Footer */}
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
              <span>
                {mode === "create" ? "Créer la fiche du membre" : "Sauvegarder les modifications"}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
