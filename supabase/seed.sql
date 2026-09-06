-- ============================================================================
-- ChurchOS — Phase 2: Realistic Seed Data
-- File: supabase/seed.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DEMO IDS CONSTANTS
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001';
    campus_main_id UUID := '00000000-0000-0000-0000-000000000002';
    campus_north_id UUID := '00000000-0000-0000-0000-000000000003';
    
    -- Users / Profiles
    pastor_id UUID := '00000000-0000-0000-0000-000000000010';
    pastor_assoc_id UUID := '00000000-0000-0000-0000-000000000011';
    finance_lead_id UUID := '00000000-0000-0000-0000-000000000012';
    youth_lead_id UUID := '00000000-0000-0000-0000-000000000013';

    -- Members
    m1_id UUID := '00000000-0000-0000-0000-000000000101';
    m2_id UUID := '00000000-0000-0000-0000-000000000102';
    m3_id UUID := '00000000-0000-0000-0000-000000000103';
    m4_id UUID := '00000000-0000-0000-0000-000000000104';
    m5_id UUID := '00000000-0000-0000-0000-000000000105';

    -- Groups & Ministries
    grp_bethanie_id UUID := '00000000-0000-0000-0000-000000000201';
    grp_youth_id UUID := '00000000-0000-0000-0000-000000000202';
    min_worship_id UUID := '00000000-0000-0000-0000-000000000301';
    min_media_id UUID := '00000000-0000-0000-0000-000000000302';

    -- Financial Accounts & Categories
    acc_cash_id UUID := '00000000-0000-0000-0000-000000000401';
    acc_bank_id UUID := '00000000-0000-0000-0000-000000000402';
    acc_mobile_id UUID := '00000000-0000-0000-0000-000000000403';

    cat_tithe_id UUID := '00000000-0000-0000-0000-000000000501';
    cat_offering_id UUID := '00000000-0000-0000-0000-000000000502';
    cat_rent_id UUID := '00000000-0000-0000-0000-000000000503';
    cat_equipment_id UUID := '00000000-0000-0000-0000-000000000504';

    -- Service & Session
    srv_sunday_id UUID := '00000000-0000-0000-0000-000000000601';
    att_session_id UUID := '00000000-0000-0000-0000-000000000602';

