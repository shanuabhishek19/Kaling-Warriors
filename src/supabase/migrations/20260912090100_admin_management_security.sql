CREATE OR REPLACE FUNCTION public.is_admin_for_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admin_accounts aa ON aa.user_id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'
      AND aa.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_for_user(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_for_user(uuid) TO service_role;
