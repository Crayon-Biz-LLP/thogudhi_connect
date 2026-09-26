import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { TeamShell } from "@/components/site/TeamShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addSubmissionNote, getSubmissionForTeam, updateSubmission } from "@/lib/admin.functions";
import { getAttachmentUrls } from "@/lib/submissions.functions";
import { STATUSES, STATUS_ORDER, bi, type ModerationStatus, type SubmissionStatus } from "@/lib/constants";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/submissions/$id")({
  head: () => ({ meta: [
    { title: "Review submission — Thogudhi Inai" }, { name: "description", content: "Secure submission review and moderation." },
    { property: "og:title", content: "Review submission — Thogudhi Inai" }, { property: "og:description", content: "Secure submission review." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ]}), component: SubmissionReview,
});

function SubmissionReview() {
  const { id } = Route.useParams(); const { lang } = useLang(); const qc = useQueryClient();
  const load = useServerFn(getSubmissionForTeam); const saveFn = useServerFn(updateSubmission); const addNoteFn = useServerFn(addSubmissionNote);
  const loadAttachments = useServerFn(getAttachmentUrls);
  const query = useQuery({ queryKey: ["team-submission", id], queryFn: () => load({ data: { id } }) });
  const attachments = useQuery({ queryKey: ["team-attachments", id], queryFn: () => loadAttachments({ data: { submissionId: id } }) });
  const [status, setStatus] = useState<SubmissionStatus>("received"); const [moderation, setModeration] = useState<ModerationStatus>("pending");
  const [title, setTitle] = useState(""); const [summary, setSummary] = useState(""); const [publish, setPublish] = useState(false); const [assignee, setAssignee] = useState(""); const [statusNote, setStatusNote] = useState("");
  useEffect(() => { const d = query.data; if (!d) return; setStatus(d.submission.status); setModeration(d.submission.moderation); setTitle(d.publicEntry?.public_title ?? d.submission.subject); setSummary(d.publicEntry?.public_summary ?? ""); setPublish(d.publicEntry?.is_published ?? false); setAssignee(d.submission.assigned_to ?? ""); }, [query.data]);
  const save = useMutation({ mutationFn: () => saveFn({ data: { id, status, moderation, publicTitle: title, publicSummary: summary, publish, assigneeId: assignee || null, statusNote } }), onSuccess: async () => { toast.success("Saved"); setStatusNote(""); await qc.invalidateQueries({ queryKey: ["team-submission", id] }); await qc.invalidateQueries({ queryKey: ["team-dashboard"] }); }, onError: (e) => toast.error(e.message) });
  const note = useMutation({ mutationFn: (payload: { body: string; isPublic: boolean }) => addNoteFn({ data: { id, ...payload } }), onSuccess: async () => { toast.success("Note added"); await qc.invalidateQueries({ queryKey: ["team-submission", id] }); }, onError: (e) => toast.error(e.message) });
  if (query.isLoading) return <TeamShell><p className="p-12 text-center">Loading…</p></TeamShell>;
  if (!query.data) return <TeamShell><p className="p-12 text-center text-destructive">{query.error?.message ?? "Not found"}</p></TeamShell>;
  const d = query.data; const canModerate = d.role !== "volunteer";
  return <TeamShell><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="size-4" /> Dashboard</Link>
    <div className="mt-4 flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-sm font-bold text-primary">{d.submission.public_id}</p><h1 className="mt-1 text-2xl font-extrabold text-primary-deep">{d.submission.subject}</h1><p className="mt-1 text-sm text-muted-foreground">{d.submission.locality} · {format(new Date(d.submission.created_at), "d MMM yyyy, h:mm a")}</p></div><StatusBadge status={d.submission.status} /></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_380px]"><div className="space-y-6">
      <section className="rounded-md border bg-card p-5"><h2 className="font-bold">Submission details</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Type" value={d.submission.type} /><Info label="Category" value={d.submission.category} /><Info label="Ward" value={d.submission.ward || "—"} /><Info label="Landmark" value={d.submission.landmark || "—"} /><Info label="Name" value={d.submission.name || "Anonymous"} /><Info label="Preferred contact" value={d.submission.preferred_contact} /><Info label="Phone" value={d.submission.phone || "—"} /><Info label="Email" value={d.submission.email || "—"} /></dl><p className="mt-5 whitespace-pre-wrap border-t pt-5 text-sm leading-relaxed">{d.submission.description}</p>
        {attachments.data?.length ? <div className="mt-5 border-t pt-5"><h3 className="text-sm font-bold">Attachments</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{attachments.data.map((item) => item.url && <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border"><img src={item.url} alt="Submission attachment" className="aspect-square w-full object-cover" /></a>)}</div></div> : null}
      </section>
      <section className="rounded-md border bg-card p-5"><h2 className="font-bold">Notes</h2><NoteForm busy={note.isPending} onAdd={(body, isPublic) => note.mutate({ body, isPublic })} /> <div className="mt-5 space-y-3">{d.notes.map((n) => <div key={n.id} className="rounded-md bg-muted p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-semibold">{n.is_public ? "Public update" : "Private note"}</span><span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "d MMM yyyy")}</span></div><p className="mt-1 whitespace-pre-wrap">{n.body}</p></div>)}</div></section>
      <section className="rounded-md border bg-card p-5"><h2 className="font-bold">Status history</h2><ol className="mt-4 space-y-3 border-l-2 border-primary/20 pl-4">{d.history.map((h) => <li key={h.id} className="text-sm"><span className="font-semibold">{bi(STATUSES[h.to_status], lang)}</span><span className="ml-2 text-xs text-muted-foreground">{format(new Date(h.created_at), "d MMM yyyy, h:mm a")}</span>{h.note && <p className="mt-1 text-muted-foreground">{h.note}</p>}</li>)}</ol></section>
    </div><aside><form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="sticky top-5 space-y-5 rounded-md border bg-card p-5 shadow-civic"><h2 className="font-bold">Review & publish</h2>
      <Field label="Status"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus)}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{bi(STATUSES[s], lang)}</option>)}</select></Field>
      <Field label="Status note"><Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} placeholder="Optional internal context" /></Field>
      {canModerate && <><Field label="Moderation"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={moderation} onChange={(e) => setModeration(e.target.value as ModerationStatus)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></Field>
      <Field label="Assign to"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Unassigned</option>{d.team.map((m) => <option key={m.id} value={m.id}>{m.display_name} · {m.role}</option>)}</select></Field>
      <Field label="Public title"><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></Field><Field label="Sanitized public summary"><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} maxLength={1000} /></Field>
      <label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={publish} onCheckedChange={(v) => setPublish(v === true)} /> Publish to Community Board</label></>}
      <Button type="submit" className="w-full" disabled={save.isPending}><Save /> Save changes</Button>{publish && <Button asChild variant="outline" className="w-full"><Link to="/track" search={{ id: d.submission.public_id ?? "" }}><ExternalLink /> View public tracking</Link></Button>}
    </form></aside></div></main></TeamShell>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 capitalize">{value.replaceAll("_", " ")}</dd></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
function NoteForm({ busy, onAdd }: { busy: boolean; onAdd: (body: string, isPublic: boolean) => void }) { const [body, setBody] = useState(""); const [isPublic, setPublic] = useState(false); function submit(e: FormEvent) { e.preventDefault(); if (!body.trim()) return; onAdd(body, isPublic); setBody(""); } return <form onSubmit={submit} className="mt-4 space-y-3"><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a team note or public update" required minLength={2} /><label className="flex items-center gap-2 text-sm"><Checkbox checked={isPublic} onCheckedChange={(v) => setPublic(v === true)} /> Visible on public tracking</label><Button type="submit" variant="secondary" disabled={busy}>Add note</Button></form>; }
