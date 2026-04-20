CREATE TABLE public.customer_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  monthly_price NUMERIC,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_services_user ON public.customer_services(customer_user_id);

ALTER TABLE public.customer_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_services"
ON public.customer_services
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers can view their own services"
ON public.customer_services
FOR SELECT
TO authenticated
USING (auth.uid() = customer_user_id);

CREATE TRIGGER update_customer_services_updated_at
BEFORE UPDATE ON public.customer_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();