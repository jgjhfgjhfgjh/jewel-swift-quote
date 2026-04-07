
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
ON public.wishlist FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view any wishlist"
ON public.wishlist FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlist FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any wishlist"
ON public.wishlist FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
