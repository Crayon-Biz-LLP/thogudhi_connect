-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'volunteer');
CREATE TYPE public.submission_type AS ENUM ('issue', 'question', 'idea', 'view');
CREATE TYPE public.submission_status AS ENUM ('received', 'under_review', 'referred', 'awaiting_update', 'resolved', 'closed');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.submission_category AS ENUM (
  'roads', 'streetlights', 'garbage', 'water', 'sewerage', 'traffic', 'parks',
  'education', 'senior_citizens', 'accessibility', 'environment', 'public_safety', 'other'
);
CREATE TYPE public.contact_method AS ENUM ('none', 'phone', 'email', 'whatsapp');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','moderator'))
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- Bootstrap: first signed-in user may claim admin if no admin exists yet
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Team can view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_team_member(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Yearly counters (service role only)
CREATE TABLE public.yearly_counters (
  year INT PRIMARY KEY,
  last_seq INT NOT NULL DEFAULT 0
);
GRANT ALL ON public.yearly_counters TO service_role;
ALTER TABLE public.yearly_counters ENABLE ROW LEVEL SECURITY;

-- Submissions (private)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT UNIQUE,
  year INT,
  seq INT,
  type public.submission_type NOT NULL,
  name TEXT,
  locality TEXT NOT NULL,
  ward TEXT,
  category public.submission_category NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  landmark TEXT,
  phone TEXT,
  email TEXT,
  preferred_contact public.contact_method NOT NULL DEFAULT 'none',
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status public.submission_status NOT NULL DEFAULT 'received',
  moderation public.moderation_status NOT NULL DEFAULT 'pending',
  assigned_to UUID,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (year, seq)
);
GRANT SELECT, UPDATE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX submissions_status_idx ON public.submissions (status);
CREATE INDEX submissions_created_idx ON public.submissions (created_at DESC);
CREATE INDEX submissions_assigned_idx ON public.submissions (assigned_to);

CREATE OR REPLACE FUNCTION public.assign_public_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  y INT := EXTRACT(YEAR FROM (now() AT TIME ZONE 'Asia/Kolkata'))::INT;
  n INT;
BEGIN
  INSERT INTO public.yearly_counters (year, last_seq) VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE SET last_seq = public.yearly_counters.last_seq + 1
  RETURNING last_seq INTO n;
  NEW.year := y;
  NEW.seq := n;
  NEW.public_id := format('WTL-TL-%s-%s', y, lpad(n::TEXT, 4, '0'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER submissions_assign_public_id BEFORE INSERT ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.assign_public_id();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff view submissions" ON public.submissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR assigned_to = auth.uid());
CREATE POLICY "Staff update submissions" ON public.submissions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR assigned_to = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) OR assigned_to = auth.uid());

-- Public board entries (sanitized)
CREATE TABLE public.submission_public (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL,
  type public.submission_type NOT NULL,
  category public.submission_category NOT NULL,
  locality TEXT NOT NULL,
  ward TEXT,
  public_title TEXT NOT NULL,
  public_summary TEXT NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'received',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.submission_public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submission_public TO authenticated;
GRANT ALL ON public.submission_public TO service_role;
ALTER TABLE public.submission_public ENABLE ROW LEVEL SECURITY;
CREATE INDEX submission_public_published_idx ON public.submission_public (is_published, submitted_at DESC);

CREATE POLICY "Anyone views published entries" ON public.submission_public FOR SELECT TO anon, authenticated
  USING (is_published = TRUE OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage public entries" ON public.submission_public FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER submission_public_updated_at BEFORE UPDATE ON public.submission_public
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Status history
CREATE TABLE public.submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  from_status public.submission_status,
  to_status public.submission_status NOT NULL,
  note TEXT,
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.submission_history TO authenticated;
GRANT ALL ON public.submission_history TO service_role;
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX submission_history_sub_idx ON public.submission_history (submission_id, created_at);

CREATE POLICY "Team views history" ON public.submission_history FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.assigned_to = auth.uid()));
CREATE POLICY "Team inserts history" ON public.submission_history FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.assigned_to = auth.uid()));

-- Status change trigger: log history + mirror to public entry
CREATE OR REPLACE FUNCTION public.on_submission_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.submission_history (submission_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, NULL);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.submission_history (submission_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    UPDATE public.submission_public SET status = NEW.status WHERE submission_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER submissions_status_change AFTER INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.on_submission_status_change();

-- Notes
CREATE TABLE public.submission_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  author_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submission_notes TO authenticated;
GRANT ALL ON public.submission_notes TO service_role;
ALTER TABLE public.submission_notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX submission_notes_sub_idx ON public.submission_notes (submission_id, created_at);

CREATE POLICY "Team views notes" ON public.submission_notes FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.assigned_to = auth.uid()));
CREATE POLICY "Team inserts notes" ON public.submission_notes FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.assigned_to = auth.uid())));
CREATE POLICY "Staff delete notes" ON public.submission_notes FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- Assignments log
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  assignee_id UUID,
  assigned_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view assignments" ON public.assignments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR assignee_id = auth.uid());
CREATE POLICY "Staff insert assignments" ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND assigned_by = auth.uid());

-- Attachments
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team views attachments" ON public.attachments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.assigned_to = auth.uid()));

-- Simple rate limiting for anonymous submissions (service role only)
CREATE TABLE public.submission_rate_limits (
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.submission_rate_limits TO service_role;
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX submission_rate_limits_idx ON public.submission_rate_limits (ip_hash, created_at);