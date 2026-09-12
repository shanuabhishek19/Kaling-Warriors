ALTER TABLE public.team_settings
  ADD COLUMN IF NOT EXISTS cricheroes_team_url text,
  ADD COLUMN IF NOT EXISTS cricheroes_last_synced_at timestamptz;

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS cricheroes_profile_url text,
  ADD COLUMN IF NOT EXISTS cricheroes_last_synced_at timestamptz;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS cricheroes_match_url text,
  ADD COLUMN IF NOT EXISTS cricheroes_last_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS players_cricheroes_profile_url_unique
  ON public.players (cricheroes_profile_url)
  WHERE cricheroes_profile_url IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS matches_cricheroes_match_url_unique
  ON public.matches (cricheroes_match_url)
  WHERE cricheroes_match_url IS NOT NULL;
