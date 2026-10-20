CREATE TABLE public.moderators (
  pi_username text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.moderators TO service_role;
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;