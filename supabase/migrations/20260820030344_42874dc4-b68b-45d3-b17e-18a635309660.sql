
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- TEAM SETTINGS (single row)
CREATE TABLE public.team_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL DEFAULT 'Elevate Cricket Club',
  tagline text NOT NULL DEFAULT 'Play hard. Play fair. Play together.',
  about text NOT NULL DEFAULT 'We are a local cricket club built on passion, discipline and community spirit.',
  logo_url text,
  phone text NOT NULL DEFAULT '+91 98765 43210',
  email text NOT NULL DEFAULT 'hello@elevatecc.in',
  address text NOT NULL DEFAULT 'Elevate Cricket Ground, Bengaluru, Karnataka',
  maps_url text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  whatsapp_number text NOT NULL DEFAULT '919876543210',
  matches_played int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_settings TO authenticated;
GRANT ALL ON public.team_settings TO service_role;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team settings public read" ON public.team_settings FOR SELECT USING (true);
CREATE POLICY "team settings admin write" ON public.team_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER team_settings_touch BEFORE UPDATE ON public.team_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PLAYERS
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  jersey_number int,
  role text NOT NULL DEFAULT 'Batsman',
  batting_style text,
  bowling_style text,
  bio text,
  photo_url text,
  matches int NOT NULL DEFAULT 0,
  runs int NOT NULL DEFAULT 0,
  wickets int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "players admin write" ON public.players FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER players_touch BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opponent text NOT NULL,
  match_date date NOT NULL,
  match_time time NOT NULL DEFAULT '09:00',
  venue text NOT NULL,
  format text NOT NULL DEFAULT 'T20',
  ball_type text NOT NULL DEFAULT 'Hard Tennis Ball',
  status text NOT NULL DEFAULT 'upcoming',
  our_score text,
  opponent_score text,
  result text,
  player_of_match text,
  summary text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX matches_no_clash ON public.matches (match_date, match_time) WHERE status <> 'cancelled';
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches public read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches admin write" ON public.matches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER matches_touch BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CHALLENGES
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  venue text NOT NULL,
  format text NOT NULL DEFAULT 'T20',
  ball_type text NOT NULL DEFAULT 'Hard Tennis Ball',
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  proposed_date date,
  proposed_time time,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.challenges TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit a challenge" ON public.challenges FOR INSERT WITH CHECK (preferred_date >= CURRENT_DATE AND status = 'pending');
CREATE POLICY "challenges admin read" ON public.challenges FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "challenges admin update" ON public.challenges FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "challenges admin delete" ON public.challenges FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER challenges_touch BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- GROUND
CREATE TABLE public.grounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Elevate Cricket Ground',
  location text NOT NULL DEFAULT 'Bengaluru, Karnataka',
  description text NOT NULL DEFAULT 'A well-maintained turf ground with floodlights, ideal for tennis-ball and hard-tennis-ball cricket.',
  pitch_type text NOT NULL DEFAULT 'Astro Turf',
  ball_types text[] NOT NULL DEFAULT ARRAY['Tennis Ball','Hard Tennis Ball'],
  facilities text[] NOT NULL DEFAULT ARRAY['Floodlights','Changing Room','Drinking Water','Parking','Seating','Scoreboard'],
  capacity text NOT NULL DEFAULT '22 players (11 a side)',
  photos text[] NOT NULL DEFAULT ARRAY[]::text[],
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grounds TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.grounds TO authenticated;
GRANT ALL ON public.grounds TO service_role;
ALTER TABLE public.grounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grounds public read" ON public.grounds FOR SELECT USING (true);
CREATE POLICY "grounds admin write" ON public.grounds FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER grounds_touch BEFORE UPDATE ON public.grounds FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SLOTS + PRICING
CREATE TABLE public.ground_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  weekday_price_inr int NOT NULL DEFAULT 2500,
  weekend_price_inr int NOT NULL DEFAULT 3000,
  extra_charges_inr int NOT NULL DEFAULT 0,
  extra_charges_note text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ground_slots TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ground_slots TO authenticated;
