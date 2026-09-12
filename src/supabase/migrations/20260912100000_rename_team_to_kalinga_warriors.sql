UPDATE public.team_settings
SET team_name = 'Kalinga Warriors', updated_at = now()
WHERE team_name = 'Elevate Cricket Club';

ALTER TABLE public.team_settings
  ALTER COLUMN team_name SET DEFAULT 'Kalinga Warriors';
