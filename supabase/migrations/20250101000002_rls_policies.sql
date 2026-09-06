-- ============================================================================
-- ChurchOS — Phase 2: PostgreSQL Row Level Security (RLS) Policies
-- Migration: 20250101000002_rls_policies.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SECURITY HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Returns set of organization IDs that the authenticated user belongs to
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS SETOF UUID AS $$
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
      AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks whether the current user has a specific role in an organization
CREATE OR REPLACE FUNCTION public.has_role(org_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND role = required_role
          AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks whether the current user is an admin or owner of the organization
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND role IN ('SUPER_ADMIN', 'CHURCH_OWNER', 'ADMIN')
          AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks whether the current user is pastoral staff (pastor, leader, owner)
CREATE OR REPLACE FUNCTION public.is_pastoral_team(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND role IN ('SUPER_ADMIN', 'CHURCH_OWNER', 'PASTOR')
          AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Checks whether the current user can manage finances (accountant, admin, owner)
CREATE OR REPLACE FUNCTION public.is_finance_team(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND role IN ('SUPER_ADMIN', 'CHURCH_OWNER', 'ADMIN', 'ACCOUNTANT')
          AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL RELEVANT TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastoral_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastoral_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their organizations"
    ON public.profiles FOR SELECT
    USING (
        id IN (
            SELECT user_id FROM public.organization_members
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 4. ORGANIZATIONS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view their organization"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Authenticated users can create an organization"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their organization"
    ON public.organizations FOR UPDATE
    USING (public.is_org_admin(id))
    WITH CHECK (public.is_org_admin(id));

-- ----------------------------------------------------------------------------
-- 5. CAMPUSES POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view campuses in their organization"
    ON public.campuses FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Admins can manage campuses"
    ON public.campuses FOR ALL
    USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

-- ----------------------------------------------------------------------------
-- 6. ORGANIZATION MEMBERS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view members of their organization"
    ON public.organization_members FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Admins can manage organization members"
    ON public.organization_members FOR ALL
    USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

-- ----------------------------------------------------------------------------
-- 7. MEMBERS CRM POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view member records in their organization"
    ON public.members FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can create members"
    ON public.members FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can update members"
    ON public.members FOR UPDATE
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Admins can delete members"
    ON public.members FOR DELETE
    USING (public.is_org_admin(organization_id));

-- ----------------------------------------------------------------------------
-- 8. GROUPS & MINISTRIES POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view groups"
    ON public.groups FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage groups"
    ON public.groups FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view group memberships"
    ON public.group_members FOR SELECT
    USING (
        group_id IN (
            SELECT id FROM public.groups
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    );

CREATE POLICY "Staff can manage group memberships"
    ON public.group_members FOR ALL
    USING (
        group_id IN (
            SELECT id FROM public.groups
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    );

CREATE POLICY "Members can view ministries"
    ON public.ministries FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage ministries"
    ON public.ministries FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view ministry memberships"
    ON public.ministry_members FOR SELECT
    USING (
        ministry_id IN (
            SELECT id FROM public.ministries
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    );

CREATE POLICY "Staff can manage ministry memberships"
    ON public.ministry_members FOR ALL
    USING (
        ministry_id IN (
            SELECT id FROM public.ministries
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    )
    WITH CHECK (
        ministry_id IN (
            SELECT id FROM public.ministries
            WHERE organization_id IN (SELECT public.get_user_organizations())
        )
    );

-- ----------------------------------------------------------------------------
-- 9. SERVICES, ATTENDANCE & EVENTS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view services"
    ON public.services FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage services"
    ON public.services FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view attendance sessions"
    ON public.attendance_sessions FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage attendance sessions"
    ON public.attendance_sessions FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view attendance records"
    ON public.attendance_records FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can record attendance"
    ON public.attendance_records FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view events"
    ON public.events FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()) OR is_published = TRUE);

CREATE POLICY "Staff can manage events"
    ON public.events FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Public & Members can register for events"
    ON public.event_registrations FOR ALL
    USING (
        event_id IN (
            SELECT id FROM public.events
            WHERE organization_id IN (SELECT public.get_user_organizations()) OR is_published = TRUE
        )
    );

-- ----------------------------------------------------------------------------
-- 10. SERMONS & MEDIA POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view sermons"
    ON public.sermons FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage sermons"
    ON public.sermons FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Members can view media files"
    ON public.media_files FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage media files"
    ON public.media_files FOR ALL
    USING (organization_id IN (SELECT public.get_user_organizations()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

-- ----------------------------------------------------------------------------
-- 11. FINANCES, ACCOUNTS & DONATIONS POLICIES (STRICT)
-- ----------------------------------------------------------------------------

CREATE POLICY "Finance team can view accounts"
    ON public.accounts FOR SELECT
    USING (public.is_finance_team(organization_id));

CREATE POLICY "Admins can manage accounts"
    ON public.accounts FOR ALL
    USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Finance team can view financial categories"
    ON public.financial_categories FOR SELECT
    USING (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can view transactions"
    ON public.transactions FOR SELECT
    USING (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can manage transactions"
    ON public.transactions FOR ALL
    USING (public.is_finance_team(organization_id))
    WITH CHECK (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can view budgets"
    ON public.budgets FOR SELECT
    USING (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can manage budgets"
    ON public.budgets FOR ALL
    USING (public.is_finance_team(organization_id))
    WITH CHECK (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can view all donations"
    ON public.donations FOR SELECT
    USING (public.is_finance_team(organization_id));

CREATE POLICY "Finance team can manage donations"
    ON public.donations FOR ALL
    USING (public.is_finance_team(organization_id))
    WITH CHECK (public.is_finance_team(organization_id));

-- ----------------------------------------------------------------------------
-- 12. PASTORAL CARE POLICIES (HIGH PRIVILEGE & STRICT ISOLATION)
-- ----------------------------------------------------------------------------

CREATE POLICY "Only pastoral team can view pastoral visits"
    ON public.pastoral_visits FOR SELECT
    USING (public.is_pastoral_team(organization_id));

CREATE POLICY "Only pastoral team can manage pastoral visits"
    ON public.pastoral_visits FOR ALL
    USING (public.is_pastoral_team(organization_id))
    WITH CHECK (public.is_pastoral_team(organization_id));

CREATE POLICY "Only pastoral team can view pastoral notes"
    ON public.pastoral_notes FOR SELECT
    USING (public.is_pastoral_team(organization_id));

CREATE POLICY "Only pastoral team can manage pastoral notes"
    ON public.pastoral_notes FOR ALL
    USING (public.is_pastoral_team(organization_id))
    WITH CHECK (public.is_pastoral_team(organization_id));

-- ----------------------------------------------------------------------------
-- 13. PRAYER REQUESTS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view public and member prayer requests"
    ON public.prayer_requests FOR SELECT
    USING (
        organization_id IN (SELECT public.get_user_organizations())
        AND (
            visibility IN ('PUBLIC', 'MEMBERS_ONLY')
            OR public.is_pastoral_team(organization_id)
        )
    );

CREATE POLICY "Members can submit prayer requests"
    ON public.prayer_requests FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Pastoral team can update prayer requests"
    ON public.prayer_requests FOR UPDATE
    USING (public.is_pastoral_team(organization_id))
    WITH CHECK (public.is_pastoral_team(organization_id));

-- ----------------------------------------------------------------------------
-- 14. ANNOUNCEMENTS, NOTIFICATIONS & AUDIT LOGS
-- ----------------------------------------------------------------------------

CREATE POLICY "Members can view announcements"
    ON public.announcements FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organizations()));

CREATE POLICY "Staff can manage announcements"
    ON public.announcements FOR ALL
    USING (public.is_org_admin(organization_id) OR public.is_pastoral_team(organization_id))
    WITH CHECK (public.is_org_admin(organization_id) OR public.is_pastoral_team(organization_id));

CREATE POLICY "Users can view their notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view invitations"
    ON public.invitations FOR SELECT
    USING (public.is_org_admin(organization_id));

CREATE POLICY "Admins can manage invitations"
    ON public.invitations FOR ALL
    USING (public.is_org_admin(organization_id))
    WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_org_admin(organization_id));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.is_org_admin(organization_id));