GRANT ALL ON public.ground_slots TO service_role;
ALTER TABLE public.ground_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots public read" ON public.ground_slots FOR SELECT USING (true);
CREATE POLICY "slots admin write" ON public.ground_slots FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER slots_touch BEFORE UPDATE ON public.ground_slots FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- BLOCKED DATES / SLOTS
CREATE TABLE public.ground_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_date date NOT NULL,
  slot_id uuid REFERENCES public.ground_slots(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ground_blocks_day ON public.ground_blocks (block_date) WHERE slot_id IS NULL;
CREATE UNIQUE INDEX ground_blocks_slot ON public.ground_blocks (block_date, slot_id) WHERE slot_id IS NOT NULL;
GRANT SELECT ON public.ground_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ground_blocks TO authenticated;
GRANT ALL ON public.ground_blocks TO service_role;
ALTER TABLE public.ground_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks public read" ON public.ground_blocks FOR SELECT USING (true);
CREATE POLICY "blocks admin write" ON public.ground_blocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  booking_date date NOT NULL,
  slot_id uuid NOT NULL REFERENCES public.ground_slots(id) ON DELETE RESTRICT,
  duration_hours numeric NOT NULL DEFAULT 2,
  players_count int NOT NULL DEFAULT 22,
  format text NOT NULL DEFAULT 'T20',
  requirements text,
  status text NOT NULL DEFAULT 'pending',
  price_inr int NOT NULL DEFAULT 0,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX bookings_no_double ON public.bookings (booking_date, slot_id) WHERE status IN ('pending','confirmed','completed');
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request a booking" ON public.bookings FOR INSERT WITH CHECK (booking_date >= CURRENT_DATE AND status = 'pending');
CREATE POLICY "bookings admin read" ON public.bookings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "bookings admin update" ON public.bookings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "bookings admin delete" ON public.bookings FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER bookings_touch BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- price locking + validation
CREATE OR REPLACE FUNCTION public.slot_price(_slot_id uuid, _date date)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN EXTRACT(DOW FROM _date) IN (0,6) THEN s.weekend_price_inr ELSE s.weekday_price_inr END + s.extra_charges_inr
  FROM public.ground_slots s WHERE s.id = _slot_id;
$$;

CREATE OR REPLACE FUNCTION public.prepare_booking() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Bookings cannot be made for past dates';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.ground_blocks b
    WHERE b.block_date = NEW.booking_date AND (b.slot_id IS NULL OR b.slot_id = NEW.slot_id)
  ) THEN
    RAISE EXCEPTION 'This date or slot is not available for booking';
  END IF;
  NEW.price_inr := public.slot_price(NEW.slot_id, NEW.booking_date);
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_prepare BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.prepare_booking();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications admin read" ON public.notifications FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "notifications admin update" ON public.notifications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notifications admin delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.notify_challenge() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (kind, title, body)
  VALUES ('challenge', 'New match challenge received from ' || NEW.team_name,
    'Requested for ' || to_char(NEW.preferred_date, 'DD Mon YYYY') || ' at ' || to_char(NEW.preferred_time, 'HH12:MI AM') || ' — ' || NEW.venue);
  RETURN NEW;
END; $$;
CREATE TRIGGER challenges_notify AFTER INSERT ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.notify_challenge();

CREATE OR REPLACE FUNCTION public.notify_booking() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (kind, title, body)
  VALUES ('booking', 'New ground booking request received for ' || to_char(NEW.booking_date, 'DD Month YYYY'),
    NEW.team_name || ' requested a slot. Amount: Rs ' || NEW.price_inr);
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_notify AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.notify_booking();

