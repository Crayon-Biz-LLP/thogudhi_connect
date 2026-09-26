import { useLang } from "@/lib/i18n";

/**
 * Reserved position for the official We The Leaders logo (top right).
 * Replace the placeholder below with an <img> once the logo is uploaded.
 */
export function LogoSlot() {
  const { t } = useLang();
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/40 bg-secondary/60 text-[9px] font-semibold uppercase leading-tight tracking-wide text-primary/70 sm:size-11"
      title={t("logoPlaceholder")}
      aria-label={t("logoPlaceholder")}
    >
      <span className="text-center">
        WTL
        <br />
        logo
      </span>
    </div>
  );
}
