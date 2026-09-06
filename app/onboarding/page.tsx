"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants/site";
import { completeOnboardingAction } from "@/actions/onboarding.actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Church,
  Globe,
  Layers,
  Loader2,
  Mail,
  Network,
  Plus,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import type { CompleteOnboardingInput, InvitationItemInput } from "@/schemas/onboarding.schema";

const CHURCH_TYPES = [
  {
    id: "LOCAL_CHURCH",
    title: "Église locale",
    description: "Une communauté ecclésiale établie avec cultes réguliers, groupes et membres permanents.",
    icon: Church,
  },
  {
    id: "MINISTRY",
    title: "Ministère / Mission",
    description: "Structure d'évangélisation, d'enseignement ou d'action sociale avec activités ciblées.",
    icon: Globe,
  },
  {
    id: "ASSEMBLY",
    title: "Assemblée chrétienne",
    description: "Rassemblement autonome ou cellule de réveil axé sur la prière et la communion fraternelle.",
    icon: Users,
  },
  {
    id: "CHRISTIAN_ORGANIZATION",
    title: "Organisation chrétienne",
    description: "ONG, réseau d'églises, école biblique ou œuvre humanitaire chrétienne.",
    icon: Layers,
  },
] as const;

const DEFAULT_DEPARTMENTS = [
  { name: "Louange & Adoration", description: "Chantres, musiciens et animateurs de culte", selected: true },
  { name: "Média & Multimédia", description: "Sonorisation, projection, réseaux sociaux et diffusion", selected: true },
  { name: "Accueil & Protocole", description: "Orientation des fidèles et service aux portes", selected: true },
  { name: "Intercession & Prière", description: "Sentinelles et réunions de prière", selected: true },
  { name: "Jeunesse & Étudiants", description: "Accompagnement spirituel et activités de jeunes", selected: true },
  { name: "École du Dimanche (Enfants)", description: "Enseignement biblique adapté aux enfants", selected: true },
  { name: "Évangélisation & Social", description: "Visites extérieures, entraide et missions", selected: false },
  { name: "Sécurité & Logistique", description: "Gestion des accès et maintenance des locaux", selected: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState<CompleteOnboardingInput>({
    personal: {
      firstName: "",
      lastName: "",
      phone: "",
      title: "Pasteur Principal",
    },
    church: {
      name: "",
      slug: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "Burundi",
      website: "",
      currency: "USD",
      timezone: "Africa/Bujumbura",
      campusName: "Campus Principal",
    },
    type: {
      type: "LOCAL_CHURCH",
    },
    departments: {
      departments: DEFAULT_DEPARTMENTS,
    },
    invitations: {
      invitations: [],
    },
  });

  // Invitation draft state
  const [newInvite, setNewInvite] = React.useState<InvitationItemInput>({
    email: "",
    role: "PASTOR",
    department: "",
  });

  // Custom department draft state
  const [customDeptName, setCustomDeptName] = React.useState("");

  // Helper to generate slug from name
  function handleChurchNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      church: {
        ...prev.church,
        name,
        slug: slug || prev.church.slug,
      },
    }));
  }

  function handleAddDepartment() {
    if (!customDeptName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      departments: {
        departments: [
          ...prev.departments.departments,
          { name: customDeptName.trim(), description: "Département personnalisé", selected: true },
        ],
      },
    }));
    setCustomDeptName("");
  }

  function toggleDepartment(index: number) {
    setFormData((prev) => {
      const updated = [...prev.departments.departments];
      updated[index].selected = !updated[index].selected;
      return {
        ...prev,
        departments: { departments: updated },
      };
    });
  }

  function handleAddInvitation() {
    if (!newInvite.email || !newInvite.email.includes("@")) {
      toast.error("Veuillez renseigner une adresse email valide.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      invitations: {
        invitations: [...prev.invitations.invitations, newInvite],
      },
    }));
    setNewInvite({ email: "", role: "ADMIN", department: "" });
    toast.success("Collaborateur ajouté à la liste.");
  }

  function handleRemoveInvitation(index: number) {
    setFormData((prev) => ({
      ...prev,
      invitations: {
        invitations: prev.invitations.invitations.filter((_, i) => i !== index),
      },
    }));
  }

  function validateCurrentStep(): boolean {
    if (currentStep === 1) {
      if (!formData.personal.firstName || !formData.personal.lastName || !formData.personal.phone) {
        toast.error("Veuillez remplir vos informations personnelles.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.church.name || !formData.church.slug || !formData.church.city || !formData.church.address) {
        toast.error("Veuillez renseigner au moins le nom, le slug, la ville et l'adresse de l'église.");
        return false;
      }
    } else if (currentStep === 4) {
      const selected = formData.departments.departments.filter((d) => d.selected);
      if (selected.length === 0) {
        toast.error("Veuillez sélectionner au moins un département pour démarrer.");
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleFinishOnboarding() {
    try {
      setIsSubmitting(true);
      const res = await completeOnboardingAction(formData);

      if (!res.success) {
        toast.error(res.error || "Erreur lors de la configuration de l'église.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Votre église a été configurée avec succès ! Bienvenue sur ChurchOS.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Erreur de communication avec le serveur.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <OnboardingStepper currentStep={currentStep} totalSteps={6} />

      {/* =========================================================================
          ÉTAPE 1 : INFORMATIONS PERSONNELLES
      ========================================================================= */}
      {currentStep === 1 && (
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 1 : Informations du Responsable</CardTitle>
                <CardDescription className="text-xs">
                  Renseignez vos coordonnées de pasteur principal ou d&apos;administrateur fondateur
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Jean-Paul"
                  value={formData.personal.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, firstName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom de famille *</Label>
                <Input
                  id="lastName"
                  placeholder="Mukendi"
                  value={formData.personal.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, lastName: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Numéro de téléphone direct *</Label>
                <Input
                  id="phone"
                  placeholder="+257 79 10 20 30"
                  value={formData.personal.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, phone: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Titre ou Fonction au sein de l&apos;Église *</Label>
                <Input
                  id="title"
                  placeholder="Pasteur Principal / Fondateur"
                  value={formData.personal.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personal: { ...formData.personal, title: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <div />
            <Button onClick={nextStep} className="gap-2">
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* =========================================================================
          ÉTAPE 2 : CRÉER L'ÉGLISE
      ========================================================================= */}
      {currentStep === 2 && (
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Church className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 2 : Configuration de l&apos;Église</CardTitle>
                <CardDescription className="text-xs">
                  Paramétrez les détails institutionnels, l&apos;adresse et la devise officielle
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="churchName">Nom de l&apos;Église *</Label>
                <Input
                  id="churchName"
                  placeholder="Église de la Grâce et de la Vérité"
                  value={formData.church.name}
                  onChange={(e) => handleChurchNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Identifiant unique (Slug URL) *</Label>
                <Input
                  id="slug"
                  placeholder="eglise-grace-verite"
                  value={formData.church.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, slug: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Brève présentation ou vision</Label>
              <Input
                id="description"
                placeholder="Une communauté dédiée à la transformation spirituelle et fraternelle."
                value={formData.church.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    church: { ...formData.church, description: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="churchEmail">Email officiel de l&apos;Église *</Label>
                <Input
                  id="churchEmail"
                  type="email"
                  placeholder="contact@eglisegraceverite.org"
                  value={formData.church.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, email: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="churchPhone">Téléphone du secrétariat *</Label>
                <Input
                  id="churchPhone"
                  placeholder="+257 22 25 00 00"
                  value={formData.church.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, phone: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse physique *</Label>
                <Input
                  id="address"
                  placeholder="Avenue de la Paix, n° 14"
                  value={formData.church.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, address: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Bujumbura"
                  value={formData.church.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, city: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  placeholder="Burundi"
                  value={formData.church.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, country: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Devise principale des finances *</Label>
                <select
                  id="currency"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.church.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, currency: e.target.value },
                    })
                  }
                >
                  {SITE_CONFIG.supportedCurrencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-popover text-foreground">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone">Fuseau horaire *</Label>
                <select
                  id="timezone"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.church.timezone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      church: { ...formData.church, timezone: e.target.value },
                    })
                  }
                >
                  {SITE_CONFIG.supportedTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value} className="bg-popover text-foreground">
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <Button onClick={nextStep} className="gap-2">
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* =========================================================================
          ÉTAPE 3 : CHOISIR LE TYPE D'ÉGLISE
      ========================================================================= */}
      {currentStep === 3 && (
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 3 : Type d&apos;Organisation</CardTitle>
                <CardDescription className="text-xs">
                  Sélectionnez la typologie qui correspond le mieux à votre vocation ecclésiale
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHURCH_TYPES.map((t) => {
              const isSelected = formData.type.type === t.id;
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: { type: t.id },
                    })
                  }
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 bg-card/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="gap-1 text-[11px]">
                          <Check className="h-3 w-3" />
                          Sélectionné
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{t.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <Button onClick={nextStep} className="gap-2">
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* =========================================================================
          ÉTAPE 4 : CONFIGURER LES DÉPARTEMENTS
      ========================================================================= */}
      {currentStep === 4 && (
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 4 : Départements & Ministères Initiaux</CardTitle>
                <CardDescription className="text-xs">
                  Activez les équipes opérationnelles de votre église ou ajoutez vos propres départements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.departments.departments.map((dept, idx) => (
                <div
                  key={dept.name}
                  onClick={() => toggleDepartment(idx)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    dept.selected
                      ? "border-primary/70 bg-primary/5 shadow-sm"
                      : "border-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={dept.selected}
                      onChange={() => toggleDepartment(idx)}
                      className="h-4 w-4 rounded border-border text-primary accent-primary"
                    />
                    <div>
                      <span className="text-sm font-semibold block">{dept.name}</span>
                      <span className="text-[11px] text-muted-foreground">{dept.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Department addition */}
            <div className="pt-3 flex gap-2">
              <Input
                placeholder="Ajouter un département personnalisé (ex: Chorale des Jeunes, Protocole)"
                value={customDeptName}
                onChange={(e) => setCustomDeptName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDepartment();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddDepartment} className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <Button onClick={nextStep} className="gap-2">
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* =========================================================================
          ÉTAPE 5 : INVITER LES COLLABORATEURS
      ========================================================================= */}
      {currentStep === 5 && (
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 5 : Inviter vos Collaborateurs</CardTitle>
                <CardDescription className="text-xs">
                  Invitez votre équipe pastorale, comptables et responsables de départements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-border/60 bg-muted/20">
              <div className="sm:col-span-6 space-y-1.5">
                <Label htmlFor="inviteEmail">Adresse Email *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="collaborateur@eglise.org"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="inviteRole">Rôle RBAC *</Label>
                <select
                  id="inviteRole"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newInvite.role}
                  onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value as any })}
                >
                  <option value="PASTOR" className="bg-popover text-foreground">Pasteur</option>
                  <option value="ADMIN" className="bg-popover text-foreground">Administrateur</option>
                  <option value="ACCOUNTANT" className="bg-popover text-foreground">Comptable / Trésorier</option>
                  <option value="SECRETARY" className="bg-popover text-foreground">Secrétaire</option>
                  <option value="MINISTRY_LEADER" className="bg-popover text-foreground">Responsable Département</option>
                  <option value="VOLUNTEER" className="bg-popover text-foreground">Bénévole</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Button type="button" onClick={handleAddInvitation} className="w-full gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </Button>
              </div>
            </div>

            {/* Invitations Table / List */}
            {formData.invitations.invitations.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-xs">
                <p>Aucun collaborateur ajouté pour le moment.</p>
                <p className="mt-1">Vous pourrez toujours inviter votre équipe plus tard depuis le panneau d&apos;administration.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Collaborateurs à inviter :</Label>
                <div className="divide-y divide-border/60 border rounded-lg overflow-hidden">
                  {formData.invitations.invitations.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-card/50 text-sm">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium block">{inv.email}</span>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {inv.role}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveInvitation(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <Button onClick={nextStep} className="gap-2">
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* =========================================================================
          ÉTAPE 6 : TERMINER L'INSTALLATION (RÉCAPITULATIF)
      ========================================================================= */}
      {currentStep === 6 && (
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Étape 6 : Validation & Lancement</CardTitle>
                <CardDescription className="text-xs">
                  Vérifiez le récapitulatif de votre configuration avant d&apos;initialiser votre espace ChurchOS
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  L&apos;Église & Campus
                </span>
                <p className="text-base font-bold text-foreground">{formData.church.name}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Slug : <code className="text-foreground">{formData.church.slug}</code></p>
                  <p>Ville : {formData.church.city}, {formData.church.country}</p>
                  <p>Devise : {formData.church.currency} • Fuseau : {formData.church.timezone}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Responsable Fondateur
                </span>
                <p className="text-base font-bold text-foreground">
                  {formData.personal.firstName} {formData.personal.lastName}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Fonction : {formData.personal.title}</p>
                  <p>Téléphone : {formData.personal.phone}</p>
                  <p>Rôle système : <Badge variant="brand" className="text-[10px]">CHURCH_OWNER</Badge></p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Départements Configurés ({formData.departments.departments.filter((d) => d.selected).length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.departments.departments
                  .filter((d) => d.selected)
                  .map((d) => (
                    <Badge key={d.name} variant="secondary" className="text-xs">
                      {d.name}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
              ✓ L&apos;initialisation créera automatiquement vos comptes financiers initiaux (Caisse, Banque) et activera votre plan gratuit.
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/40 py-4">
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <Button
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initialisation de votre église en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Confirmer et lancer ChurchOS</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
