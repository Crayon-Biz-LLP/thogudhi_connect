import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { StatusBadge, TypeBadge, CategoryLabel, DemoBadge } from "@/components/site/StatusBadge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { TYPES, TYPE_ORDER, CATEGORIES, CATEGORY_ORDER, STATUSES, STATUS_ORDER, bi } from "@/lib/constants";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Community Board — Thogudhi Inai" },
      { name: "description", content: "Moderated, sanitized summaries of issues, questions, ideas and views raised by residents of Thousand Lights." },
      { property: "og:title", content: "Community Board — Thogudhi Inai" },
      { property: "og:description", content: "What residents of Thousand Lights are raising together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BoardPage,
});

const selectCls = "h-9 rounded-md border border-input bg-card px-2 text-sm shadow-sm";

function BoardPage() {
  const { t, lang } = useLang();
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: ["board", type, category, status],
    queryFn: async () => {
      let qb = supabase
        .from("submission_public")
        .select("id, public_id, type, category, locality, ward, public_title, public_summary, status, is_demo, submitted_at")
        .eq("is_published", true)
        .order("submitted_at", { ascending: false })
        .limit(200);
      if (type) qb = qb.eq("type", type as never);
      if (category) qb = qb.eq("category", category as never);
      if (status) qb = qb.eq("status", status as never);
      const { data, error } = await qb;
      if (error) throw error;
      return data;
    },
  });

  const s = search.trim().toLowerCase();
  const rows = (q.data ?? []).filter(
    (r) => !s || r.public_title.toLowerCase().includes(s) || r.locality.toLowerCase().includes(s) || r.public_id.toLowerCase().includes(s),
  );

  return (
    <PublicLayout>
      <PageHeader title={t("boardTitle")} intro={t("boardIntro")} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPh")} className="h-9 min-w-[200px] flex-1" aria-label={t("search")} />
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls} aria-label={t("filterType")}>
            <option value="">{t("filterType")}: {t("filterAll")}</option>
            {TYPE_ORDER.map((v) => <option key={v} value={v}>{bi(TYPES[v], lang)}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls} aria-label={t("filterCategory")}>
            <option value="">{t("filterCategory")}: {t("filterAll")}</option>
            {CATEGORY_ORDER.map((v) => <option key={v} value={v}>{bi(CATEGORIES[v], lang)}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label={t("filterStatus")}>
            <option value="">{t("filterStatus")}: {t("filterAll")}</option>
            {STATUS_ORDER.map((v) => <option key={v} value={v}>{bi(STATUSES[v], lang)}</option>)}
          </select>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{rows.length} {t("results")}</p>

        {rows.length === 0 && !q.isLoading && (
          <div className="mt-6 rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">{t("boardEmpty")}</div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <article key={r.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-civic">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={r.type} />
                {r.is_demo && <DemoBadge />}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{r.public_id}</span>
              </div>
              <h2 className="mt-3 font-bold leading-snug">{r.public_title}</h2>
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{r.public_summary}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                <CategoryLabel category={r.category} /> • {r.locality}{r.ward ? ` • Ward ${r.ward}` : ""}
              </p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <StatusBadge status={r.status} />
                <span className="text-xs text-muted-foreground">{format(new Date(r.submitted_at), "d MMM yyyy")}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
