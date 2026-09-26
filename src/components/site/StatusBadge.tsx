import { useLang } from "@/lib/i18n";
import { STATUSES, STATUS_TONE, TYPES, CATEGORIES, bi, type SubmissionStatus, type SubmissionType, type SubmissionCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  const { lang } = useLang();
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_TONE[status], className)}>
      {bi(STATUSES[status], lang)}
    </span>
  );
}

export function TypeBadge({ type }: { type: SubmissionType }) {
  const { lang } = useLang();
  return (
    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
      {bi(TYPES[type], lang)}
    </span>
  );
}

export function CategoryLabel({ category }: { category: SubmissionCategory }) {
  const { lang } = useLang();
  return <span>{bi(CATEGORIES[category], lang)}</span>;
}

export function DemoBadge() {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center rounded-md bg-marigold px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-marigold-foreground">
      {t("demo")}
    </span>
  );
}
