import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ title, subtitle, href, linkLabel }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {linkLabel ?? "Voir tout"} →
        </Link>
      )}
    </div>
  );
}
