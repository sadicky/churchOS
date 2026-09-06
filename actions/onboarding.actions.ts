"use server";

import { createClient } from "@/lib/supabase/server";
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
} from "@/schemas/onboarding.schema";
import { setActiveOrganization } from "@/services/tenant.service";
import type { UserRole } from "@/types";

export interface OnboardingActionResult {
  success: boolean;
  error?: string;
  organizationId?: string;
  redirectUrl?: string;
}

export async function completeOnboardingAction(
  data: CompleteOnboardingInput
): Promise<OnboardingActionResult> {
  const parsed = completeOnboardingSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'installation invalides.",
    };
  }

  const { personal, church, type, departments, invitations } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Vous devez être connecté pour finaliser l'installation.",
    };
  }

  try {
    // 1. Update personal profile
    await supabase
      .from("profiles")
      .update({
        first_name: personal.firstName,
        last_name: personal.lastName,
        phone: personal.phone,
      })
      .eq("id", user.id);

    // 2. Create Organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: church.name,
        slug: church.slug,
        type: type.type,
        description: church.description || null,
        phone: church.phone,
        email: church.email,
        address: church.address,
        city: church.city,
        country: church.country,
        website: church.website || null,
        currency: church.currency,
        timezone: church.timezone,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (orgError || !org) {
      if (orgError?.code === "23505") {
        return {
          success: false,
          error: "Un identifiant d'église (slug) identique existe déjà. Veuillez en choisir un autre.",
        };
      }
      return {
        success: false,
        error: orgError?.message || "Erreur lors de la création de l'église.",
      };
    }

    const orgId = org.id;

    // 3. Create Main Campus
    const { data: campus } = await supabase
      .from("campuses")
      .insert({
        organization_id: orgId,
        name: church.campusName || "Campus Principal",
        code: "CP-01",
        is_main: true,
        city: church.city,
        country: church.country,
        address: church.address,
        phone: church.phone,
        email: church.email,
        pastor_name: `${personal.firstName} ${personal.lastName}`,
      })
      .select("id")
      .single();

    // 4. Assign Church Owner Membership
    await supabase.from("organization_members").insert({
      organization_id: orgId,
      user_id: user.id,
      role: "CHURCH_OWNER" as UserRole,
      campus_id: campus?.id || null,
      title: personal.title || "Pasteur Principal / Fondateur",
      is_active: true,
    });

    // 5. Create Initial Ministries / Departments
    const selectedDepts = departments.departments.filter((d) => d.selected);
    if (selectedDepts.length > 0) {
      const deptRows = selectedDepts.map((d) => ({
        organization_id: orgId,
        name: d.name,
        description: d.description || null,
        is_active: true,
      }));
      await supabase.from("ministries").insert(deptRows);
    }

    // 6. Create Initial Financial Accounts
    await supabase.from("accounts").insert([
      {
        organization_id: orgId,
        name: "Caisse Principale",
        type: "CASH",
        currency: church.currency,
        balance: 0.0,
        is_default: true,
      },
      {
        organization_id: orgId,
        name: "Compte Bancaire",
        type: "BANK",
        currency: church.currency,
        balance: 0.0,
        is_default: false,
      },
    ]);

    // 7. Create Default Financial Categories
    await supabase.from("financial_categories").insert([
      {
        organization_id: orgId,
        name: "Dîmes",
        type: "INCOME",
        description: "Dîmes régulières des membres",
      },
      {
        organization_id: orgId,
        name: "Offrandes de Culte",
        type: "INCOME",
        description: "Offrandes collectées durant les réunions",
      },
      {
        organization_id: orgId,
        name: "Dons & Libéralités",
        type: "INCOME",
        description: "Soutien et dons spécifiques",
      },
      {
        organization_id: orgId,
        name: "Loyer & Bâtiment",
        type: "EXPENSE",
        description: "Charges locatives et entretien",
      },
      {
        organization_id: orgId,
        name: "Sonorisation & Multimédia",
        type: "EXPENSE",
        description: "Matériel audio, vidéo et diffusion",
      },
      {
        organization_id: orgId,
        name: "Missions & Évangélisation",
        type: "EXPENSE",
        description: "Actions extérieures et soutien missionnaire",
      },
    ]);

    // 8. Create Invitations if any
    if (invitations.invitations.length > 0) {
      const inviteRows = invitations.invitations.map((inv) => ({
        organization_id: orgId,
        email: inv.email,
        role: inv.role as UserRole,
        token: crypto.randomUUID(),
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      await supabase.from("invitations").insert(inviteRows);
    }

    // 9. Create Active Initial Subscription
    await supabase.from("subscriptions").insert({
      organization_id: orgId,
      plan: "FREE",
      status: "ACTIVE",
      member_limit: 100,
    });

    // 10. Set Active Organization Cookie
    await setActiveOrganization(orgId);

    return {
      success: true,
      organizationId: orgId,
      redirectUrl: "/dashboard",
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Erreur inattendue.";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
