REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_booking() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_challenge() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prepare_booking() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.ground_availability(_date date)
RETURNS TABLE(slot_id uuid, label text, start_time time without time zone, end_time time without time zone, price_inr integer, status text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION public.slot_price(_slot_id uuid, _date date)
RETURNS integer
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT CASE WHEN EXTRACT(DOW FROM _date) IN (0,6) THEN s.weekend_price_inr ELSE s.weekday_price_inr END + s.extra_charges_inr
  FROM public.ground_slots s WHERE s.id = _slot_id;
$$;
REVOKE EXECUTE ON FUNCTION public.slot_price(uuid, date) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.prepare_booking()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
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
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.admin_accounts aa ON aa.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin' AND aa.status = 'active'
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;