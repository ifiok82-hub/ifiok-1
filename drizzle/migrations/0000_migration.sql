CREATE TYPE public.escrow_status AS ENUM ('created','deposited','in_progress','submitted','completed','disputed','refunded');
CREATE TYPE public.report_status AS ENUM ('open','approved_release','refunded','dismissed');

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  seller_username text NOT NULL,
  badge text NOT NULL DEFAULT 'Verified Pioneer',
  category text NOT NULL,
  price_pi numeric(12,4) NOT NULL CHECK (price_pi > 0),
  image_url text,
  stock integer,
  delivery text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT TO anon, authenticated USING (active);

CREATE TABLE public.escrow_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_uid text,
  buyer_username text,
  seller_username text,
  amount_pi numeric(12,4) NOT NULL,
  pi_payment_id text UNIQUE,
  txid text,
  status public.escrow_status NOT NULL DEFAULT 'created',
  submitted_at timestamptz,
  release_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.escrow_orders TO service_role;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.escrow_orders(id) ON DELETE CASCADE,
  reporter_username text,
  description text NOT NULL CHECK (char_length(description) BETWEEN 5 AND 4000),
  evidence_urls text[] NOT NULL DEFAULT '{}',
  status public.report_status NOT NULL DEFAULT 'open',
  moderator_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.scam_reports TO service_role;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;

-- Freeze escrow when a report is filed
CREATE OR REPLACE FUNCTION public.freeze_on_report() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.escrow_orders SET status = 'disputed', release_at = NULL, updated_at = now()
  WHERE id = NEW.order_id AND status NOT IN ('completed','refunded');
  RETURN NEW;
END $$;
CREATE TRIGGER scam_report_freeze AFTER INSERT ON public.scam_reports FOR EACH ROW EXECUTE FUNCTION public.freeze_on_report();

-- Start the 7-day timer when work is submitted
CREATE OR REPLACE FUNCTION public.set_release_timer() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' THEN
    NEW.submitted_at := now();
    NEW.release_at := now() + interval '7 days';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER escrow_release_timer BEFORE UPDATE ON public.escrow_orders FOR EACH ROW EXECUTE FUNCTION public.set_release_timer();

INSERT INTO public.listings (title, seller_username, badge, category, price_pi, image_url) VALUES
('Web Development','adaeze_dev','Top Merchant','Freelance',45,'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'),
('Graphics Design','kofi_studio','Verified Pioneer','Freelance',18,'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'),
('AI Prompt Packs','maria_ai','Verified Pioneer','Digital',6,'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'),
('Gift Vouchers','lagos_mart','Top Merchant','Goods',10,'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80'),
('Local Logistics','swift_uyo','Verified Pioneer','Services',4,'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80'),
('Smart Contract Audit','secure_raj','Top Merchant','Freelance',80,'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80');