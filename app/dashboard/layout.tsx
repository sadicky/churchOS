import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getUserOrganizations,
  getActiveOrganization,
} from "@/services/tenant.service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Tableau de Bord — ChurchOS",
  description: "Plateforme de gestion opérationnelle et pastorale pour églises modernes.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // 2. Fetch user's organizations
  const organizations = await getUserOrganizations();

  // If user has no churches yet, guide them to onboarding
  if (organizations.length === 0) {
    redirect("/onboarding");
  }

  // 3. Resolve active church/tenant
  const currentOrg = await getActiveOrganization();
  if (!currentOrg) {
    redirect("/onboarding");
  }

  // 4. Fetch profile for user's real name
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : user.email?.split("@")[0] || "Pasteur";

  const userRole = currentOrg.membership.role || "ADMIN";

  return (
    <DashboardShell
      currentOrg={currentOrg}
      organizations={organizations}
      userName={fullName}
      userEmail={user.email || ""}
      userRole={userRole}
    >
      {children}
    </DashboardShell>
  );
}
