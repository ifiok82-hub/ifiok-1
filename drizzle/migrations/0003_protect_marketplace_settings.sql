DROP POLICY IF EXISTS settings_public_read ON public.marketplace_settings;
REVOKE SELECT ON public.marketplace_settings FROM anon;
GRANT SELECT ON public.marketplace_settings TO authenticated;
CREATE POLICY settings_admin_read ON public.marketplace_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));