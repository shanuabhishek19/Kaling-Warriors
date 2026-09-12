ALTER TABLE public.admin_accounts ADD COLUMN IF NOT EXISTS email text;

UPDATE public.admin_accounts aa
SET email = au.email
FROM auth.users au
WHERE au.id = aa.user_id AND aa.email IS DISTINCT FROM au.email;

ALTER TABLE public.admin_accounts ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_accounts_email_unique ON public.admin_accounts (lower(email));
DROP POLICY IF EXISTS "admins can read administrator accounts" ON public.admin_accounts;
CREATE POLICY "admins can read administrator accounts" ON public.admin_accounts FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_additional_role_check;
ALTER TABLE public.players ADD CONSTRAINT players_additional_role_check CHECK (additional_role IN ('None', 'Captain', 'Vice Captain'));
CREATE UNIQUE INDEX IF NOT EXISTS players_one_captain ON public.players (additional_role) WHERE additional_role = 'Captain';
CREATE UNIQUE INDEX IF NOT EXISTS players_one_vice_captain ON public.players (additional_role) WHERE additional_role = 'Vice Captain';