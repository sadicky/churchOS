import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { getActiveOrganization } from "@/services/tenant.service";
import { getSessionDetailWithRecords } from "@/services/attendance.service";
import { CheckInStation } from "@/components/attendance/check-in-station";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SessionPageProps) {
  const { id } = await params;
  return {
    title: `Pointage & Émargement — ChurchOS`,
    description: "Station interactive d'émargement et de pointage en direct.",
  };
}

export default async function AttendanceSessionPage({ params }: SessionPageProps) {
  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const session = await getSessionDetailWithRecords(id, activeOrg.organization.id);

  if (!session) {
    notFound();
  }

  return <CheckInStation session={session} organizationId={activeOrg.organization.id} />;
}
