INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS email_notified_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS email_notified_at timestamptz;

CREATE TABLE IF NOT EXISTS public.notification_rate_limits (
  rate_key text PRIMARY KEY,
  last_sent_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.notification_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.notification_rate_limits TO service_role;
ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_notification_rate_limit(_rate_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_rate_limits (rate_key, last_sent_at)
  VALUES (_rate_key, now())
  ON CONFLICT (rate_key) DO UPDATE
    SET last_sent_at = now()
    WHERE notification_rate_limits.last_sent_at < now() - interval '5 minutes';
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_notification_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_notification_rate_limit(text) TO service_role;
