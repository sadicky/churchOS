"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccountAction, transferBetweenAccountsAction } from "@/actions/finance.actions";
import { toast } from "sonner";
import {
  Wallet,
  Landmark,
  Smartphone,
  Plus,
  ArrowRightLeft,
  Loader2,
  X,
  CreditCard,
} from "lucide-react";
import type { Account } from "@/types";

interface AccountsSummaryProps {
  accounts: Account[];
  currency: string;
}

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Wallet,
  BANK: Landmark,
  MOBILE_MONEY: Smartphone,
  OTHER: CreditCard,
};

export function AccountsSummary({ accounts, currency }: AccountsSummaryProps) {
  const router = useRouter();

  // Modals state
  const [showAddAccountModal, setShowAddAccountModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);

  // New account form state
  const [accountName, setAccountName] = React.useState("");
  const [accountType, setAccountType] = React.useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [initialBalance, setInitialBalance] = React.useState("0");
  const [isAddingAccount, setIsAddingAccount] = React.useState(false);

  // Transfer form state
  const [sourceAccountId, setSourceAccountId] = React.useState(accounts[0]?.id || "");
  const [destAccountId, setDestAccountId] = React.useState(accounts[1]?.id || "");
  const [transferAmount, setTransferAmount] = React.useState("");
  const [transferDesc, setTransferDesc] = React.useState("");
  const [isTransferring, setIsTransferring] = React.useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      toast.error("Veuillez saisir le nom du compte.");
      return;
    }

    try {
      setIsAddingAccount(true);
      const res = await createAccountAction({
        name: accountName.trim(),
        type: accountType,
        account_number: accountNumber.trim() || undefined,
        currency,
        balance: parseFloat(initialBalance) || 0,
      });

      if (res.success) {
        toast.success("Compte de trésorerie créé !");
        setShowAddAccountModal(false);
        setAccountName("");
        setAccountNumber("");
        setInitialBalance("0");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur de création.");
      }
    } catch {
      toast.error("Erreur de communication.");
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Veuillez renseigner un montant valide.");
      return;
    }
    if (sourceAccountId === destAccountId) {
      toast.error("Veuillez choisir deux comptes différents.");
      return;
    }

    try {
      setIsTransferring(true);
      const res = await transferBetweenAccountsAction({
        source_account_id: sourceAccountId,
        destination_account_id: destAccountId,
        amount: amountNum,
        description: transferDesc.trim() || undefined,
      });

      if (res.success) {
        toast.success("Virement exécuté avec succès !");
        setShowTransferModal(false);
        setTransferAmount("");
        setTransferDesc("");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors du virement.");
      }
    } catch {
      toast.error("Erreur de communication.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Comptes de Trésorerie ({accounts.length})
        </h3>

        <div className="flex items-center gap-2">
          {accounts.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransferModal(true)}
              className="h-7 text-[11px] gap-1 border-border/60 hover:bg-accent"
            >
              <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
              <span>Virement interne</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddAccountModal(true)}
            className="h-7 text-[11px] gap-1 border-border/60 hover:bg-accent"
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
            <span>Nouveau compte</span>
          </Button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = ACCOUNT_ICONS[acc.type] || Wallet;

          return (
            <Card
              key={acc.id}
              className="p-4 border-border/50 bg-card/60 backdrop-blur-sm shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {acc.name}
                    </span>
                    {acc.is_default && (
                      <Badge variant="secondary" className="text-[9px] py-0 px-1 font-normal">
                        Défaut
                      </Badge>
                    )}
                  </div>
                  {acc.account_number ? (
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {acc.account_number}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {acc.type === "CASH"
                        ? "Espèces / Caisse"
                        : acc.type === "BANK"
                        ? "Banque"
                        : "Mobile Money"}
                    </p>
                  )}
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 mt-3 flex items-baseline justify-between">
                <span className="text-[11px] text-muted-foreground">Solde disponible</span>
                <span className="text-lg font-black tracking-tight text-foreground">
                  {Number(acc.balance).toLocaleString()} {acc.currency || currency}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. Modal: Nouveau Compte */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-2xl relative space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddAccountModal(false)}
              className="absolute top-3 right-3 h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardTitle className="text-base font-bold text-foreground">
              Créer un Compte de Trésorerie
            </CardTitle>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="acc_name">Nom du compte</Label>
                <Input
                  id="acc_name"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Caisse Deuxième Culte, Compte Lumicash..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="acc_type">Type de compte</Label>
                  <select
                    id="acc_type"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
                  >
                    <option value="CASH">Caisse (Espèces)</option>
                    <option value="BANK">Compte Bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="acc_num">Numéro de compte / Tél</Label>
                  <Input
                    id="acc_num"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="IBAN ou N° Téléphone"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="acc_bal">Solde initial</Label>
                <Input
                  id="acc_bal"
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isAddingAccount}
                className="w-full h-9 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1.5 mt-2"
              >
                {isAddingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* 2. Modal: Virement Interne */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-2xl relative space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTransferModal(false)}
              className="absolute top-3 right-3 h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-brand-600" />
              Virement Interne de Trésorerie
            </CardTitle>

            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="src_acc">Compte Source (à débiter)</Label>
                <select
                  id="src_acc"
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Solde: {Number(a.balance).toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="dst_acc">Compte Destinataire (à créditer)</Label>
                <select
                  id="dst_acc"
                  value={destAccountId}
                  onChange={(e) => setDestAccountId(e.target.value)}
                  className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Solde: {Number(a.balance).toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="trans_amt">Montant du virement ({currency})</Label>
                <Input
                  id="trans_amt"
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="trans_desc">Motif du virement</Label>
                <Input
                  id="trans_desc"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  placeholder="Ex: Dépôt bancaire des offrandes du dimanche"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isTransferring}
                className="w-full h-9 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1.5 mt-2"
              >
                {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Exécuter le virement"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
