import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PageHeader, Prose } from "@/components/site/PublicLayout";
import { useLang } from "@/lib/i18n";
export const Route = createFileRoute("/guidelines")({ head: () => ({ meta: [
  { title: "Community Guidelines — Thogudhi Inai" }, { name: "description", content: "Guidelines for constructive and safe participation on Thogudhi Inai." }, { property: "og:title", content: "Community Guidelines — Thogudhi Inai" }, { property: "og:description", content: "Guidelines for constructive and safe participation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
]}), component: Page });
function Page() { const { lang } = useLang(); const ta = lang === "ta"; return <PublicLayout><PageHeader title={ta ? "சமூக வழிகாட்டுதல்கள்" : "Community Guidelines"} intro={ta ? "மரியாதையான, பயனுள்ள சமூக உரையாடலுக்கான விதிகள்." : "Standards for respectful, useful community participation."} /><Prose>
  <h2>{ta ? "செய்ய வேண்டியவை" : "Please do"}</h2><ul><li>{ta ? "தெளிவான, உண்மையான மற்றும் உள்ளூர் சமூகத்துடன் தொடர்புடைய தகவலைப் பகிரவும்." : "Share clear, truthful information relevant to the local community."}</li><li>{ta ? "பிறரின் தனியுரிமையை மதித்து, தேவையற்ற தனிப்பட்ட தகவலைத் தவிர்க்கவும்." : "Respect others’ privacy and avoid unnecessary personal information."}</li><li>{ta ? "மரியாதையான மொழியைப் பயன்படுத்தவும்." : "Use respectful language."}</li></ul>
  <h2>{ta ? "அனுமதிக்கப்படாதவை" : "Not permitted"}</h2><ul><li>{ta ? "அச்சுறுத்தல், வெறுப்புப் பேச்சு, துன்புறுத்தல் அல்லது பாகுபாடு." : "Threats, hate speech, harassment or discrimination."}</li><li>{ta ? "அறிந்தே தவறான தகவல், வேறொருவரைப் போல நடிப்பது அல்லது மீண்டும் மீண்டும் அனுப்பும் தேவையற்ற பதிவுகள்." : "Knowingly false information, impersonation or repeated spam."}</li><li>{ta ? "கட்சி அரசியல் பிரச்சாரம், வேட்பாளர் ஆதரவு அல்லது எதிர்ப்பு." : "Party-political campaigning or candidate advocacy."}</li></ul>
  <p>{ta ? "இந்த வழிகாட்டுதல்களை மீறும் சமர்ப்பிப்புகள் பொதுவில் வெளியிடப்படாமல் இருக்கலாம்." : "Submissions that breach these guidelines may not be published."}</p>
</Prose></PublicLayout>; }
