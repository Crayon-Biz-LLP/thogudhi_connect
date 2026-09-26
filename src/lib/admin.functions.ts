import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const statusSchema = z.enum(["received", "under_review", "referred", "awaiting_update", "resolved", "closed"]);
const moderationSchema = z.enum(["pending", "approved", "rejected"]);

async function requireTeam(context: { supabase: any; userId: string }) {
  const { data: roles, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const role = roles?.find((row: { role: string }) => ["admin", "moderator", "volunteer"].includes(row.role))?.role;
  if (!role) throw new Error("Your account does not have team access.");
  return role as "admin" | "moderator" | "volunteer";
}

export const bootstrapTeamAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const currentRole = existing?.[0]?.role;
    if (currentRole) return { role: currentRole };
    const { data: claimed, error } = await context.supabase.rpc("bootstrap_first_admin");
    if (error) throw new Error(error.message);
    if (!claimed) return { role: null };
    return { role: "admin" as const };
  });

export const getTeamDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await requireTeam(context);
    const { data, error } = await context.supabase
      .from("submissions")
      .select("id, public_id, type, category, subject, locality, ward, status, moderation, assigned_to, is_demo, created_at")
      .order("created_at", { ascending: false })
      .limit(250);
    if (error) throw new Error(error.message);
    return { role, userId: context.userId, submissions: data ?? [] };
  });

export const getSubmissionForTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const role = await requireTeam(context);
    const { data: submission, error } = await context.supabase.from("submissions").select("*").eq("id", data.id).single();
    if (error || !submission) throw new Error("Submission not found or access denied.");
    const [{ data: history }, { data: notes }, { data: publicEntry }, { data: profiles }, { data: roleRows }] = await Promise.all([
      context.supabase.from("submission_history").select("id, from_status, to_status, note, changed_by, created_at").eq("submission_id", data.id).order("created_at"),
      context.supabase.from("submission_notes").select("id, body, is_public, author_id, created_at").eq("submission_id", data.id).order("created_at", { ascending: false }),
      context.supabase.from("submission_public").select("public_title, public_summary, is_published").eq("submission_id", data.id).maybeSingle(),
      context.supabase.from("profiles").select("id, display_name"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    const team = role === "admin" || role === "moderator"
      ? (profiles ?? []).map((profile: { id: string; display_name: string }) => ({
          ...profile,
          role: roleRows?.find((item: { user_id: string; role: string }) => item.user_id === profile.id)?.role ?? null,
        })).filter((item: { role: string | null }) => item.role)
      : [];
    return { role, submission, history: history ?? [], notes: notes ?? [], publicEntry, team };
  });

export const updateSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid(),
    status: statusSchema,
    moderation: moderationSchema,
    publicTitle: z.string().trim().max(150),
    publicSummary: z.string().trim().max(1000),
    publish: z.boolean(),
    assigneeId: z.string().uuid().nullable(),
    statusNote: z.string().trim().max(1000).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const role = await requireTeam(context);
    if (role === "volunteer" && (data.moderation !== "pending" || data.publish)) throw new Error("Only moderators can publish entries.");
    const { data: current, error: currentError } = await context.supabase
      .from("submissions").select("id, public_id, type, category, locality, ward, subject, description, status, assigned_to, created_at, is_demo")
      .eq("id", data.id).single();
    if (currentError || !current) throw new Error("Submission not found or access denied.");
    if (role === "volunteer" && current.assigned_to !== context.userId) throw new Error("Access denied.");

    const updates = role === "volunteer"
      ? { status: data.status }
      : { status: data.status, moderation: data.moderation, assigned_to: data.assigneeId };
    const { error: updateError } = await context.supabase.from("submissions").update(updates).eq("id", data.id);
    if (updateError) throw new Error(updateError.message);

    if (data.status !== current.status && data.statusNote) {
      const { data: latestHistory, error: historyError } = await context.supabase.from("submission_history")
        .select("id").eq("submission_id", data.id).eq("to_status", data.status)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (historyError) throw new Error(historyError.message);
      if (latestHistory) {
        const { error: noteError } = await context.supabase.from("submission_history")
          .update({ note: data.statusNote }).eq("id", latestHistory.id);
        if (noteError) throw new Error(noteError.message);
      }
    }

    if (role !== "volunteer") {
      if (data.publish) {
        if (data.moderation !== "approved" || !data.publicTitle || !data.publicSummary) throw new Error("Approve and add a public title and summary before publishing.");
        const { error: publicError } = await context.supabase.from("submission_public").upsert({
          submission_id: current.id,
          public_id: current.public_id ?? "",
          type: current.type,
          category: current.category,
          locality: current.locality,
          ward: current.ward,
          public_title: data.publicTitle,
          public_summary: data.publicSummary,
          status: data.status,
          is_published: true,
          is_demo: current.is_demo,
          submitted_at: current.created_at,
        }, { onConflict: "submission_id" });
        if (publicError) throw new Error(publicError.message);
      } else {
        const { error: unpublishError } = await context.supabase.from("submission_public").update({ is_published: false }).eq("submission_id", data.id);
        if (unpublishError) throw new Error(unpublishError.message);
      }
      if (data.assigneeId !== current.assigned_to) {
        const { error: assignmentError } = await context.supabase.from("assignments").insert({ submission_id: data.id, assignee_id: data.assigneeId, assigned_by: context.userId });
        if (assignmentError) throw new Error(assignmentError.message);
      }
    }
    return { ok: true };
  });

export const addSubmissionNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), body: z.string().trim().min(2).max(2000), isPublic: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireTeam(context);
    const { error } = await context.supabase.from("submission_notes").insert({ submission_id: data.id, body: data.body, is_public: data.isPublic, author_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
