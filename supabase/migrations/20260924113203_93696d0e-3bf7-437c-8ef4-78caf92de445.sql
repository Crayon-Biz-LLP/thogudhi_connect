REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.assign_public_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_submission_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID) TO authenticated;

DROP POLICY "Anyone views published entries" ON public.submission_public;
CREATE POLICY "Anyone views published entries" ON public.submission_public FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);

CREATE POLICY "Staff read submission images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'submission-images' AND public.is_staff(auth.uid()));