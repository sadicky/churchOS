import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Organization, OrganizationMember } from "@/types";

export const ACTIVE_ORG_COOKIE = "churchos_active_org";

export interface UserOrganizationMembership {
  organization: Organization;
  membership: OrganizationMember;
}

/**
 * Retrieves all organizations the currently authenticated user belongs to.
 */
export async function getUserOrganizations(): Promise<UserOrganizationMembership[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      organization_id,
      user_id,
      role,
      campus_id,
      title,
      is_active,
      created_at,
      organizations:organization_id (
        id,
        name,
        slug,
        type,
        description,
        logo_url,
        email,
        phone,
        address,
        city,
        country,
        website,
        currency,
        timezone,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error || !data) {
    return [];
  }

  return data
    .filter((item) => item.organizations !== null)
    .map((item) => ({
      organization: item.organizations as unknown as Organization,
      membership: {
        id: item.id,
        organization_id: item.organization_id,
        user_id: item.user_id,
        role: item.role,
        created_at: item.created_at,
      },
    }));
}

/**
 * Retrieves the currently active organization for the authenticated user.
 */
export async function getActiveOrganization(): Promise<UserOrganizationMembership | null> {
  const orgs = await getUserOrganizations();
  if (orgs.length === 0) {
    return null;
  }

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  if (activeOrgId) {
    const matched = orgs.find((o) => o.organization.id === activeOrgId);
    if (matched) {
      return matched;
    }
  }

  // Default to the first organization
  return orgs[0];
}

/**
 * Sets the active organization cookie for tenant switching.
 */
export async function setActiveOrganization(organizationId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
