ALTER TABLE public.players
  DROP CONSTRAINT IF EXISTS players_leadership_conflict_check;

ALTER TABLE public.players
  ADD CONSTRAINT players_leadership_conflict_check
  CHECK (NOT (additional_role = 'Captain' AND additional_role = 'Vice Captain'));

CREATE OR REPLACE FUNCTION public.assign_player_leadership(
  _player_id uuid,
  _additional_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only active administrators can assign player leadership roles';
  END IF;

  IF _additional_role NOT IN ('None', 'Captain', 'Vice Captain') THEN
    RAISE EXCEPTION 'Invalid additional role';
  END IF;

  IF _additional_role <> 'None' THEN
    UPDATE public.players
    SET additional_role = 'None'
    WHERE additional_role = _additional_role AND id <> _player_id;
  END IF;

  UPDATE public.players
  SET additional_role = _additional_role
  WHERE id = _player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_player_leadership(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_player_leadership(uuid, text) TO authenticated;
