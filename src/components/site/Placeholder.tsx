/**
 * Image slot. Shows the client's photo when given; otherwise an abstract
 * theme-coloured artwork so demo/preview sites never show broken images.
 */
export function Placeholder({ src, alt, seed = 0, className = '' }: { src?: string; alt: string; seed?: number; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`themed-img h-full w-full object-cover ${className}`} />;
  }
  const r = 30 + (seed % 3) * 15;
  return (
    <div role="img" aria-label={alt} className={`relative h-full w-full overflow-hidden bg-surface-alt ${className}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={80 + seed * 37 % 240} cy={90} r={r * 2.4} className="fill-primary" opacity="0.18" />
        <circle cx={300 - seed * 23 % 120} cy={210} r={r * 1.8} className="fill-accent" opacity="0.25" />
        <rect x={40} y={200} width={180} height={12} rx={6} className="fill-primary" opacity="0.2" />
        <rect x={40} y={224} width={120} height={12} rx={6} className="fill-primary" opacity="0.12" />
      </svg>
    </div>
  );
}
