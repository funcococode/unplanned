import { MapPin } from 'lucide-react';

interface Day {
  dayNumber: number;
  title: string;
  date: string | null;
}

interface Props {
  days: Day[];
}

export function ItineraryRouteMap({ days }: Props) {
  if (days.length === 0) return null;

  const W      = 240;
  const STOP_H = 68;
  const TOP_PAD = 20;
  const BOT_PAD = 20;
  const H      = TOP_PAD + days.length * STOP_H + BOT_PAD;
  const LX     = 48;
  const RX     = W - 48;
  const R      = 13;

  const pts = days.map((day, i) => ({
    x: i % 2 === 0 ? LX : RX,
    y: TOP_PAD + i * STOP_H + STOP_H / 2,
    day,
  }));

  const pathD = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev  = pts[i - 1];
    const midY  = (prev.y + pt.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${pt.x} ${midY}, ${pt.x} ${pt.y}`;
  }, '');

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('default', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl overflow-hidden">
      {/* Header — matches PersonalPacking */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-950/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-zinc-950 dark:text-white">Route Overview</span>
          <span className="ml-auto text-[10px] text-zinc-950/55 dark:text-white/40">
            {days.length} day{days.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* SVG map */}
      <div className="px-2 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="route-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#F3F4F6" />
            </pattern>
            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dot grid background */}
          <rect width={W} height={H} fill="url(#route-dots)" rx="8" />

          {/* Glow path */}
          {pts.length > 1 && (
            <path d={pathD} stroke="#FB923C" strokeWidth="8" fill="none"
              strokeLinecap="round" opacity="0.12" filter="url(#route-glow)" />
          )}

          {/* Dashed route path */}
          {pts.length > 1 && (
            <path d={pathD} stroke="#F97316" strokeWidth="2" fill="none"
              strokeLinecap="round" strokeDasharray="4 4" opacity="0.8" />
          )}

          {/* Stops */}
          {pts.map(({ x, y, day }, i) => {
            const isLeft  = i % 2 === 0;
            const labelX  = isLeft ? x + R + 7 : x - R - 7;
            const anchor  = isLeft ? 'start' : 'end';
            const date    = formatDate(day.date);
            const isFirst = i === 0;
            const isLast  = i === pts.length - 1;
            const title   = day.title.length > 13 ? day.title.slice(0, 12) + '…' : day.title;

            return (
              <g key={day.dayNumber}>
                {/* Outer glow ring */}
                <circle cx={x} cy={y} r={R + 3} fill="#F97316" opacity="0.1" />
                {/* Circle */}
                <circle cx={x} cy={y} r={R}
                  fill={isFirst ? '#111827' : isLast ? '#F97316' : '#F97316'}
                  opacity={isFirst || isLast ? 1 : 0.9}
                />
                {/* Day number */}
                <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="700" fill="white"
                  fontFamily="system-ui, -apple-system, sans-serif">
                  {day.dayNumber}
                </text>
                {/* Title */}
                <text x={labelX} y={date ? y - 5 : y + 0.5}
                  textAnchor={anchor} dominantBaseline="middle"
                  fontSize="10" fontWeight="600" fill="#111827"
                  fontFamily="system-ui, -apple-system, sans-serif">
                  {title}
                </text>
                {/* Date */}
                {date && (
                  <text x={labelX} y={y + 8}
                    textAnchor={anchor} dominantBaseline="middle"
                    fontSize="8.5" fill="#9CA3AF"
                    fontFamily="system-ui, -apple-system, sans-serif">
                    {date}
                  </text>
                )}
                {/* Start / end marker */}
                {isFirst && (
                  <text x={x} y={y - R - 5} textAnchor="middle" fontSize="10">🚩</text>
                )}
                {isLast && pts.length > 1 && (
                  <text x={x} y={y + R + 13} textAnchor="middle" fontSize="10">🏁</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
