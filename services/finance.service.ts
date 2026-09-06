import { createClient } from "@/lib/supabase/server";
import type { Account, FinancialCategory, Transaction, Donation, Organization, Member } from "@/types";

export interface TransactionListItem extends Transaction {
  accounts: {
    id: string;
    name: string;
    type: string;
  } | null;
  financial_categories: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface FinancialOverview {
  accounts: Account[];
  totalBalance: number;
  currency: string;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  recentTransactions: TransactionListItem[];
}

export interface TransactionsListResponse {
  transactions: TransactionListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DonationReceiptDetail {
  donation: Donation;
  organization: Organization;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  } | null;
  account: {
    id: string;
    name: string;
  } | null;
}

export async function getFinancialOverview(organizationId: string): Promise<FinancialOverview> {
  const supabase = await createClient();

  // 1. Fetch organization currency
  const { data: org } = await supabase
    .from("organizations")
    .select("currency")
    .eq("id", organizationId)
    .single();

  const currency = org?.currency || "USD";

  // 2. Fetch Accounts
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_default", { ascending: false });

  const accounts = (accountsData || []) as unknown as Account[];
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  // 3. Fetch Monthly Income & Expenses
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: currentMonthTx } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("organization_id", organizationId)
    .gte("transaction_date", startOfMonth);

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  (currentMonthTx || []).forEach((tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === "INCOME") monthlyIncome += amt;
    else if (tx.type === "EXPENSE") monthlyExpense += amt;
  });

  const monthlyNet = monthlyIncome - monthlyExpense;

  // 4. Fetch Recent 8 Transactions
  const { data: recentTxData } = await supabase
    .from("transactions")
    .select(`
      *,
      accounts:account_id (
        id,
        name,
        type
      ),
      financial_categories:category_id (
        id,
        name,
        type
      )
    `)
    .eq("organization_id", organizationId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const recentTransactions = (recentTxData || []) as unknown as TransactionListItem[];

  return {
    accounts,
    totalBalance,
    currency,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    recentTransactions,
  };
}

export async function getTransactionsList(
  organizationId: string,
  options: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<TransactionsListResponse> {
  const supabase = await createClient();
  const page = Math.max(options.page || 1, 1);
  const limit = Math.max(options.limit || 15, 1);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      accounts:account_id (
        id,
        name,
        type
      ),
      financial_categories:category_id (
        id,
        name,
        type
      )
    `,
      { count: "exact" }
    )
    .eq("organization_id", organizationId);

  if (options.type && options.type !== "ALL") {
    query = query.eq("type", options.type);
  }

  if (options.accountId && options.accountId !== "ALL") {
    query = query.eq("account_id", options.accountId);
  }

  if (options.categoryId && options.categoryId !== "ALL") {
    query = query.eq("category_id", options.categoryId);
  }

  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`description.ilike.${term},reference.ilike.${term}`);
  }

  query = query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error("Error fetching transactions:", error);
  }

  const transactions = (data || []) as unknown as TransactionListItem[];
  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    transactions,
    total,
    page,
    totalPages,
  };
}

export async function getAccountsList(organizationId: string): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_default", { ascending: false });

  return (data || []) as unknown as Account[];
}

export async function getCategoriesList(
  organizationId: string,
  type?: "INCOME" | "EXPENSE"
): Promise<FinancialCategory[]> {
  const supabase = await createClient();
  let query = supabase
    .from("financial_categories")
    .select("*")
    .eq("organization_id", organizationId);

  if (type) {
    query = query.eq("type", type);
  }

  const { data } = await query.order("name", { ascending: true });
  return (data || []) as unknown as FinancialCategory[];
}

export async function getDonationReceipt(
  donationId: string,
  organizationId: string
): Promise<DonationReceiptDetail | null> {
  const supabase = await createClient();

  const { data: donation, error } = await supabase
    .from("donations")
    .select(`
      *,
      accounts:account_id (
        id,
        name
      ),
      members:member_id (
        id,
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .eq("id", donationId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !donation) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (!organization) {
    return null;
  }

  return {
    donation: donation as unknown as Donation,
    organization: organization as unknown as Organization,
    member: donation.members as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      email: string | null;
    } | null,
    account: donation.accounts as unknown as { id: string; name: string } | null,
  };
}
