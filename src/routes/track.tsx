import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { StatusBadge, TypeBadge, CategoryLabel, DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { trackSubmission } from "@/lib/submissions.functions";
import { PUBLIC_ID_RE, STATUSES, bi } from "@/lib/constants";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string; token?: string } => ({
    ...(typeof s["id"] === "string" ? { id: s["id"] } : {}),
    ...(typeof s["token"] === "string" ? { token: s["token"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Track a submission — Thogudhi Inai" },
      { name: "description", content: "Enter your WTL-TL reference ID to see the current status of your submission." },
      { property: "og:title", content: "Track a submission — Thogudhi Inai" },
      { property: "og:description", content: "Check the status of your submission using your reference ID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t, lang } = useLang();
  const { id: initial, token: initialToken } = Route.useSearch();
  const track = useServerFn(trackSubmission);
  const [input, setInput] = useState(initial ?? "");
  const [tokenInput, setTokenInput] = useState(initialToken ?? "");
  const [query, setQuery] = useState(initial?.toUpperCase() ?? "");
  const [token, setToken] = useState(initialToken ?? "");

  const q = useQuery({
    queryKey: ["track", query, token],
    queryFn: () => track({ data: { publicId: query, trackingToken: token } }),
    enabled: PUBLIC_ID_RE.test(query) && /^[0-9a-f-]{36}$/i.test(token),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setQuery(input.trim().toUpperCase());
    setToken(tokenInput.trim());
  }

  const invalid = Boolean(query && (!PUBLIC_ID_RE.test(query) || !/^[0-9a-f-]{36}$/i.test(token)));

  return (
    <PublicLayout>
      <PageHeader title={t("trackTitle")} intro={t("trackIntro")} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="WTL-TL-2026-0001"
            className="h-11 font-mono uppercase"
            aria-label={t("trackTitle")}
          />
          <Input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder={t("trackCodePh")} className="h-11 font-mono" aria-label={t("trackCode")} />
          <Button type="submit" size="lg" className="h-11">{t("trackBtn")}</Button>
        </form>

        {(invalid || (q.isFetched && q.data === null)) && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{t("trackNotFound")}</p>
        )}

        {q.data && (
          <div className="mt-8 space-y-6 animate-rise">
            <div className="rounded-2xl border bg-card p-6 shadow-civic">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={q.data.type} />
                {q.data.isDemo && <DemoBadge />}
                <span className="ml-auto font-mono text-sm font-bold text-primary-deep">{q.data.publicId}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                <CategoryLabel category={q.data.category} /> • {q.data.locality}
              </p>
              {q.data.publicTitle && <p className="mt-2 font-semibold">{q.data.publicTitle}</p>}
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">{t("trackSubmitted")}</dt>
                  <dd className="mt-1 text-sm">{format(new Date(q.data.createdAt), "d MMM yyyy, h:mm a")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">{t("trackStatus")}</dt>
                  <dd className="mt-1"><StatusBadge status={q.data.status} /></dd>
                </div>
              </dl>
              {q.data.publicTitle && <p className="mt-4 text-xs text-success">{t("trackPublic")}</p>}
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-bold">{t("trackTimeline")}</h2>
              <ol className="mt-4 space-y-3 border-l-2 border-primary/20 pl-4">
                {q.data.history.map((h, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[23px] top-1.5 size-3 rounded-full bg-primary" />
                    <span className="font-semibold">{bi(STATUSES[h.to_status], lang)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{format(new Date(h.created_at), "d MMM yyyy")}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-bold">{t("trackUpdates")}</h2>
              {q.data.publicNotes.length ? (
                <ul className="mt-3 space-y-3">
                  {q.data.publicNotes.map((n, i) => (
                    <li key={i} className="rounded-lg bg-secondary/50 p-3 text-sm">
                      <p>{n.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{format(new Date(n.created_at), "d MMM yyyy")}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t("trackNoUpdates")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
