"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createExpenseAction } from "@/actions/finance.actions";
import { toast } from "sonner";
import {
  ArrowDownRight,
  Receipt,
  Calendar,
  Wallet,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { Account, FinancialCategory } from "@/types";
import type { ExpenseFormInput } from "@/schemas/finance.schema";

interface ExpenseFormProps {
  accounts: Account[];
  categories: FinancialCategory[];
  defaultCurrency: string;
}

export function ExpenseForm({ accounts, categories, defaultCurrency }: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<ExpenseFormInput>({
    category_id: categories[0]?.id || "",
    account_id: accounts[0]?.id || "",
    amount: 50,
    currency: defaultCurrency,
    transaction_date: new Date().toISOString().slice(0, 10),
    description: "",
    reference: "",
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
    if (!formData.description.trim()) {
      toast.error("Veuillez saisir un libellé descriptif.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createExpenseAction(formData);

      if (res.success) {
        toast.success("Dépense enregistrée et compte débité avec succès !");
        router.push("/dashboard/finances");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement de la dépense.");
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
            <ArrowDownRight className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Enregistrement d&apos;une Dépense / Décaissement
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Justification des sorties de caisse et débit immédiat du compte
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="description" className="font-semibold">
              Libellé de la dépense & Bénéficiaire <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Achat de câbles audio micro - Établissements ABC"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category_id" className="font-semibold">
                Ligne budgétaire / Catégorie
              </Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ""}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
              >
                <option value="">Sélectionner une catégorie...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account_id" className="font-semibold">
                Compte à débiter <span className="text-destructive">*</span>
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

            <div className="space-y-1.5">
              <Label htmlFor="transaction_date" className="font-semibold">
                Date de décaissement
              </Label>
              <Input
                id="transaction_date"
                name="transaction_date"
                type="date"
                required
                value={formData.transaction_date}
                onChange={handleChange}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reference" className="font-semibold">
              N° de Facture ou Référence de pièce justificative
            </Label>
            <Input
              id="reference"
              name="reference"
              value={formData.reference || ""}
              onChange={handleChange}
              placeholder="Ex: FACT-2026-089"
              className="h-9 text-xs"
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
              <span>Enregistrer la dépense</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
