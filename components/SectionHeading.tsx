import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ title, subtitle, href, linkLabel }: Props) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
      <div>
        <h2 className="font-display text-lg font-extrabold text-ink sm:text-2xl lg:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-xs font-semibold text-brand-700 hover:text-brand-800 sm:text-sm"
        >
          {linkLabel ?? "Voir tout"} →
        </Link>
      )}
    </div>
  );
}
