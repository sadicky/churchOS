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
