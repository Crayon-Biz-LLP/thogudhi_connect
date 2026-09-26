import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { LogoSlot } from "./LogoSlot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeMasthead } from "./HomeMasthead";

const NAV = [
  { to: "/", key: "navHome" },
  { to: "/submit", key: "navSubmit" },
  { to: "/track", key: "navTrack" },
  { to: "/board", key: "navBoard" },
  { to: "/about", key: "navAbout" },
  { to: "/contact", key: "navContact" },
] as const;

export function SiteHeader() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const isHome = useRouterState({ select: (state) => state.location.pathname === "/" });

  return (
    <>
      {isHome && <HomeMasthead />}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur kolam-border">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-civic">
            <span className="font-tamil text-lg font-bold leading-none">தொ</span>
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-extrabold tracking-wide text-primary-deep sm:text-base">
              <span className="font-tamil">தொகுதி இணை</span>
              <span className="mx-1.5 text-marigold">|</span>
              THOGUDHI INAI
            </p>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{t("tagline")}</p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <LanguageToggle />
          <LogoSlot />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div className={cn("border-t bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col px-2 py-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {t(n.key)}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"
          >
            {t("navAdmin")}
          </Link>
        </nav>
      </div>
      </header>
    </>
  );
}
