"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/services/tenant.service";
import {
  donationFormSchema,
  expenseFormSchema,
  accountFormSchema,
  transferFormSchema,
  type DonationFormInput,
  type ExpenseFormInput,
  type AccountFormInput,
  type TransferFormInput,
} from "@/schemas/finance.schema";
import { revalidatePath } from "next/cache";

export interface FinanceActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createDonationAction(
  data: DonationFormInput
): Promise<FinanceActionResult> {
  const parsed = donationFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du don invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const orgId = activeOrg.organization.id;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const receiptNumber = `REC-${Date.now().toString().slice(-7)}`;

  // 1. Insert Donation
  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      organization_id: orgId,
      account_id: parsed.data.account_id,
      member_id: parsed.data.member_id || null,
      donor_name: parsed.data.donor_name || null,
      donor_email: parsed.data.donor_email || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      payment_method: parsed.data.payment_method,
      donation_date: parsed.data.donation_date,
      receipt_number: receiptNumber,
      reference: parsed.data.reference || null,
      notes: parsed.data.notes || null,
      created_by: user?.id || null,
    })
    .select("id")
    .single();

  if (donationError || !donation) {
    return {
      success: false,
      error: donationError?.message || "Erreur lors de l'enregistrement du don.",
    };
  }

  // 2. Insert into Transactions
  await supabase.from("transactions").insert({
    organization_id: orgId,
    account_id: parsed.data.account_id,
    type: "INCOME",
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    transaction_date: parsed.data.donation_date,
    description: `Don / Dîme [${parsed.data.type}] - Reçu ${receiptNumber}`,
    reference: receiptNumber,
    created_by: user?.id || null,
  });

  // 3. Update Account Balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", parsed.data.account_id)
    .single();

  if (account) {
    const currentBal = Number(account.balance || 0);
    await supabase
      .from("accounts")
      .update({ balance: currentBal + parsed.data.amount })
      .eq("id", parsed.data.account_id);
  }

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard");

  return { success: true, id: donation.id };
}

export async function createExpenseAction(
  data: ExpenseFormInput
): Promise<FinanceActionResult> {
  const parsed = expenseFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de la dépense invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const orgId = activeOrg.organization.id;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Insert Expense Transaction
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      organization_id: orgId,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id || null,
      type: "EXPENSE",
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      transaction_date: parsed.data.transaction_date,
      description: parsed.data.description,
      reference: parsed.data.reference || null,
      created_by: user?.id || null,
    })
    .select("id")
    .single();

  if (txError || !tx) {
    return {
      success: false,
      error: txError?.message || "Erreur lors de l'enregistrement de la dépense.",
    };
  }

  // 2. Decrement Account Balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", parsed.data.account_id)
    .single();

  if (account) {
    const currentBal = Number(account.balance || 0);
    await supabase
      .from("accounts")
      .update({ balance: currentBal - parsed.data.amount })
      .eq("id", parsed.data.account_id);
  }

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard");

  return { success: true, id: tx.id };
}

export async function createAccountAction(
  data: AccountFormInput
): Promise<FinanceActionResult> {
  const parsed = accountFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données du compte invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();

  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      organization_id: activeOrg.organization.id,
      name: parsed.data.name,
      type: parsed.data.type,
      account_number: parsed.data.account_number || null,
      currency: parsed.data.currency,
      balance: parsed.data.balance,
      is_default: false,
    })
    .select("id")
    .single();

  if (error || !account) {
    return {
      success: false,
      error: error?.message || "Erreur lors de la création du compte.",
    };
  }

  revalidatePath("/dashboard/finances");
  return { success: true, id: account.id };
}

export async function transferBetweenAccountsAction(
  data: TransferFormInput
): Promise<FinanceActionResult> {
  const parsed = transferFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de virement invalides.",
    };
  }

  const activeOrg = await getActiveOrganization();
  if (!activeOrg) {
    return { success: false, error: "Aucune église active." };
  }

  const supabase = await createClient();
  const orgId = activeOrg.organization.id;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch source and destination accounts
  const { data: src } = await supabase
    .from("accounts")
    .select("balance, name")
    .eq("id", parsed.data.source_account_id)
    .single();

  const { data: dest } = await supabase
    .from("accounts")
    .select("balance, name")
    .eq("id", parsed.data.destination_account_id)
    .single();

  if (!src || !dest) {
    return { success: false, error: "Comptes introuvables." };
  }

  if (Number(src.balance) < parsed.data.amount) {
    return { success: false, error: "Solde insuffisant sur le compte source." };
  }

  // 1. Decrement source
  await supabase
    .from("accounts")
    .update({ balance: Number(src.balance) - parsed.data.amount })
    .eq("id", parsed.data.source_account_id);

  // 2. Increment destination
  await supabase
    .from("accounts")
    .update({ balance: Number(dest.balance) + parsed.data.amount })
    .eq("id", parsed.data.destination_account_id);

  // 3. Record transfer transactions
  const desc = parsed.data.description || `Virement de [${src.name}] vers [${dest.name}]`;

  await supabase.from("transactions").insert([
    {
      organization_id: orgId,
      account_id: parsed.data.source_account_id,
      type: "TRANSFER",
      amount: parsed.data.amount,
      currency: "USD",
      transaction_date: new Date().toISOString().slice(0, 10),
      description: `Débit virement : ${desc}`,
      created_by: user?.id || null,
    },
    {
      organization_id: orgId,
      account_id: parsed.data.destination_account_id,
      type: "TRANSFER",
      amount: parsed.data.amount,
      currency: "USD",
      transaction_date: new Date().toISOString().slice(0, 10),
      description: `Crédit virement : ${desc}`,
      created_by: user?.id || null,
    },
  ]);

  revalidatePath("/dashboard/finances");
  return { success: true };
}
