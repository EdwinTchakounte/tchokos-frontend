function Star({ fill }: { fill: number }) {
  // fill: 0 → vide, 1 → pleine, 0.5 → demie
  const id = `s${Math.random().toString(36).slice(2)}`;
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
          <stop offset={`${fill * 100}%`} stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.6 7.7l5.8-.8z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${value} sur 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return <Star key={i} fill={fill} />;
      })}
    </div>
  );
}