-- availability helper (hides customer details from the public)
CREATE OR REPLACE FUNCTION public.ground_availability(_date date)
RETURNS TABLE (slot_id uuid, label text, start_time time, end_time time, price_inr int, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.label, s.start_time, s.end_time,
    public.slot_price(s.id, _date),
    CASE
      WHEN _date < CURRENT_DATE THEN 'closed'
      WHEN EXISTS (SELECT 1 FROM public.ground_blocks b WHERE b.block_date = _date AND (b.slot_id IS NULL OR b.slot_id = s.id)) THEN 'closed'
      WHEN EXISTS (SELECT 1 FROM public.bookings k WHERE k.booking_date = _date AND k.slot_id = s.id AND k.status IN ('confirmed','completed')) THEN 'booked'
      WHEN EXISTS (SELECT 1 FROM public.bookings k WHERE k.booking_date = _date AND k.slot_id = s.id AND k.status = 'pending') THEN 'pending'
      ELSE 'available'
    END
  FROM public.ground_slots s
  WHERE s.active
  ORDER BY s.sort_order, s.start_time;
$$;
GRANT EXECUTE ON FUNCTION public.ground_availability(date) TO anon, authenticated;

-- GALLERY
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Match',
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "gallery admin write" ON public.gallery FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SEED
INSERT INTO public.team_settings (id) VALUES (gen_random_uuid());
INSERT INTO public.grounds (id) VALUES (gen_random_uuid());
INSERT INTO public.ground_slots (label, start_time, end_time, weekday_price_inr, weekend_price_inr, sort_order) VALUES
  ('Early Morning', '06:00', '08:00', 2000, 2500, 1),
  ('Morning', '08:00', '10:00', 2500, 3000, 2),
  ('Late Morning', '10:00', '12:00', 2500, 3000, 3),
  ('Afternoon', '14:00', '16:00', 2200, 2800, 4),
  ('Evening', '16:00', '18:00', 2800, 3500, 5),
  ('Night (Floodlights)', '19:00', '21:00', 3500, 4200, 6);

INSERT INTO public.players (name, jersey_number, role, batting_style, bowling_style, bio, matches, runs, wickets, sort_order) VALUES
  ('Player One', 7, 'Captain', 'Right Handed', 'Right Arm Medium', 'Placeholder bio — replace from the admin panel.', 42, 1180, 21, 1),
  ('Player Two', 18, 'Vice Captain', 'Left Handed', 'Right Arm Off Break', 'Placeholder bio — replace from the admin panel.', 38, 960, 34, 2),
  ('Player Three', 45, 'All-rounder', 'Right Handed', 'Right Arm Fast', 'Placeholder bio — replace from the admin panel.', 35, 640, 48, 3),
  ('Player Four', 10, 'Batsman', 'Right Handed', NULL, 'Placeholder bio — replace from the admin panel.', 30, 880, 2, 4),
  ('Player Five', 99, 'Bowler', 'Right Handed', 'Left Arm Fast Medium', 'Placeholder bio — replace from the admin panel.', 28, 120, 52, 5),
  ('Player Six', 21, 'Wicketkeeper', 'Left Handed', NULL, 'Placeholder bio — replace from the admin panel.', 33, 540, 0, 6);

INSERT INTO public.matches (opponent, match_date, match_time, venue, format, status, our_score, opponent_score, result, player_of_match, summary) VALUES
  ('Royal Strikers CC', CURRENT_DATE + 6, '09:00', 'Elevate Cricket Ground', 'T20', 'upcoming', NULL, NULL, NULL, NULL, NULL),
  ('City Chargers', CURRENT_DATE + 14, '16:00', 'City Sports Complex', 'T20', 'upcoming', NULL, NULL, NULL, NULL, NULL),
  ('Thunder XI', CURRENT_DATE - 7, '09:00', 'Elevate Cricket Ground', 'T20', 'completed', '164/5', '151/9', 'win', 'Player One', 'A composed batting effort backed by tight death bowling.'),
  ('Metro Warriors', CURRENT_DATE - 18, '16:00', 'Metro Turf', 'T10', 'completed', '92/7', '95/4', 'loss', 'Player Three', 'Lost a close finish in the final over.');
