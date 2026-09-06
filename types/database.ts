export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export type GenderType = "MALE" | "FEMALE" | "OTHER";

export type MaritalStatusType = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";

export type OrganizationType =
  | "LOCAL_CHURCH"
  | "MINISTRY"
  | "ASSEMBLY"
  | "CHRISTIAN_ORGANIZATION";

export type EventType =
  | "SERVICE"
  | "CONFERENCE"
  | "SEMINAR"
  | "RETREAT"
  | "WEDDING"
  | "FUNERAL"
  | "YOUTH_EVENT"
  | "CHILDREN_EVENT"
  | "MEETING"
  | "OTHER";

export type DonationType =
  | "TITHE"
  | "OFFERING"
  | "DONATION"
  | "MISSIONS"
  | "BUILDING"
  | "SPECIAL_PROJECT"
  | "OTHER";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CARD"
  | "OTHER";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type PrayerStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";

export type PrayerVisibility = "PUBLIC" | "MEMBERS_ONLY" | "PASTORAL_ONLY";

export type SubscriptionPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "INVITE"
  | "ROLE_CHANGE";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_super_admin?: boolean;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: OrganizationType;
          description: string | null;
          logo_url: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          website: string | null;
          currency: string;
          timezone: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type?: OrganizationType;
          description?: string | null;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          website?: string | null;
          currency?: string;
          timezone?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: OrganizationType;
          description?: string | null;
          logo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          website?: string | null;
          currency?: string;
          timezone?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      campuses: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string | null;
          is_main: boolean;
          address: string | null;
          city: string | null;
          country: string | null;
          phone: string | null;
          email: string | null;
          pastor_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code?: string | null;
          is_main?: boolean;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          pastor_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: string | null;
          is_main?: boolean;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          pastor_name?: string | null;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: UserRole;
          campus_id: string | null;
          title: string | null;
          is_active: boolean;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: UserRole;
          campus_id?: string | null;
          title?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: UserRole;
          campus_id?: string | null;
          title?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          campus_id: string | null;
          user_id: string | null;
          first_name: string;
          last_name: string;
          gender: GenderType | null;
          date_of_birth: string | null;
          phone: string | null;
          email: string | null;
          photo_url: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          marital_status: MaritalStatusType | null;
          occupation: string | null;
          membership_status: MembershipStatus;
          join_date: string | null;
          baptism_date: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          campus_id?: string | null;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          gender?: GenderType | null;
          date_of_birth?: string | null;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          marital_status?: MaritalStatusType | null;
          occupation?: string | null;
          membership_status?: MembershipStatus;
          join_date?: string | null;
          baptism_date?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campus_id?: string | null;
          user_id?: string | null;
          first_name?: string;
          last_name?: string;
          gender?: GenderType | null;
          date_of_birth?: string | null;
          phone?: string | null;
          email?: string | null;
          photo_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          marital_status?: MaritalStatusType | null;
          occupation?: string | null;
          membership_status?: MembershipStatus;
          join_date?: string | null;
          baptism_date?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          campus_id?: string | null;
          name: string;
          description?: string | null;
          leader_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          meeting_location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campus_id?: string | null;
          name?: string;
          description?: string | null;
          leader_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          meeting_location?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      ministries: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          leader_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          leader_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          leader_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          organization_id: string;
          campus_id: string | null;
          name: string;
          service_date: string;
          start_time: string;
          end_time: string | null;
          preacher_name: string | null;
          worship_leader_name: string | null;
          theme: string | null;
          scripture_reference: string | null;
          notes: string | null;
          attendance_count: number | null;
          offering_total: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          campus_id?: string | null;
          name: string;
          service_date: string;
          start_time: string;
          end_time?: string | null;
          preacher_name?: string | null;
          worship_leader_name?: string | null;
          theme?: string | null;
          scripture_reference?: string | null;
          notes?: string | null;
          attendance_count?: number | null;
          offering_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campus_id?: string | null;
          name?: string;
          service_date?: string;
          start_time?: string;
          end_time?: string | null;
          preacher_name?: string | null;
          worship_leader_name?: string | null;
          theme?: string | null;
          scripture_reference?: string | null;
          notes?: string | null;
          attendance_count?: number | null;
          offering_total?: number | null;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          campus_id: string | null;
          title: string;
          description: string | null;
          type: EventType;
          location: string | null;
          start_datetime: string;
          end_datetime: string;
          banner_url: string | null;
          max_attendees: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          campus_id?: string | null;
          title: string;
          description?: string | null;
          type?: EventType;
          location?: string | null;
          start_datetime: string;
          end_datetime: string;
          banner_url?: string | null;
          max_attendees?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campus_id?: string | null;
          title?: string;
          description?: string | null;
          type?: EventType;
          location?: string | null;
          start_datetime?: string;
          end_datetime?: string;
          banner_url?: string | null;
          max_attendees?: number | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          organization_id: string;
          account_id: string;
          category_id: string | null;
          type: TransactionType;
          amount: number;
          currency: string;
          transaction_date: string;
          description: string;
          reference: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_id: string;
          category_id?: string | null;
          type: TransactionType;
          amount: number;
          currency?: string;
          transaction_date?: string;
          description: string;
          reference?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_id?: string;
          category_id?: string | null;
          type?: TransactionType;
          amount?: number;
          currency?: string;
          transaction_date?: string;
          description?: string;
          reference?: string | null;
          created_by?: string | null;
        };
      };
      donations: {
        Row: {
          id: string;
          organization_id: string;
          account_id: string | null;
          member_id: string | null;
          donor_name: string | null;
          donor_email: string | null;
          type: DonationType;
          amount: number;
          currency: string;
          payment_method: PaymentMethod;
          donation_date: string;
          receipt_number: string | null;
          reference: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_id?: string | null;
          member_id?: string | null;
          donor_name?: string | null;
          donor_email?: string | null;
          type?: DonationType;
          amount: number;
          currency?: string;
          payment_method?: PaymentMethod;
          donation_date?: string;
          receipt_number?: string | null;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_id?: string | null;
          member_id?: string | null;
          donor_name?: string | null;
          donor_email?: string | null;
          type?: DonationType;
          amount?: number;
          currency?: string;
          payment_method?: PaymentMethod;
          donation_date?: string;
          receipt_number?: string | null;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
      };
      sermons: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          preacher: string;
          sermon_date?: string;
          scripture_reference?: string | null;
          series_name?: string | null;
          description?: string | null;
          content?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          notes_url?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          preacher?: string;
          sermon_date?: string;
          scripture_reference?: string | null;
          series_name?: string | null;
          description?: string | null;
          content?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          notes_url?: string | null;
          tags?: string[] | null;
          updated_at?: string;
        };
      };
      prayer_requests: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string | null;
          requester_name: string;
          title: string;
          description: string;
          visibility: PrayerVisibility;
          status: PrayerStatus;
          answered_at: string | null;
          answer_testimony: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id?: string | null;
          requester_name: string;
          title: string;
          description: string;
          visibility?: PrayerVisibility;
          status?: PrayerStatus;
          answered_at?: string | null;
          answer_testimony?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string | null;
          requester_name?: string;
          title?: string;
          description?: string;
          visibility?: PrayerVisibility;
          status?: PrayerStatus;
          answered_at?: string | null;
          answer_testimony?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan: SubscriptionPlan;
          status: string;
          current_period_start: string;
          current_period_end: string | null;
          member_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan?: SubscriptionPlan;
          status?: string;
          current_period_start?: string;
          current_period_end?: string | null;
          member_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          plan?: SubscriptionPlan;
          status?: string;
          current_period_start?: string;
          current_period_end?: string | null;
          member_limit?: number;
          updated_at?: string;
        };
      };
    };
  };
}
