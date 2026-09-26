import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-extrabold">
            <span className="font-tamil">தொகுதி இணை</span> <span className="text-marigold">|</span> THOGUDHI INAI
          </p>
          <p className="mt-1 text-sm text-primary-foreground/70">{t("tagline")}</p>
          <p className="mt-3 text-xs text-primary-foreground/60">{t("initiative")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-marigold">{t("footerLinks")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/submit" className="hover:underline">{t("navSubmit")}</Link></li>
            <li><Link to="/track" className="hover:underline">{t("navTrack")}</Link></li>
            <li><Link to="/board" className="hover:underline">{t("navBoard")}</Link></li>
            <li><Link to="/about" className="hover:underline">{t("navAbout")}</Link></li>
            <li><Link to="/contact" className="hover:underline">{t("navContact")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-marigold">{t("footerPolicies")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:underline">{t("navPrivacy")}</Link></li>
            <li><Link to="/guidelines" className="hover:underline">{t("navGuidelines")}</Link></li>
            <li><Link to="/auth" className="text-primary-foreground/60 hover:underline">{t("navAdmin")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-primary-foreground/70 sm:px-6">
          {t("footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}