BEGIN

    -- 1. Insert Demo Organization
    INSERT INTO public.organizations (id, name, slug, type, description, email, phone, city, country, currency, timezone)
    VALUES (
        org_id,
        'Église de la Grâce et de la Vérité',
        'eglise-grace-verite',
        'LOCAL_CHURCH',
        'Communauté chrétienne vibrante, attachée à l''enseignement biblique, à l''adoration et à la transformation sociale.',
        'contact@eglisegraceverite.org',
        '+257 22 25 00 00',
        'Bujumbura',
        'Burundi',
        'USD',
        'Africa/Bujumbura'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Campuses
    INSERT INTO public.campuses (id, organization_id, name, code, is_main, city, country, pastor_name)
    VALUES 
        (campus_main_id, org_id, 'Campus Central (Sanctuaire Principal)', 'CC-01', TRUE, 'Bujumbura', 'Burundi', 'Pasteur Jean-Paul Mukendi'),
        (campus_north_id, org_id, 'Campus Nord (Gihosha)', 'CN-02', FALSE, 'Bujumbura', 'Burundi', 'Pasteur Sarah Kabore')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Demo Profiles
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, is_super_admin)
    VALUES
        (pastor_id, 'pastor.jeanpaul@churchos.demo', 'Jean-Paul', 'Mukendi', '+257 79 10 20 30', FALSE),
        (pastor_assoc_id, 'sarah.kabore@churchos.demo', 'Sarah', 'Kabore', '+257 79 40 50 60', FALSE),
        (finance_lead_id, 'david.ndikumana@churchos.demo', 'David', 'Ndikumana', '+257 79 70 80 90', FALSE),
        (youth_lead_id, 'esther.uwimana@churchos.demo', 'Esther', 'Uwimana', '+257 79 11 22 33', FALSE)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Organization Members with Roles
    INSERT INTO public.organization_members (organization_id, user_id, role, campus_id, title)
    VALUES
        (org_id, pastor_id, 'CHURCH_OWNER', campus_main_id, 'Pasteur Principal'),
        (org_id, pastor_assoc_id, 'PASTOR', campus_north_id, 'Pasteure Associée'),
        (org_id, finance_lead_id, 'ACCOUNTANT', campus_main_id, 'Directeur Financier'),
        (org_id, youth_lead_id, 'MINISTRY_LEADER', campus_main_id, 'Responsable Jeunesse & Louange')
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- 5. Insert Members CRM
    INSERT INTO public.members (id, organization_id, campus_id, first_name, last_name, gender, date_of_birth, phone, email, marital_status, membership_status, join_date, baptism_date, occupation)
    VALUES
        (m1_id, org_id, campus_main_id, 'Emmanuel', 'Ndayishimiye', 'MALE', '1988-04-12', '+257 71 22 33 44', 'emmanuel.n@example.com', 'MARRIED', 'ACTIVE', '2021-02-15', '2015-08-20', 'Ingénieur Réseaux'),
        (m2_id, org_id, campus_main_id, 'Grâce', 'Arakaza', 'FEMALE', '1995-09-24', '+257 71 55 66 77', 'grace.arakaza@example.com', 'SINGLE', 'ACTIVE', '2022-06-10', '2019-12-04', 'Médecin'),
        (m3_id, org_id, campus_main_id, 'Alain', 'Bizimana', 'MALE', '1982-11-03', '+257 71 88 99 00', 'alain.bizimana@example.com', 'MARRIED', 'ACTIVE', '2020-01-12', '2010-04-15', 'Enseignant Chercheur'),
        (m4_id, org_id, campus_north_id, 'Chantal', 'Iradukunda', 'FEMALE', '2001-07-18', '+257 72 11 22 33', 'chantal.ira@example.com', 'SINGLE', 'ACTIVE', '2023-03-01', '2023-08-14', 'Étudiante en Droit'),
        (m5_id, org_id, campus_main_id, 'Samuel', 'Hakizimana', 'MALE', '1992-05-30', '+257 72 44 55 66', 'samuel.haki@example.com', 'MARRIED', 'VISITOR', '2024-11-10', NULL, 'Commerçant')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Groups & Ministries
    INSERT INTO public.groups (id, organization_id, campus_id, name, description, leader_id, meeting_day, meeting_time, meeting_location)
    VALUES
        (grp_bethanie_id, org_id, campus_main_id, 'Cellule Béthanie (Centre-ville)', 'Groupe de prière, partage biblique et communion fraternelle du mercredi.', m1_id, 'Mercredi', '18:00 - 19:30', 'Avenue de la Paix, n° 14'),
        (grp_youth_id, org_id, campus_main_id, 'Génération Impact (Jeunesse)', 'Rassemblement dynamique des jeunes de 18 à 30 ans pour la croissance spirituelle.', m2_id, 'Samedi', '16:00 - 18:00', 'Salle Polyvalente')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.group_members (group_id, member_id, role)
    VALUES
        (grp_bethanie_id, m1_id, 'LEADER'),
        (grp_bethanie_id, m3_id, 'MEMBER'),
        (grp_youth_id, m2_id, 'LEADER'),
        (grp_youth_id, m4_id, 'MEMBER')
    ON CONFLICT (group_id, member_id) DO NOTHING;

    INSERT INTO public.ministries (id, organization_id, name, description, leader_id)
    VALUES
        (min_worship_id, org_id, 'Département Louange & Adoration', 'Chantres, musiciens et animateurs de cultes préparant les temps d''adoration.', m2_id),
        (min_media_id, org_id, 'Département Média & Sonorisation', 'Diffusion en direct, sonorisation, projection des chants et archivage des sermons.', m1_id)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Insert Financial Accounts & Categories
    INSERT INTO public.accounts (id, organization_id, name, type, currency, balance, is_default)
    VALUES
        (acc_cash_id, org_id, 'Caisse Principale Sanctuaire', 'CASH', 'USD', 2450.00, TRUE),
        (acc_bank_id, org_id, 'Compte Bancaire Opérationnel', 'BANK', 'USD', 18720.50, FALSE),
        (acc_mobile_id, org_id, 'Compte Mobile Money (Ecocash/Lumicash)', 'MOBILE_MONEY', 'USD', 4310.00, FALSE)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.financial_categories (id, organization_id, name, type, description)
    VALUES
        (cat_tithe_id, org_id, 'Dîmes des Membres', 'INCOME', 'Contribution des dix pour cent sur les revenus des fidèles.'),
        (cat_offering_id, org_id, 'Offrandes Ordinaires de Culte', 'INCOME', 'Offrandes collectées durant les cultes de célébration.'),
        (cat_rent_id, org_id, 'Loyer & Charges des Bâtiments', 'EXPENSE', 'Loyer des locaux des deux campus et factures d''énergie.'),
        (cat_equipment_id, org_id, 'Équipement Son & Éclairage', 'EXPENSE', 'Acquisition et maintenance du matériel audio et projection.')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Insert Donations & Transactions
    INSERT INTO public.donations (organization_id, account_id, member_id, donor_name, type, amount, currency, payment_method, receipt_number, reference)
    VALUES
        (org_id, acc_cash_id, m1_id, 'Emmanuel Ndayishimiye', 'TITHE', 200.00, 'USD', 'CASH', 'REC-2025-001', 'Dîme Janvier'),
        (org_id, acc_mobile_id, m2_id, 'Grâce Arakaza', 'TITHE', 350.00, 'USD', 'MOBILE_MONEY', 'REC-2025-002', 'Ecocash-88741'),
        (org_id, acc_cash_id, NULL, 'Offrande Générale Assemblée', 'OFFERING', 640.00, 'USD', 'CASH', 'REC-2025-003', 'Culte du 12 Janvier')
    ON CONFLICT (receipt_number) DO NOTHING;

    INSERT INTO public.transactions (organization_id, account_id, category_id, type, amount, currency, description, reference)
    VALUES
        (org_id, acc_cash_id, cat_tithe_id, 'INCOME', 200.00, 'USD', 'Enregistrement Dîme - REC-2025-001', 'REC-2025-001'),
        (org_id, acc_mobile_id, cat_tithe_id, 'INCOME', 350.00, 'USD', 'Enregistrement Dîme - REC-2025-002', 'REC-2025-002'),
        (org_id, acc_cash_id, cat_offering_id, 'INCOME', 640.00, 'USD', 'Collecte Offrande Culte Dominical', 'REC-2025-003'),
        (org_id, acc_bank_id, cat_rent_id, 'EXPENSE', 800.00, 'USD', 'Loyer mensuel Campus Nord', 'VIR-LOC-202501')
    ON CONFLICT (id) DO NOTHING;

    -- 9. Insert Services & Attendance
    INSERT INTO public.services (id, organization_id, campus_id, name, service_date, start_time, end_time, preacher_name, worship_leader_name, theme, attendance_count, offering_total)
    VALUES (
        srv_sunday_id,
        org_id,
        campus_main_id,
        'Culte de Célébration & Sainte-Cène',
        CURRENT_DATE,
        '09:00:00',
        '11:30:00',
        'Pasteur Jean-Paul Mukendi',
        'Grâce Arakaza',
        'Demeurer fermes dans la Grâce',
        320,
        1190.00
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.attendance_sessions (id, organization_id, service_id, campus_id, title, qr_code_token, is_open)
    VALUES (
        att_session_id,
        org_id,
        srv_sunday_id,
        campus_main_id,
        'Pointage Présence - Culte de Célébration',
        'QR-SESSION-2025-LIVE',
        TRUE
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.attendance_records (organization_id, session_id, member_id, check_in_method)
    VALUES
        (org_id, att_session_id, m1_id, 'QR_CODE'),
        (org_id, att_session_id, m2_id, 'MANUAL'),
        (org_id, att_session_id, m3_id, 'MANUAL'),
        (org_id, att_session_id, m4_id, 'QR_CODE')
    ON CONFLICT (id) DO NOTHING;

    -- 10. Insert Sermons
    INSERT INTO public.sermons (organization_id, title, preacher, sermon_date, scripture_reference, series_name, description)
    VALUES
        (org_id, 'La Puissance de l''Alliance Nouvelle', 'Pasteur Jean-Paul Mukendi', CURRENT_DATE, 'Hébreux 8:6-13', 'Les Fondements de la Grâce', 'Découvrir comment vivre pleinement libéré sous le règne de la Grâce divine.'),
        (org_id, 'Gardiens les Uns des Autres', 'Pasteure Sarah Kabore', CURRENT_DATE - INTERVAL '7 days', 'Galates 6:1-5', 'Bâtir une Communauté Vivante', 'Le devoir d''accompagnement fraternel et de compassion au sein de l''assemblée.')
    ON CONFLICT (id) DO NOTHING;

    -- 11. Insert Pastoral Care & Prayer Requests
    INSERT INTO public.pastoral_visits (organization_id, member_id, pastor_id, visit_date, visit_type, summary, follow_up_needed)
    VALUES (
        org_id,
        m3_id,
        pastor_id,
        CURRENT_DATE - INTERVAL '3 days',
        'HOME',
        'Visite pastorale au domicile de frère Alain à la suite du décès de son oncle. Temps de prière et réconfort en famille.',
        FALSE
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.pastoral_notes (organization_id, member_id, author_id, confidential_level, note)
    VALUES (
        org_id,
        m1_id,
        pastor_id,
        1,
        'Frère Emmanuel a partagé son désir d''intégrer l''équipe des diacres. Suivi de formation doctrinale prévu le mois prochain.'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.prayer_requests (organization_id, member_id, requester_name, title, description, visibility, status)
    VALUES
        (org_id, m4_id, 'Chantal Iradukunda', 'Réussite aux examens de licence', 'Je demande le soutien de l''assemblée dans la prière pour mes épreuves universitaires finales cette semaine.', 'MEMBERS_ONLY', 'IN_PROGRESS'),
        (org_id, m2_id, 'Grâce Arakaza', 'Guérison complète de ma mère', 'Prière pour le rétablissement de maman après son intervention chirurgicale.', 'PUBLIC', 'ANSWERED')
    ON CONFLICT (id) DO NOTHING;

    -- 12. Insert Announcements
    INSERT INTO public.announcements (organization_id, title, content, is_pinned)
    VALUES
        (org_id, 'Campagne d''Évangélisation & Conférence Annuelle', 'Retrouvons-nous du 15 au 18 février pour notre séminaire spirituel sur le thème : "Rétablis par Sa Présence". Entrée libre.', TRUE),
        (org_id, 'Répétition Générale de la Louange', 'Tous les chantres et instrumentistes sont attendus ce vendredi à 17h30 pour la préparation du culte spécial.', FALSE)
    ON CONFLICT (id) DO NOTHING;

    -- 13. Insert Active Subscription
    INSERT INTO public.subscriptions (organization_id, plan, status, member_limit)
    VALUES (org_id, 'PRO', 'ACTIVE', 99999)
    ON CONFLICT (organization_id) DO UPDATE SET plan = 'PRO', status = 'ACTIVE';

END $$;
