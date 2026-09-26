import mastheadAsset from "@/assets/thogudhi-innai-banner.png.asset.json";

export function HomeMasthead() {
  return (
    <section className="overflow-hidden bg-masthead" aria-label="Thogudhi Inai">
      <img
        src={mastheadAsset.url}
        alt="Thogudhi Inai — Connecting People, Ideas, Issues and Community"
        width={1920}
        height={383}
        className="block h-auto w-full"
      />
    </section>
  );
}