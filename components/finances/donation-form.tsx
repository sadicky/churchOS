"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createDonationAction } from "@/actions/finance.actions";
import { toast } from "sonner";
import {
  Wallet,
  User,
  Calendar,
  CreditCard,
  Save,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import type { Account } from "@/types";
import type { DonationFormInput } from "@/schemas/finance.schema";

interface DonationFormProps {
  accounts: Account[];
  members: { id: string; name: string }[];
  defaultCurrency: string;
}

export function DonationForm({ accounts, members, defaultCurrency }: DonationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [formData, setFormData] = React.useState<DonationFormInput>({
    member_id: "",
    donor_name: "",
    donor_email: "",
    type: "TITHE",
    amount: 100,
    currency: defaultCurrency,
    payment_method: "CASH",
    account_id: accounts[0]?.id || "",
    donation_date: new Date().toISOString().slice(0, 10),
    reference: "",
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

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Veuillez saisir un montant supérieur à 0.");
      return;
    }
    if (!formData.account_id) {
      toast.error("Veuillez sélectionner le compte de trésorerie crédité.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: DonationFormInput = {
        ...formData,
        member_id: isAnonymous ? null : formData.member_id || null,
        donor_name: isAnonymous ? "Anonyme" : formData.donor_name || null,
      };

      const res = await createDonationAction(payload);
      if (res.success && res.id) {
        toast.success("Dîme / Don enregistré avec succès !");
        router.push(`/dashboard/finances/donations/${res.id}/receipt`);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">
      <Card className="p-6 border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-0 pb-4 border-b border-border/40">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Enregistrement d&apos;une Dîme ou d&apos;un Don
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Attribution nominative ou anonyme avec génération de reçu officiel
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 space-y-4 text-xs">
          {/* Donateur (Membre vs Anonyme) */}
          <div className="space-y-2 p-3 rounded-lg bg-accent/30 border border-border/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-600" />
                Donateur / Fidèle
              </span>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-border text-brand-600"
                />
                <span>Don anonyme</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="member_id">Sélectionner un membre</Label>
                  <select
                    id="member_id"
                    name="member_id"
                    value={formData.member_id || ""}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
                  >
                    <option value="">Sélectionner dans l&apos;annuaire...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="donor_name">Ou nom du visiteur libre</Label>
                  <Input
                    id="donor_name"
                    name="donor_name"
                    value={formData.donor_name || ""}
                    onChange={handleChange}
                    placeholder="Ex: Frère Marc"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Ce versement sera comptabilisé sans rattachement nominatif.
              </p>
            )}
          </div>

          {/* Type & Montant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="font-semibold">
                Nature du versement
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
              >
                <option value="TITHE">Dîme</option>
                <option value="OFFERING">Offrande de culte</option>
                <option value="DONATION">Don libre / Libéralité</option>
                <option value="MISSIONS">Soutien missionnaire</option>
                <option value="BUILDING">Construction & Bâtiment</option>
                <option value="SPECIAL_PROJECT">Projet spécial</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="font-semibold">
                Montant ({defaultCurrency}) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="h-9 text-xs font-bold"
              />
            </div>
          </div>

          {/* Mode de règlement & Compte de destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="payment_method" className="font-semibold">
                Moyen de paiement
              </Label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
              >
                <option value="CASH">Espèces</option>
                <option value="BANK_TRANSFER">Virement Bancaire</option>
                <option value="MOBILE_MONEY">Mobile Money (Ecocash/Lumicash...)</option>
                <option value="CARD">Carte bancaire</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account_id" className="font-semibold">
                Compte crédité <span className="text-destructive">*</span>
              </Label>
              <select
                id="account_id"
                name="account_id"
                required
                value={formData.account_id}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Solde: {Number(a.balance).toLocaleString()} {a.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Référence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="donation_date" className="font-semibold">
                Date de perception
              </Label>
              <Input
                id="donation_date"
                name="donation_date"
                type="date"
                required
                value={formData.donation_date}
                onChange={handleChange}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference" className="font-semibold">
                N° de chèque ou Référence externe
              </Label>
              <Input
                id="reference"
                name="reference"
                value={formData.reference || ""}
                onChange={handleChange}
                placeholder="Ex: TX-984729"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="font-semibold">
              Observations particulières
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Précisions sur l'intention du donateur..."
              className="w-full rounded-md border border-border/60 bg-background p-3 text-xs"
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
          className="h-10 px-6 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Enregistrer & Générer le reçu</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
