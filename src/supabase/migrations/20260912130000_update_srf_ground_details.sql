UPDATE public.grounds
SET name = 'SRF Cricket Ground',
    description = regexp_replace(description, '\s*with floodlights,?', '', 'gi'),
    facilities = array_remove(facilities, 'Floodlights'),
    updated_at = now()
WHERE name = 'Elevate Cricket Ground'
   OR description ILIKE '%floodlight%'
   OR 'Floodlights' = ANY(facilities);

UPDATE public.ground_slots
SET label = 'Night', active = false, updated_at = now()
WHERE label ILIKE '%floodlight%';

ALTER TABLE public.grounds
  ALTER COLUMN name SET DEFAULT 'SRF Cricket Ground',
  ALTER COLUMN description SET DEFAULT 'A well-maintained turf ground for tennis-ball and hard-tennis-ball cricket.',
  ALTER COLUMN facilities SET DEFAULT ARRAY['Changing Room','Drinking Water','Parking','Seating','Scoreboard'];
