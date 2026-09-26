import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="civic-pattern border-b">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{intro}</p>}
      </div>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-[15px] leading-relaxed sm:px-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary-deep [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
      {children}
    </article>
  );
}
