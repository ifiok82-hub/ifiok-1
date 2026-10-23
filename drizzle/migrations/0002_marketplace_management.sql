CREATE TYPE public.app_role AS ENUM ('admin','seller','user');
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name text NOT NULL DEFAULT '', avatar_path text, pi_uid text UNIQUE, pi_username text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_owner_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY profiles_owner_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_own ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE FUNCTION public.create_marketplace_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id) VALUES(NEW.id) ON CONFLICT DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER marketplace_profile_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_marketplace_profile();
INSERT INTO public.profiles(id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;
CREATE POLICY profiles_admin_read ON public.profiles FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.seller_applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, store_name text NOT NULL, description text NOT NULL, location text NOT NULL, delivery text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','suspended','needs_information')), admin_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.seller_applications TO authenticated; GRANT ALL ON public.seller_applications TO service_role;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY seller_own_read ON public.seller_applications FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY seller_own_insert ON public.seller_applications FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='pending' AND admin_note='');
CREATE TABLE public.marketplace_listings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL, title text NOT NULL, description text NOT NULL, category text NOT NULL, price_pi numeric NOT NULL CHECK(price_pi>0), stock integer NOT NULL CHECK(stock>=0), photo_path text NOT NULL, location text NOT NULL, delivery text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','suspended','removed')), featured boolean NOT NULL DEFAULT false, admin_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.marketplace_listings TO anon; GRANT SELECT,INSERT ON public.marketplace_listings TO authenticated; GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY genuine_public_read ON public.marketplace_listings FOR SELECT TO anon,authenticated USING(status='approved' AND EXISTS(SELECT 1 FROM public.seller_applications a WHERE a.user_id=seller_id AND a.status='approved'));
CREATE POLICY genuine_owner_read ON public.marketplace_listings FOR SELECT TO authenticated USING(seller_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY genuine_owner_insert ON public.marketplace_listings FOR INSERT TO authenticated WITH CHECK(seller_id=auth.uid() AND status='pending' AND featured=false AND admin_note='' AND EXISTS(SELECT 1 FROM public.seller_applications a WHERE a.user_id=auth.uid() AND a.status='approved'));
CREATE TABLE public.demo_catalogue (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, category text NOT NULL, example_price_pi numeric NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.demo_catalogue TO anon,authenticated; GRANT ALL ON public.demo_catalogue TO service_role;
ALTER TABLE public.demo_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY demo_public_read ON public.demo_catalogue FOR SELECT TO anon,authenticated USING(true);
INSERT INTO public.demo_catalogue(title,category,example_price_pi) SELECT title,category,price_pi FROM public.listings WHERE seller_username IN ('adaeze_dev','kofi_studio','maria_ai','lagos_mart','swift_uyo','secure_raj');
ALTER TABLE public.listings ADD COLUMN legacy_demo boolean NOT NULL DEFAULT false;
UPDATE public.listings SET legacy_demo=true,active=false WHERE seller_username IN ('adaeze_dev','kofi_studio','maria_ai','lagos_mart','swift_uyo','secure_raj');
COMMENT ON TABLE public.listings IS 'DEPRECATED: legacy records retained; reviewed genuine listings use marketplace_listings and examples use demo_catalogue.';
CREATE TABLE public.marketplace_settings (id text PRIMARY KEY DEFAULT 'main' CHECK(id='main'), demo_enabled boolean NOT NULL DEFAULT true, homepage_message text NOT NULL DEFAULT 'From Mining to Spending — Real Goods, Real Services, Real Value.', categories text[] NOT NULL DEFAULT ARRAY['Groceries','Electronics','Fashion','Home & Living','Health & Beauty','Services','Digital','Freelance'], pi_app_name text NOT NULL DEFAULT '', pi_app_id text NOT NULL DEFAULT '', pi_network text NOT NULL DEFAULT 'testnet' CHECK(pi_network IN ('testnet','mainnet')), wallet_address text NOT NULL DEFAULT '', hosting_url text NOT NULL DEFAULT '', registered_url text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.marketplace_settings TO anon,authenticated; GRANT ALL ON public.marketplace_settings TO service_role;
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_public_read ON public.marketplace_settings FOR SELECT TO anon,authenticated USING(true);
CREATE TABLE public.problem_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, kind text NOT NULL CHECK(kind IN ('problem','scam','complaint','refund_request')), order_code text NOT NULL DEFAULT '', description text NOT NULL, evidence_path text, status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_review','resolved','dismissed')), admin_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.problem_reports TO authenticated; GRANT ALL ON public.problem_reports TO service_role;
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY problem_own_read ON public.problem_reports FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY problem_own_insert ON public.problem_reports FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='open' AND admin_note='');
CREATE TABLE public.admin_audit_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL, action text NOT NULL, target_id text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.admin_audit_log TO authenticated; GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin ON public.admin_audit_log FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY orders_admin_read ON public.escrow_orders FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY scams_admin_read ON public.scam_reports FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.escrow_orders,public.scam_reports TO authenticated;
CREATE POLICY seller_photo_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='seller-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY seller_photo_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='seller-photos' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE FUNCTION public.bootstrap_marketplace_admin(target_user uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM pg_advisory_xact_lock(924631); IF EXISTS(SELECT 1 FROM public.user_roles WHERE role='admin') THEN RETURN false; END IF; INSERT INTO public.user_roles(user_id,role) VALUES(target_user,'admin'); INSERT INTO public.admin_audit_log(actor_id,action,target_id) VALUES(target_user,'initial_admin_setup',target_user::text); RETURN true; END $$;
REVOKE ALL ON FUNCTION public.bootstrap_marketplace_admin(uuid) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.bootstrap_marketplace_admin(uuid) TO service_role;
CREATE FUNCTION public.manage_marketplace(action text,target uuid DEFAULT NULL,payload jsonb DEFAULT '{}') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); changed integer;
BEGIN
IF actor IS NULL OR NOT public.has_role(actor,'admin') THEN RAISE EXCEPTION 'Administrators only'; END IF;
IF action='seller_status' THEN
 IF payload->>'status' NOT IN ('approved','rejected','suspended','needs_information') THEN RAISE EXCEPTION 'Invalid seller status'; END IF;
 UPDATE public.seller_applications SET status=payload->>'status',admin_note=left(coalesce(payload->>'note',''),2000) WHERE id=target; GET DIAGNOSTICS changed=ROW_COUNT;
 IF payload->>'status'='approved' THEN INSERT INTO public.user_roles(user_id,role) SELECT user_id,'seller' FROM public.seller_applications WHERE id=target ON CONFLICT DO NOTHING; ELSE DELETE FROM public.user_roles WHERE role='seller' AND user_id=(SELECT user_id FROM public.seller_applications WHERE id=target); UPDATE public.marketplace_listings SET status='suspended' WHERE seller_id=(SELECT user_id FROM public.seller_applications WHERE id=target) AND status='approved'; END IF;
ELSIF action='listing_status' THEN
 IF payload->>'status' NOT IN ('approved','rejected','suspended','removed') THEN RAISE EXCEPTION 'Invalid listing status'; END IF;
 IF payload->>'status'='approved' AND NOT EXISTS(SELECT 1 FROM public.marketplace_listings l JOIN public.seller_applications s ON s.user_id=l.seller_id WHERE l.id=target AND s.status='approved') THEN RAISE EXCEPTION 'Seller not approved'; END IF;
 UPDATE public.marketplace_listings SET status=payload->>'status',admin_note=left(coalesce(payload->>'note',''),2000) WHERE id=target; GET DIAGNOSTICS changed=ROW_COUNT;
ELSIF action='feature' THEN UPDATE public.marketplace_listings SET featured=(payload->>'featured')::boolean WHERE id=target AND status='approved'; GET DIAGNOSTICS changed=ROW_COUNT;
ELSIF action='report_status' THEN
 IF payload->>'status' NOT IN ('in_review','resolved','dismissed') THEN RAISE EXCEPTION 'Invalid report status'; END IF;
 UPDATE public.problem_reports SET status=payload->>'status',admin_note=left(coalesce(payload->>'note',''),2000) WHERE id=target; GET DIAGNOSTICS changed=ROW_COUNT;
ELSIF action='settings' THEN
 INSERT INTO public.marketplace_settings(id,demo_enabled,homepage_message,categories,pi_app_name,pi_app_id,pi_network,wallet_address,hosting_url,registered_url)
 VALUES('main',(payload->>'demo_enabled')::boolean,payload->>'homepage_message',ARRAY(SELECT jsonb_array_elements_text(payload->'categories')),payload->>'pi_app_name',payload->>'pi_app_id',payload->>'pi_network',payload->>'wallet_address',payload->>'hosting_url',payload->>'registered_url')
 ON CONFLICT(id) DO UPDATE SET demo_enabled=EXCLUDED.demo_enabled,homepage_message=EXCLUDED.homepage_message,categories=EXCLUDED.categories,pi_app_name=EXCLUDED.pi_app_name,pi_app_id=EXCLUDED.pi_app_id,pi_network=EXCLUDED.pi_network,wallet_address=EXCLUDED.wallet_address,hosting_url=EXCLUDED.hosting_url,registered_url=EXCLUDED.registered_url,updated_at=now(); changed:=1;
ELSIF action='remove_demos' THEN DELETE FROM public.demo_catalogue WHERE id IS NOT NULL; changed:=1;
ELSE RAISE EXCEPTION 'Unsupported action'; END IF;
IF changed=0 THEN RAISE EXCEPTION 'Record not found or action unavailable'; END IF;
INSERT INTO public.admin_audit_log(actor_id,action,target_id,details) VALUES(actor,action,coalesce(target::text,'main'),payload);
END $$;
REVOKE ALL ON FUNCTION public.manage_marketplace(text,uuid,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.manage_marketplace(text,uuid,jsonb) TO authenticated;
