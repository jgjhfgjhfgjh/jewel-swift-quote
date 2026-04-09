
-- Migrate existing 'customer' roles to 'b2b_approved'
UPDATE public.user_roles SET role = 'b2b_approved' WHERE role = 'customer';

-- Update the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _provider text;
  _role app_role;
BEGIN
  _provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  IF _provider IN ('google', 'apple') THEN
    _role := 'lead';
  ELSE
    _role := 'b2b_approved';
  END IF;

  INSERT INTO public.profiles (user_id, company_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$$;
