import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";

export function TeamShell({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return <div className="min-h-screen bg-muted/40">
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary-deep"><ShieldCheck className="size-5" /> Thogudhi Inai Team</Link>
        <div className="ml-auto flex items-center gap-2"><LanguageToggle /><Button variant="ghost" size="sm" onClick={signOut}><LogOut />{t("signOut")}</Button></div>
      </div>
    </header>
    {children}
  </div>;
}
