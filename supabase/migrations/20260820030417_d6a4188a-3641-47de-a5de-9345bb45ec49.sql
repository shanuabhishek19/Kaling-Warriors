
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prepare_booking() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_challenge() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_booking() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.slot_price(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.ground_availability(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ground_availability(date) TO anon, authenticated;
