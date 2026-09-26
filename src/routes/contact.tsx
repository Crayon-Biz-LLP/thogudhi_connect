import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageSquareText } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
export const Route = createFileRoute("/contact")({ head: () => ({ meta: [
  { title: "Contact — Thogudhi Inai" }, { name: "description", content: "Contact the Thogudhi Inai community team or make a local submission." }, { property: "og:title", content: "Contact — Thogudhi Inai" }, { property: "og:description", content: "Contact the Thogudhi Inai community team." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
]}), component: Page });
function Page() { const { lang } = useLang(); const ta = lang === "ta"; return <PublicLayout><PageHeader title={ta ? "தொடர்பு" : "Contact"} intro={ta ? "உள்ளூர் விஷயத்தைப் பகிர அல்லது ஏற்கெனவே செய்த சமர்ப்பிப்பைப் பின்தொடர கீழே தேர்வு செய்யவும்." : "Choose the right path to share a local matter or follow an existing submission."} />
  <div className="mx-auto grid max-w-4xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6"><section className="rounded-md border bg-card p-6"><MessageSquareText className="size-7 text-primary" /><h2 className="mt-4 text-xl font-bold">{ta ? "புதிய சமர்ப்பிப்பு" : "Make a submission"}</h2><p className="mt-2 text-sm text-muted-foreground">{ta ? "பிரச்சினை, கேள்வி, யோசனை அல்லது கருத்தைப் பகிருங்கள்." : "Report an issue, ask a question, or share an idea or view."}</p><Button asChild className="mt-5"><Link to="/submit">{ta ? "தொடங்கு" : "Get started"}</Link></Button></section>
  <section className="rounded-md border bg-card p-6"><Mail className="size-7 text-primary" /><h2 className="mt-4 text-xl font-bold">{ta ? "நிலை அறிய" : "Track progress"}</h2><p className="mt-2 text-sm text-muted-foreground">{ta ? "உங்கள் குறிப்பு எண் மற்றும் தனிப்பட்ட குறியீட்டைப் பயன்படுத்தவும்." : "Use your reference ID and private tracking code."}</p><Button asChild variant="secondary" className="mt-5"><Link to="/track">{ta ? "நிலை அறிய" : "Track submission"}</Link></Button></section></div>
</PublicLayout>; }
