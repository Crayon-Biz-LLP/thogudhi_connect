ALTER TABLE public.submissions
  ADD COLUMN tracking_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX submissions_tracking_token_idx ON public.submissions (tracking_token);

ALTER TABLE public.submissions
  ALTER COLUMN public_id SET NOT NULL,
  ALTER COLUMN year SET NOT NULL,
  ALTER COLUMN seq SET NOT NULL;

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_submission_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id
     OR NEW.year IS DISTINCT FROM OLD.year
     OR NEW.seq IS DISTINCT FROM OLD.seq
     OR NEW.tracking_token IS DISTINCT FROM OLD.tracking_token THEN
    RAISE EXCEPTION 'Generated submission identifiers cannot be changed';
  END IF;

  IF NOT public.is_staff(auth.uid()) THEN
    IF OLD.assigned_to IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Submission access denied';
    END IF;
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.moderation IS DISTINCT FROM OLD.moderation
       OR NEW.type IS DISTINCT FROM OLD.type
       OR NEW.name IS DISTINCT FROM OLD.name
       OR NEW.locality IS DISTINCT FROM OLD.locality
       OR NEW.ward IS DISTINCT FROM OLD.ward
       OR NEW.category IS DISTINCT FROM OLD.category
       OR NEW.subject IS DISTINCT FROM OLD.subject
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.landmark IS DISTINCT FROM OLD.landmark
       OR NEW.phone IS DISTINCT FROM OLD.phone
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.preferred_contact IS DISTINCT FROM OLD.preferred_contact
       OR NEW.consent IS DISTINCT FROM OLD.consent
       OR NEW.is_demo IS DISTINCT FROM OLD.is_demo
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Assigned volunteers may update status only';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_submission_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS submissions_protect_fields ON public.submissions;
CREATE TRIGGER submissions_protect_fields
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.protect_submission_fields();

CREATE INDEX submission_rate_limits_created_idx ON public.submission_rate_limits (created_at);