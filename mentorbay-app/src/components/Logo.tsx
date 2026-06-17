// The MentorBay hexagon "M" mark, recreated as inline SVG.
// Pass `light` for use on dark backgrounds (e.g. the footer).
export function Logo({ light = false, className = "h-8 w-8" }: { light?: boolean; className?: string }) {
  const a = light ? "#3bb8d1" : "#1FA2BE";
  const b = light ? "#ffffff" : "#0B2A4A";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="8" r="6" fill={a} />
      <circle cx="55" cy="20" r="6" fill={b} />
      <circle cx="55" cy="44" r="6" fill={a} />
      <circle cx="32" cy="56" r="6" fill={b} />
      <circle cx="9" cy="44" r="6" fill={a} />
      <circle cx="9" cy="20" r="6" fill={b} />
      <text x="32" y="41" textAnchor="middle" fontSize="26" fontWeight="800" fill={b} fontFamily="Inter">M</text>
    </svg>
  );
}

// Logo + wordmark, used in the header.
export function LogoWordmark() {
  return (
    <span className="flex items-center gap-2">
      <Logo className="h-9 w-9" />
      <span className="text-xl font-extrabold text-navy">
        Mentor<span className="text-teal">Bay</span>
      </span>
    </span>
  );
}
