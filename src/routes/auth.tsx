import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout, PageHeader } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapTeamAccess } from "@/lib/admin.functions";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Team sign in — Thogudhi Inai" },
    { name: "description", content: "Secure sign in for authorised Thogudhi Inai volunteers and moderators." },
    { property: "og:title", content: "Team sign in — Thogudhi Inai" },
    { property: "og:description", content: "Secure team access for the Thogudhi Inai community platform." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapTeamAccess);
  const [busy, setBusy] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const email = String(fd.get("email"));
      const password = String(fd.get("password"));
      if (createMode) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: String(fd.get("name") ?? "").trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success(t("authCheckEmail"));
          setCreateMode(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const access = await bootstrap();
      if (!access.role) {
        await supabase.auth.signOut();
        throw new Error(t("authNoRole"));
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally { setBusy(false); }
  }
  return <PublicLayout><PageHeader title={t("authTitle")} intro={t("authIntro")} />
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6"><form onSubmit={submit} className="space-y-5 rounded-lg border bg-card p-6 shadow-civic">
      <div className="flex size-11 items-center justify-center rounded-md bg-secondary text-primary"><LockKeyhole /></div>
      {createMode && <div className="space-y-2"><Label htmlFor="name">{t("authName")}</Label><Input id="name" name="name" required maxLength={100} /></div>}
      <div className="space-y-2"><Label htmlFor="email">{t("authEmail")}</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="space-y-2"><Label htmlFor="password">{t("authPassword")}</Label><Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} /></div>
      <Button type="submit" disabled={busy} className="w-full">{busy ? t("fSubmitting") : createMode ? t("authSignUp") : t("authSignIn")}</Button>
      <Button type="button" variant="link" className="w-full" onClick={() => setCreateMode((value) => !value)}>{createMode ? t("authToggleIn") : t("authToggleUp")}</Button>
    </form></div></PublicLayout>;
}
