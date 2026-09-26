import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HelpCircle, Lightbulb, MessageSquare, ArrowRight, Search } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { StatusBadge, TypeBadge, CategoryLabel, DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thogudhi Inai | தொகுதி இணை — Thousand Lights Community Platform" },
      { name: "description", content: "Report local issues, ask questions and share ideas for Thousand Lights Constituency, Chennai. A neutral community initiative of We The Leaders." },
      { property: "og:title", content: "Thogudhi Inai | தொகுதி இணை" },
      { property: "og:description", content: "Connecting People • Ideas • Issues • Community — Thousand Lights, Chennai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useLang();
  const recent = useQuery({
    queryKey: ["board", "recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("submission_public")
        .select("id, public_id, type, category, locality, public_title, status, is_demo, submitted_at")
        .eq("is_published", true)
        .order("submitted_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const ctas = [
    { type: "issue", icon: AlertTriangle, title: t("ctaIssue"), desc: t("ctaIssueDesc") },
    { type: "question", icon: HelpCircle, title: t("ctaQuestion"), desc: t("ctaQuestionDesc") },
    { type: "idea", icon: Lightbulb, title: t("ctaIdea"), desc: t("ctaIdeaDesc") },
    { type: "view", icon: MessageSquare, title: t("ctaView"), desc: t("ctaViewDesc") },
  ] as const;

  return (
    <PublicLayout>
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">{t("initiative")}</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{t("heroTitle")}</h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">{t("heroBody")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-marigold text-marigold-foreground hover:bg-marigold/90">
              <Link to="/submit" search={{ type: "issue" }}>{t("ctaIssue")} <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/track"><Search /> {t("trackCta")}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-primary-foreground/60">{t("neutralNote")}</p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ctas.map(({ type, icon: Icon, title, desc }, i) => (
            <Link
              key={type}
              to="/submit"
              search={{ type }}
              className="group animate-rise rounded-2xl border bg-card p-5 shadow-civic transition-all hover:-translate-y-0.5 hover:shadow-civic-lg"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-primary-deep">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">
                {t("navSubmit")} <ArrowRight className="size-4 transition-all" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-extrabold text-primary-deep">{t("howTitle")}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [t("how1T"), t("how1B")],
            [t("how2T"), t("how2B")],
            [t("how3T"), t("how3B")],
          ].map(([h, b], i) => (
            <div key={h} className="relative rounded-2xl border bg-card p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-marigold px-2.5 py-0.5 text-xs font-extrabold text-marigold-foreground">{i + 1}</span>
              <h3 className="text-lg font-bold">{h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-primary-deep">{t("recentTitle")}</h2>
          <Link to="/board" className="text-sm font-semibold text-primary hover:underline">{t("viewAll")} →</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {recent.data?.length ? (
            recent.data.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={r.type} />
                  {r.is_demo && <DemoBadge />}
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{r.public_id}</span>
                </div>
                <h3 className="mt-3 font-bold">{r.public_title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <CategoryLabel category={r.category} /> • {r.locality}
                </p>
                <div className="mt-3"><StatusBadge status={r.status} /></div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              {t("boardEmpty")}
            </div>
          )}
        </div>
        <Button asChild variant="secondary" className="mt-6">
          <Link to="/board">{t("boardCta")}</Link>
        </Button>
        <span className="sr-only">{lang}</span>
      </section>
    </PublicLayout>
  );
}
