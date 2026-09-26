GRANT UPDATE ON public.submission_history TO authenticated;

CREATE POLICY "Team updates history notes"
ON public.submission_history
FOR UPDATE
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_history.submission_id
      AND s.assigned_to = auth.uid()
  )
)
WITH CHECK (
  public.is_staff(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_history.submission_id
      AND s.assigned_to = auth.uid()
  )
);