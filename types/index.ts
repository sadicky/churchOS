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

export interface Group {
  id: string;
  organization_id: string;
  campus_id: string | null;
  name: string;
  description: string | null;
  leader_id: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  member_id: string;
  role: "LEADER" | "CO_LEADER" | "HOST" | "MEMBER" | string;
  joined_at: string;
  created_at: string;
}

export interface GroupDetailed extends Group {
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  campus?: {
    id: string;
    name: string;
  } | null;
  members_count?: number;
  members?: Array<{
    id: string;
    role: string;
    joined_at: string;
    member: {
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      membership_status: string;
    };
  }>;
}

export interface Ministry {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinistryMember {
  id: string;
  ministry_id: string;
  member_id: string;
  role: "LEADER" | "CO_LEADER" | "VOLUNTEER" | "COORDINATOR" | string;
  joined_at: string;
  created_at: string;
}

export interface MinistryDetailed extends Ministry {
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  volunteers_count?: number;
  members?: Array<{
    id: string;
    role: string;
    joined_at: string;
    member: {
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      membership_status: string;
    };
  }>;
}

export interface CommunityOverviewStats {
  totalGroups: number;
  activeGroups: number;
  totalMinistries: number;
  membersInGroups: number;
  totalVolunteers: number;
  integrationRate: number;
}

export interface Sermon {
  id: string;
  organization_id: string;
  title: string;
  preacher: string;
  sermon_date: string;
  scripture_reference: string | null;
  series_name: string | null;
  description: string | null;
  content: string | null;
  audio_url: string | null;
  video_url: string | null;
  notes_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  organization_id: string;
  title: string;
  file_type: "image" | "video" | "audio" | "document" | string;
  bucket_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface SermonOverviewStats {
  totalSermons: number;
  totalSeries: number;
  totalPreachers: number;
  sermonsThisYear: number;
}

export interface SermonFilterParams {
  search?: string;
  series?: string;
  preacher?: string;
}

export interface PastoralVisit {
  id: string;
  organization_id: string;
  member_id: string | null;
  pastor_id: string;
  visit_date: string;
  visit_type: "HOME" | "HOSPITAL" | "OFFICE" | "PHONE" | string;
  summary: string;
  follow_up_needed: boolean;
  follow_up_date: string | null;
  created_at: string;
}

export interface PastoralVisitDetailed extends PastoralVisit {
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    membership_status: string;
  } | null;
  pastor?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface PastoralNote {
  id: string;
  organization_id: string;
  member_id: string | null;
  author_id: string;
  confidential_level: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface PastoralNoteDetailed extends PastoralNote {
  member?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  author?: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface PrayerRequest {
  id: string;
  organization_id: string;
  member_id: string | null;
  requester_name: string;
  title: string;
  description: string;
  visibility: "PUBLIC" | "MEMBERS_ONLY" | "PASTORAL_ONLY";
  status: "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  answered_at: string | null;
  answer_testimony: string | null;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
}

export interface PastoralOverviewStats {
  totalVisitsThisMonth: number;
  followUpsNeeded: number;
  activePrayerRequests: number;
  answeredPrayers: number;
}

export interface Announcement {
  id: string;
  organization_id: string;
  author_id: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface AnnouncementDetailed extends Announcement {
  author?: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface CommunicationBroadcast {
  id: string;
  organization_id: string;
  sender_id: string | null;
  channel: "SMS" | "EMAIL" | "NOTIFICATION" | string;
  target_audience: "ALL" | "LEADERS" | "VOLUNTEERS" | "VISITORS" | string;
  title: string;
  message: string;
  recipients_count: number;
  status: "SENT" | "PENDING" | "FAILED" | string;
  sent_at: string;
  created_at: string;
}

export interface CommunicationBroadcastDetailed extends CommunicationBroadcast {
  sender?: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface AppNotification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT" | string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CommunicationOverviewStats {
  activeAnnouncements: number;
  pinnedAnnouncements: number;
  broadcastsThisMonth: number;
  totalRecipientsReached: number;
  unreadNotifications: number;
}

export interface AudienceCounts {
  all: number;
  leaders: number;
  volunteers: number;
  visitors: number;
}
