-- ============================================================
-- order_emails — log of transactional e-mails per order.
-- Gives the outbox processor idempotence (unique order+kind)
-- and the admin a delivery audit trail.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_emails (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('confirmation', 'payment_instructions', 'forwarded', 'shipped')),
  recipient  TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'error')),
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage order emails" ON public.order_emails;
CREATE POLICY "Admins manage order emails"
  ON public.order_emails FOR ALL
  TO authenticated
  USING (public.orders_is_admin())
  WITH CHECK (public.orders_is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS idx_order_emails_order_kind
  ON public.order_emails (order_id, kind)
  WHERE status = 'sent';

NOTIFY pgrst, 'reload schema';
