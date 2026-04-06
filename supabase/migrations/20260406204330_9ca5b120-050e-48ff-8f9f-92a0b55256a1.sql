
CREATE TABLE public.customer_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_user_id UUID NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('brand', 'product')),
  target_key TEXT NOT NULL,
  percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (customer_user_id, discount_type, target_key)
);

ALTER TABLE public.customer_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with customer_discounts"
ON public.customer_discounts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view their own discounts"
ON public.customer_discounts
FOR SELECT
TO authenticated
USING (auth.uid() = customer_user_id);

CREATE TRIGGER update_customer_discounts_updated_at
BEFORE UPDATE ON public.customer_discounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
