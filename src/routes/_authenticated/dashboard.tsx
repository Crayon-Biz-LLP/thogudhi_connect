import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Clock3, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { TeamShell } from "@/components/site/TeamShell";
import { StatusBadge, TypeBadge, DemoBadge } from "@/components/site/StatusBadge";
import { Input } from "@/components/ui/input";
import { getTeamDashboard } from "@/lib/admin.functions";
import { STATUSES, STATUS_ORDER, bi, type SubmissionStatus } from "@/lib/constants";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Team dashboard — Thogudhi Inai" },
    { name: "description", content: "Authorised team dashboard for reviewing and moderating community submissions." },
    { property: "og:title", content: "Team dashboard — Thogudhi Inai" },
    { property: "og:description", content: "Authorised moderation dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const load = useServerFn(getTeamDashboard);
  const { lang } = useLang();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["team-dashboard"], queryFn: () => load() });
  const rows = useMemo(() => (query.data?.submissions ?? []).filter((row) => {
    const needle = search.trim().toLowerCase();
    return (!status || row.status === status) && (!needle || `${row.public_id} ${row.subject} ${row.locality}`.toLowerCase().includes(needle));
  }), [query.data, search, status]);
  const all = query.data?.submissions ?? [];
  return <TeamShell><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-primary">{query.data?.role ?? "Team"}</p><h1 className="text-3xl font-extrabold text-primary-deep">{lang === "ta" ? "சமர்ப்பிப்புகள்" : "Submissions"}</h1></div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <Metric icon={<ClipboardList />} label={lang === "ta" ? "மொத்தம்" : "Total"} value={all.length} />
      <Metric icon={<Clock3 />} label={lang === "ta" ? "மதிப்பாய்வு நிலுவை" : "Awaiting moderation"} value={all.filter((r) => r.moderation === "pending").length} />
      <Metric icon={<CheckCircle2 />} label={lang === "ta" ? "தீர்க்கப்பட்டது" : "Resolved"} value={all.filter((r) => r.status === "resolved").length} />
    </div>
    <div className="mt-6 flex flex-wrap gap-2 border-y bg-card py-3">
      <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={lang === "ta" ? "எண், தலைப்பு அல்லது பகுதியைத் தேடுக" : "Search ID, subject or locality"} /></div>
      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">{lang === "ta" ? "அனைத்து நிலைகள்" : "All statuses"}</option>{STATUS_ORDER.map((item) => <option key={item} value={item}>{bi(STATUSES[item], lang)}</option>)}</select>
    </div>
    {query.isLoading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : query.isError ? <p className="py-12 text-center text-destructive">{query.error.message}</p> : rows.length === 0 ? <p className="py-12 text-center text-muted-foreground">{lang === "ta" ? "சமர்ப்பிப்புகள் இல்லை." : "No submissions found."}</p> :
      <div className="mt-4 overflow-x-auto rounded-md border bg-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="p-3">Reference</th><th className="p-3">Submission</th><th className="p-3">Area</th><th className="p-3">Status</th><th className="p-3">Moderation</th><th className="p-3">Received</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b last:border-0 hover:bg-accent/40"><td className="p-3"><Link to="/submissions/$id" params={{ id: row.id }} className="font-mono font-bold text-primary hover:underline">{row.public_id}</Link>{row.is_demo && <span className="ml-2"><DemoBadge /></span>}</td><td className="p-3"><TypeBadge type={row.type} /><p className="mt-1 max-w-sm font-semibold">{row.subject}</p></td><td className="p-3">{row.locality}</td><td className="p-3"><StatusBadge status={row.status as SubmissionStatus} /></td><td className="p-3 capitalize">{row.moderation}</td><td className="p-3 text-muted-foreground">{format(new Date(row.created_at), "d MMM yyyy")}</td></tr>)}</tbody></table></div>}
  </main></TeamShell>;
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="flex items-center gap-3 rounded-md border bg-card p-4"><span className="text-primary">{icon}</span><div><p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>; }
