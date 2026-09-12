ALTER TABLE public.players ADD COLUMN IF NOT EXISTS additional_role text NOT NULL DEFAULT 'None';

WITH ranked_roles AS (
  SELECT id,
    lower(trim(role)) AS normalized_role,
    row_number() OVER (PARTITION BY lower(trim(role)) ORDER BY created_at, id) AS role_rank
  FROM public.players
)
UPDATE public.players p
SET additional_role = CASE
  WHEN r.normalized_role = 'captain' AND r.role_rank = 1 THEN 'Captain'
  WHEN r.normalized_role = 'vice captain' AND r.role_rank = 1 THEN 'Vice Captain'
  ELSE 'None'
END,
role = CASE
  WHEN r.normalized_role IN ('captain', 'vice captain') THEN 'Batsman'
  WHEN r.normalized_role IN ('all-rounder', 'all rounder', 'allrounder') THEN 'All-Rounder'
  WHEN r.normalized_role IN ('wicket keeper', 'wicket-keeper', 'wicketkeeper') THEN 'Wicketkeeper'
  WHEN r.normalized_role IN ('batsman', 'bowler', 'all-rounder', 'wicketkeeper') THEN initcap(r.normalized_role)
  ELSE 'Batsman'
END
FROM ranked_roles r
WHERE p.id = r.id;

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_role_values_check;
ALTER TABLE public.players ADD CONSTRAINT players_role_values_check CHECK (role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper') AND additional_role IN ('None', 'Captain', 'Vice Captain'));
CREATE UNIQUE INDEX IF NOT EXISTS players_one_captain ON public.players (additional_role) WHERE additional_role = 'Captain';
CREATE UNIQUE INDEX IF NOT EXISTS players_one_vice_captain ON public.players (additional_role) WHERE additional_role = 'Vice Captain';

CREATE TABLE public.admin_accounts (
  user_id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_accounts TO authenticated;
GRANT ALL ON public.admin_accounts TO service_role;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins can read administrator accounts" ON public.admin_accounts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER admin_accounts_touch BEFORE UPDATE ON public.admin_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.admin_accounts (user_id, name, status)
SELECT ur.user_id,
  COALESCE(NULLIF(au.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(au.email, ''), '@', 1), 'Administrator'),
  'active'
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    AND EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid() AND a.status = 'active'
    );
$$;