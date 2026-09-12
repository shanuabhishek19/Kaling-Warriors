UPDATE public.grounds
SET facilities = array_remove(facilities, 'Floodlights'), updated_at = now()
WHERE 'Floodlights' = ANY(facilities);

ALTER TABLE public.grounds
  ALTER COLUMN facilities SET DEFAULT ARRAY['Changing Room','Drinking Water','Parking','Seating','Scoreboard'];
