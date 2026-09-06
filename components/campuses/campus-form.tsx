"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCampusAction, updateCampusAction } from "@/actions/campus.actions";
import type { Campus } from "@/types";
import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CampusFormProps {
  initialData?: Campus | null;
}

export function CampusForm({ initialData }: CampusFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [isMain, setIsMain] = useState(initialData?.is_main ?? false);
  const [pastorName, setPastorName] = useState(initialData?.pastor_name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "Burundi");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom du campus est obligatoire.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      code: code.trim() || null,
      is_main: isMain,
      pastor_name: pastorName.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      country: country.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateCampusAction(initialData.id, payload);
        if (res?.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        router.push(`/dashboard/campuses/${initialData.id}`);
      } else {
        const res = await createCampusAction(payload);
        if (res?.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        router.push("/dashboard/campuses");
      }
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href={isEditing && initialData ? `/dashboard/campuses/${initialData.id}` : "/dashboard/campuses"}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Building2 className="h-4 w-4" />
            <span>Gestion Territoriale & Sites</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? `Modifier : ${initialData?.name}` : "Nouveau Campus ou Site"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Renseignez les coordonnées géographiques, le pasteur référent et le statut du campus.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-6">
          {/* Section Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Identification du Campus
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="campus-name" className="text-xs font-semibold">
                  Nom officiel du Campus <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="campus-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Campus Central (Sanctuaire Principal)"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campus-code" className="text-xs font-semibold">
                  Code / Réf
                </Label>
                <Input
                  id="campus-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: CC-01"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Toggle Siège Principal */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Désigner comme Siège Principal</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le siège principal héberge l&apos;administration centrale et sert de campus par défaut pour les nouveaux fidèles.
                </p>
              </div>

              <input
                type="checkbox"
                id="is-main-toggle"
                checked={isMain}
                onChange={(e) => setIsMain(e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastor-name" className="text-xs font-semibold">
                Pasteur référent ou Responsable de site
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pastor-name"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  placeholder="Ex: Pasteur Jean-Paul Mukendi"
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section Localisation & Contact */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Localisation & Coordonnées
            </h3>

            <div className="space-y-2">
              <Label htmlFor="campus-address" className="text-xs font-semibold">
                Adresse physique / Quartier / Avenue
              </Label>
              <Input
                id="campus-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Avenue de l'OUA, Quartier Rohero I"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campus-city" className="text-xs font-semibold">
                  Ville
                </Label>
                <Input
                  id="campus-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Bujumbura"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campus-country" className="text-xs font-semibold">
                  Pays
                </Label>
                <Input
                  id="campus-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ex: Burundi"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campus-phone" className="text-xs font-semibold">
                  Téléphone du site
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="campus-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +257 22 22 22 22"
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campus-email" className="text-xs font-semibold">
                  Email de contact
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="campus-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contact@campus.churchos.org"
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/campuses"
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </Link>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-sm shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enregistrement en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Mettre à jour le campus" : "Créer le campus"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
