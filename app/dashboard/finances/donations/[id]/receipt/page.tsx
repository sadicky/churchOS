import * as React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getDonationReceipt } from "@/services/finance.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Church, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Reçu Officiel — ChurchOS",
  description: "Attestation et reçu de don / dîme.",
};

export default async function DonationReceiptPage({ params }: ReceiptPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const detail = await getDonationReceipt(id, activeOrg.organization.id);

  if (!detail) {
    notFound();
  }

  const { donation, organization, member, account } = detail;
  const donorDisplayName = member
    ? `${member.first_name} ${member.last_name}`
    : donation.donor_name || "Donateur Anonyme";

  const dateFormatted = new Date(donation.donation_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-2xl mx-auto">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" asChild className="h-8 text-xs border-border/60">
          <Link href="/dashboard/finances">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Retour aux finances
          </Link>
        </Button>

        {/* Client Print Button */}
        <Button
          size="sm"
          className="h-8 text-xs bg-brand-600 hover:bg-brand-700 text-white gap-1.5 shadow-xs"
          onClick={undefined}
          asChild
        >
          <Link href={`javascript:window.print()`}>
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimer le reçu</span>
          </Link>
        </Button>
      </div>

      {/* Official Receipt Paper Card */}
      <Card className="p-8 sm:p-10 border-border/60 bg-white text-black shadow-xl rounded-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Subtle Watermark */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Church className="w-64 h-64 text-black" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-black text-sm">
                C
              </div>
              <span className="font-extrabold text-lg text-neutral-950 tracking-tight">
                {organization.name}
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              {organization.address ? `${organization.address}, ` : ""}
              {organization.city || ""}, {organization.country || ""}
            </p>
            {organization.phone && (
              <p className="text-xs text-neutral-600">Tél : {organization.phone}</p>
            )}
          </div>

          <div className="text-right space-y-1">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-neutral-300 text-neutral-800">
              Reçu Officiel
            </Badge>
            <p className="text-xs font-mono font-bold text-neutral-900">
              N° {donation.receipt_number || "REC-000000"}
            </p>
            <p className="text-[11px] text-neutral-500">Date : {dateFormatted}</p>
          </div>
        </div>

        {/* Document Title */}
        <div className="py-6 text-center">
          <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900">
            Attestation de Versement & Reçu
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Certificat émis au titre des contributions et dîmes ecclésiastiques
          </p>
        </div>

        {/* Donor & Details Grid */}
        <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/70 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                Donateur / Fidèle
              </span>
              <span className="font-bold text-sm text-neutral-950">
                {donorDisplayName}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                Nature de la contribution
              </span>
              <span className="font-semibold text-neutral-900">
                {donation.type === "TITHE"
                  ? "Dîme"
                  : donation.type === "OFFERING"
                  ? "Offrande de culte"
                  : donation.type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/80">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                Mode de règlement
              </span>
              <span className="font-medium text-neutral-800">
                {donation.payment_method === "CASH"
                  ? "Espèces"
                  : donation.payment_method === "BANK_TRANSFER"
                  ? "Virement Bancaire"
                  : donation.payment_method === "MOBILE_MONEY"
                  ? "Mobile Money"
                  : donation.payment_method}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                Compte crédité
              </span>
              <span className="font-medium text-neutral-800">
                {account?.name || "Caisse Principale"}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Box */}
        <div className="my-6 p-4 rounded-xl bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Montant Total Reçu
            </span>
            <span className="text-2xl font-black tracking-tight">
              {Number(donation.amount).toLocaleString()} {donation.currency}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Versement Validé</span>
          </div>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-8 border-t border-neutral-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              Pour le donateur
            </p>
            <div className="h-14 flex items-end">
              <span className="text-neutral-400 italic text-[11px]">Signature libre</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              Pour la Trésorerie de l&apos;Église
            </p>
            <div className="h-14 flex flex-col items-end justify-end">
              <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-900">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Validé électroniquement</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                ChurchOS Verified
              </span>
            </div>
          </div>
        </div>

        {/* Legal footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 text-center text-[10px] text-neutral-400">
          Ce document constitue une attestation officielle de versement au bénéfice de {organization.name}.
        </div>
      </Card>
    </div>
  );
}
