import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getAccountsList } from "@/services/finance.service";
import { getMembersList } from "@/services/member.service";
import { DonationForm } from "@/components/finances/donation-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet } from "lucide-react";

export const metadata = {
  title: "Enregistrer un Don / Dîme — ChurchOS",
  description: "Enregistrement nominatif ou anonyme des dîmes, offrandes et libéralités.",
};

export default async function NewDonationPage() {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const [accounts, membersData] = await Promise.all([
    getAccountsList(activeOrg.organization.id),
    getMembersList(activeOrg.organization.id, { limit: 200 }),
  ]);

  const memberOptions = membersData.members.map((m) => ({
    id: m.id,
    name: `${m.first_name} ${m.last_name}`,
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/dashboard/finances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Enregistrer une Dîme ou un Don
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeOrg.organization.name} • Perception comptable et émission d&apos;un reçu officiel
          </p>
        </div>
      </div>

      {/* Donation Form */}
      <DonationForm
        accounts={accounts}
        members={memberOptions}
        defaultCurrency={activeOrg.organization.currency}
      />
    </div>
  );
}
