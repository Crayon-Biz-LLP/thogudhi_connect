import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLang } from "@/lib/i18n";
import { TYPES, TYPE_ORDER, CATEGORIES, CATEGORY_ORDER, CONTACT_METHODS, bi, type SubmissionType } from "@/lib/constants";
import { createSubmission } from "@/lib/submissions.functions";
import { cn } from "@/lib/utils";

const TYPE_SET = new Set(TYPE_ORDER);

export const Route = createFileRoute("/submit")({
  validateSearch: (s: Record<string, unknown>): { type?: SubmissionType } =>
    TYPE_SET.has(s["type"] as SubmissionType) ? { type: s["type"] as SubmissionType } : {},
  head: () => ({
    meta: [
      { title: "Make a submission — Thogudhi Inai" },
      { name: "description", content: "Report an issue, ask a question, share an idea or your view about Thousand Lights Constituency." },
      { property: "og:title", content: "Make a submission — Thogudhi Inai" },
      { property: "og:description", content: "Report an issue, ask a question, share an idea or your view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitPage,
});

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function SubmitPage() {
  const { t, lang } = useLang();
  const { type: initialType } = Route.useSearch();
  const navigate = useNavigate();
  const submit = useServerFn(createSubmission);
  const [type, setType] = useState<SubmissionType>(initialType ?? "issue");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent || busy) return;
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    fd.set("consent", "true");
    const img = fd.get("image");
    if (img instanceof File && img.size > 5 * 1024 * 1024) {
      toast.error(t("fImageHint"));
      return;
    }
    setBusy(true);
    try {
      const res = await submit({ data: fd });
      navigate({ to: "/submitted/$publicId", params: { publicId: res.publicId }, search: { token: res.trackingToken } });
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t("fError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicLayout>
      <PageHeader title={t("formTitle")} intro={t("formIntro")} />
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{t("fType")} *</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPE_ORDER.map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                aria-pressed={type === tp}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                  type === tp ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                )}
              >
                {bi(TYPES[tp], lang)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fName")} optional={t("fOptional")}>
            <Input name="name" maxLength={100} autoComplete="name" />
          </Field>
          <Field label={t("fLocality")} required>
            <Input name="locality" required minLength={2} maxLength={120} placeholder={t("fLocalityPh")} />
          </Field>
          <Field label={t("fWard")} optional={t("fOptional")}>
            <Input name="ward" maxLength={20} inputMode="numeric" />
          </Field>
          <Field label={t("fCategory")} required>
            <select name="category" required className={selectCls} defaultValue="">
              <option value="" disabled>{t("fSelect")}</option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>{bi(CATEGORIES[c], lang)}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t("fSubject")} required>
          <Input name="subject" required minLength={5} maxLength={150} placeholder={t("fSubjectPh")} />
        </Field>
        <Field label={t("fDescription")} required>
          <Textarea name="description" required minLength={20} maxLength={3000} rows={6} placeholder={t("fDescriptionPh")} />
        </Field>
        <Field label={t("fLandmark")} optional={t("fOptional")}>
          <Input name="landmark" maxLength={200} placeholder={t("fLandmarkPh")} />
        </Field>
        <Field label={t("fImage")} optional={t("fOptional")} hint={t("fImageHint")}>
          <Input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-semibold" />
        </Field>

        <div className="rounded-2xl border bg-secondary/40 p-5">
          <p className="text-sm font-semibold">{t("fPrivacyNote")}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={t("fPhone")} optional={t("fOptional")}>
              <Input name="phone" type="tel" maxLength={20} autoComplete="tel" />
            </Field>
            <Field label={t("fEmail")} optional={t("fOptional")}>
              <Input name="email" type="email" maxLength={255} autoComplete="email" />
            </Field>
            <Field label={t("fContact")}>
              <select name="preferred_contact" className={selectCls} defaultValue="none">
                {(Object.keys(CONTACT_METHODS) as (keyof typeof CONTACT_METHODS)[]).map((m) => (
                  <option key={m} value={m}>{bi(CONTACT_METHODS[m], lang)}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <span>
            {t("fConsent")}{" "}
            <Link to="/guidelines" className="text-primary underline">{t("navGuidelines")}</Link> ·{" "}
            <Link to="/privacy" className="text-primary underline">{t("navPrivacy")}</Link>
          </span>
        </label>

        <Button type="submit" size="lg" disabled={!consent || busy} className="w-full sm:w-auto">
          {busy ? t("fSubmitting") : t("fSubmit")}
        </Button>
      </form>
    </PublicLayout>
  );
}

function Field({ label, required, optional, hint, children }: { label: string; required?: boolean; optional?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">
        {label} {required && "*"}
        {optional && <span className="ml-1 font-normal text-muted-foreground">({optional})</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
