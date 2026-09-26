import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/submitted/$publicId")({
  validateSearch: (search: Record<string, unknown>): { token?: string } =>
    typeof search["token"] === "string" ? { token: search["token"] } : {},
  head: () => ({
    meta: [
      { title: "Submission received — Thogudhi Inai" },
      { name: "description", content: "Your submission has been received. Keep your reference ID to track progress." },
      { property: "og:title", content: "Submission received — Thogudhi Inai" },
      { property: "og:description", content: "Keep your reference ID to track progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { publicId } = Route.useParams();
  const { token } = Route.useSearch();
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h1 className="mt-4 text-3xl font-extrabold text-primary-deep">{t("confTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("confBody")}</p>

        <div className="mt-8 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-6 shadow-civic">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("confRef")}</p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-primary-deep sm:text-3xl">{publicId}</p>
          {token && <><p className="mt-5 text-xs font-semibold uppercase text-muted-foreground">{t("confPrivateCode")}</p><p className="mt-2 break-all font-mono text-sm font-bold text-foreground">{token}</p></>}
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={async () => {
               await navigator.clipboard.writeText(token ? `${publicId}\n${token}` : publicId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Copy /> {copied ? t("confCopied") : t("confCopy")}
          </Button>
        </div>

        <div className="mt-8 rounded-2xl bg-secondary/50 p-6 text-left">
          <h2 className="font-bold">{t("confNext")}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>{t("confNext1")}</li>
            <li>{t("confNext2")}</li>
            <li>{t("confNext3")}</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/track" search={token ? { id: publicId, token } : { id: publicId }}>{t("confTrack")}</Link></Button>
          <Button asChild variant="outline"><Link to="/submit">{t("confAnother")}</Link></Button>
        </div>
      </div>
    </PublicLayout>
  );
}
