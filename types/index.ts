export type UserRole =
  | "SUPER_ADMIN"
  | "CHURCH_OWNER"
  | "PASTOR"
  | "ADMIN"
  | "ACCOUNTANT"
  | "SECRETARY"
  | "MINISTRY_LEADER"
  | "GROUP_LEADER"
  | "VOLUNTEER"
  | "MEMBER";

export type MembershipStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "VISITOR"
  | "TRANSFERRED"
  | "DECEASED"
  | "ARCHIVED";

export type OrganizationType =
  | "LOCAL_CHURCH"
  | "MINISTRY"
  | "ASSEMBLY"
  | "CHRISTIAN_ORGANIZATION";

export type PlanType = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  currency: string;
  timezone: string;
  type: OrganizationType;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
  children?: NavItem[];
}

import type { Database, GenderType, MaritalStatusType } from "./database";

export type { GenderType, MaritalStatusType };
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
export type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];
export type Campus = Database["public"]["Tables"]["campuses"]["Row"];

export interface MemberNote {
  id: string;
  organization_id: string;
  member_id: string;
  author_id: string;
  title: string | null;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];
export interface AttendanceSession {
  id: string;
  organization_id: string;
  service_id: string | null;
  campus_id: string | null;
  title: string;
  session_date: string;
  qr_code_token: string | null;
  is_open: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  session_id: string;
  member_id: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  is_visitor: boolean;
  check_in_method: string;
  recorded_by: string | null;
  created_at: string;
}

export type { DonationType, PaymentMethod, TransactionType } from "./database";

export interface Account {
  id: string;
  organization_id: string;
  name: string;
  type: "CASH" | "BANK" | "MOBILE_MONEY" | "OTHER";
  account_number: string | null;
  currency: string;
  balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialCategory {
  id: string;
  organization_id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string | null;
  created_at: string;
}

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];
