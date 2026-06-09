// ── Hero illustration ──────────────────────────────────────────────────────────
// A floating "trip planning board": destination cards connected by flight paths
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 480" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#00000018" />
        </filter>
      </defs>

      {/* Soft radial glow background */}
      <circle cx="260" cy="240" r="230" fill="url(#hero-glow)" />

      {/* Subtle dot grid */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 9 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={40 + col * 56}
            cy={40 + row * 52}
            r="2"
            fill="#E5E7EB"
            opacity="0.7"
          />
        ))
      )}

      {/* Flight path curves (dashed) */}
      <path d="M 130 310 Q 200 180 320 140" stroke="#F97316" strokeWidth="2" strokeDasharray="6 5" fill="none" strokeLinecap="round" />
      <path d="M 320 140 Q 400 130 420 230" stroke="#F97316" strokeWidth="2" strokeDasharray="6 5" fill="none" strokeLinecap="round" />
      <path d="M 130 310 Q 160 370 270 360" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" />

      {/* ── Card 1: Spiti Valley (top-center) ─────────────────── */}
      <g filter="url(#card-shadow)">
        <rect x="230" y="80" width="168" height="68" rx="16" fill="white" />
        <rect x="230" y="80" width="168" height="68" rx="16" stroke="#F3F4F6" strokeWidth="1" />
        {/* Gradient strip */}
        <rect x="230" y="80" width="168" height="6" rx="3" fill="#8B5CF6" />
        <rect x="237" y="86" width="168" height="6" rx="0" fill="white" />
        {/* Map pin */}
        <circle cx="254" cy="112" r="10" fill="#EDE9FE" />
        <path d="M 254 106 C 250 106 247 109 247 113 C 247 117 254 123 254 123 C 254 123 261 117 261 113 C 261 109 258 106 254 106 Z" fill="#8B5CF6" />
        <circle cx="254" cy="113" r="2.5" fill="white" />
        {/* Text */}
        <rect x="270" y="105" width="70" height="8" rx="4" fill="#1F2937" />
        <rect x="270" y="119" width="50" height="6" rx="3" fill="#9CA3AF" />
        {/* Badge */}
        <rect x="348" y="106" width="38" height="16" rx="8" fill="#EDE9FE" />
        <rect x="353" y="111" width="28" height="5" rx="2.5" fill="#8B5CF6" />
      </g>

      {/* ── Card 2: Goa (left) ────────────────────────────────── */}
      <g filter="url(#card-shadow)">
        <rect x="48" y="258" width="168" height="68" rx="16" fill="white" />
        <rect x="48" y="258" width="168" height="68" rx="16" stroke="#F3F4F6" strokeWidth="1" />
        <rect x="48" y="258" width="168" height="6" rx="3" fill="#F97316" />
        <rect x="48" y="264" width="168" height="6" rx="0" fill="white" />
        <circle cx="72" cy="290" r="10" fill="#FFF7ED" />
        <path d="M 72 284 C 68 284 65 287 65 291 C 65 295 72 301 72 301 C 72 301 79 295 79 291 C 79 287 76 284 72 284 Z" fill="#F97316" />
        <circle cx="72" cy="291" r="2.5" fill="white" />
        <rect x="88" y="283" width="55" height="8" rx="4" fill="#1F2937" />
        <rect x="88" y="297" width="40" height="6" rx="3" fill="#9CA3AF" />
        <rect x="164" y="284" width="38" height="16" rx="8" fill="#FFF7ED" />
        <rect x="169" y="289" width="28" height="5" rx="2.5" fill="#F97316" />
      </g>

      {/* ── Card 3: Andaman (right) ───────────────────────────── */}
      <g filter="url(#card-shadow)">
        <rect x="330" y="196" width="168" height="68" rx="16" fill="white" />
        <rect x="330" y="196" width="168" height="68" rx="16" stroke="#F3F4F6" strokeWidth="1" />
        <rect x="330" y="196" width="168" height="6" rx="3" fill="#0EA5E9" />
        <rect x="330" y="202" width="168" height="6" rx="0" fill="white" />
        <circle cx="354" cy="228" r="10" fill="#E0F2FE" />
        <path d="M 354 222 C 350 222 347 225 347 229 C 347 233 354 239 354 239 C 354 239 361 233 361 229 C 361 225 358 222 354 222 Z" fill="#0EA5E9" />
        <circle cx="354" cy="229" r="2.5" fill="white" />
        <rect x="370" y="221" width="70" height="8" rx="4" fill="#1F2937" />
        <rect x="370" y="235" width="50" height="6" rx="3" fill="#9CA3AF" />
        <rect x="446" y="222" width="38" height="16" rx="8" fill="#E0F2FE" />
        <rect x="451" y="227" width="28" height="5" rx="2.5" fill="#0EA5E9" />
      </g>

      {/* ── Card 4: Kerala (bottom-center) ───────────────────── */}
      <g filter="url(#card-shadow)">
        <rect x="185" y="330" width="148" height="56" rx="16" fill="white" />
        <rect x="185" y="330" width="148" height="56" rx="16" stroke="#F3F4F6" strokeWidth="1" />
        <rect x="185" y="330" width="148" height="5" rx="3" fill="#10B981" />
        <rect x="185" y="335" width="148" height="5" rx="0" fill="white" />
        <circle cx="207" cy="358" r="9" fill="#D1FAE5" />
        <path d="M 207 353 C 204 353 201 356 201 359 C 201 363 207 368 207 368 C 207 368 213 363 213 359 C 213 356 210 353 207 353 Z" fill="#10B981" />
        <circle cx="207" cy="359" r="2" fill="white" />
        <rect x="222" y="351" width="55" height="7" rx="3.5" fill="#1F2937" />
        <rect x="222" y="362" width="40" height="5" rx="2.5" fill="#9CA3AF" />
        <rect x="297" y="352" width="30" height="14" rx="7" fill="#D1FAE5" />
        <rect x="301" y="357" width="22" height="4" rx="2" fill="#10B981" />
      </g>

      {/* ── Plane icon along the Spiti→Andaman route ─────────── */}
      <g transform="translate(278, 152) rotate(-30)">
        <path d="M 0 0 L 14 -5 L 14 5 Z" fill="#F97316" />
        <path d="M 5 -5 L 10 -9 L 12 -7 L 8 -3 Z" fill="#F97316" />
        <path d="M 5 5 L 10 9 L 12 7 L 8 3 Z" fill="#F97316" />
      </g>

      {/* ── Plane icon along the Goa→Kerala route ───────────── */}
      <g transform="translate(192, 338) rotate(20)">
        <path d="M 0 0 L 11 -4 L 11 4 Z" fill="#94A3B8" />
        <path d="M 4 -4 L 8 -7 L 10 -5 L 6 -2 Z" fill="#94A3B8" />
        <path d="M 4 4 L 8 7 L 10 5 L 6 2 Z" fill="#94A3B8" />
      </g>

      {/* ── Avatar cluster (travelers count) ─────────────────── */}
      <g transform="translate(204, 200)">
        <circle cx="0"  cy="0" r="18" fill="white" stroke="white" strokeWidth="2" />
        <circle cx="0"  cy="0" r="18" fill="#FDE68A" />
        <circle cx="0"  cy="-5" r="7" fill="#F59E0B" />
        <path d="M -12 14 Q 0 6 12 14" fill="#F59E0B" />

        <circle cx="26" cy="0" r="18" fill="white" stroke="white" strokeWidth="2" />
        <circle cx="26" cy="0" r="18" fill="#BAE6FD" />
        <circle cx="26" cy="-5" r="7" fill="#0EA5E9" />
        <path d="M 14 14 Q 26 6 38 14" fill="#0EA5E9" />

        <circle cx="52" cy="0" r="18" fill="white" stroke="white" strokeWidth="2" />
        <circle cx="52" cy="0" r="18" fill="#D1FAE5" />
        <circle cx="52" cy="-5" r="7" fill="#10B981" />
        <path d="M 40 14 Q 52 6 64 14" fill="#10B981" />

        <rect x="72" y="-14" width="36" height="28" rx="14" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="80" y="-5" width="20" height="6" rx="3" fill="#F97316" />
        <rect x="82" y="4" width="12" height="4" rx="2" fill="#9CA3AF" />
      </g>

      {/* Decorative floating dots */}
      <circle cx="90" cy="160" r="6" fill="#F97316" opacity="0.3" />
      <circle cx="90" cy="160" r="3" fill="#F97316" opacity="0.6" />
      <circle cx="440" cy="320" r="5" fill="#8B5CF6" opacity="0.3" />
      <circle cx="440" cy="320" r="2.5" fill="#8B5CF6" opacity="0.6" />
      <circle cx="160" cy="200" r="4" fill="#0EA5E9" opacity="0.3" />
      <circle cx="160" cy="200" r="2" fill="#0EA5E9" opacity="0.6" />
      <circle cx="470" cy="150" r="7" fill="#10B981" opacity="0.2" />
      <circle cx="470" cy="150" r="3.5" fill="#10B981" opacity="0.5" />
    </svg>
  );
}

// ── Step 1: Create a Trip ──────────────────────────────────────────────────────
export function PlanIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="20" y="16" width="80" height="90" rx="12" fill="#FFF7ED" />
      <rect x="20" y="16" width="80" height="90" rx="12" stroke="#FED7AA" strokeWidth="1.5" />
      {/* Lines */}
      <rect x="34" y="38" width="52" height="6" rx="3" fill="#FED7AA" />
      <rect x="34" y="50" width="38" height="6" rx="3" fill="#FED7AA" />
      <rect x="34" y="66" width="52" height="6" rx="3" fill="#FED7AA" />
      <rect x="34" y="78" width="30" height="6" rx="3" fill="#FED7AA" />
      {/* Pin */}
      <circle cx="78" cy="24" r="16" fill="#F97316" />
      <path d="M 78 16 C 73 16 69 20 69 25 C 69 31 78 38 78 38 C 78 38 87 31 87 25 C 87 20 83 16 78 16 Z" fill="white" />
      <circle cx="78" cy="25" r="4" fill="#F97316" />
    </svg>
  );
}

// ── Step 2: Find Companions ────────────────────────────────────────────────────
export function ConnectIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Connection lines */}
      <line x1="38" y1="55" x2="60" y2="72" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="82" y1="55" x2="60" y2="72" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 3" />
      {/* Avatar 1 */}
      <circle cx="30" cy="44" r="22" fill="#EDE9FE" />
      <circle cx="30" cy="40" r="9" fill="#8B5CF6" />
      <path d="M 12 60 Q 30 50 48 60" fill="#8B5CF6" />
      {/* Avatar 2 */}
      <circle cx="90" cy="44" r="22" fill="#E0F2FE" />
      <circle cx="90" cy="40" r="9" fill="#0EA5E9" />
      <path d="M 72 60 Q 90 50 108 60" fill="#0EA5E9" />
      {/* Center match badge */}
      <circle cx="60" cy="76" r="18" fill="#F97316" />
      <path d="M 52 76 L 58 82 L 68 70" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Step 3: Travel Together ────────────────────────────────────────────────────
export function AdventureIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Sky */}
      <rect x="10" y="10" width="100" height="100" rx="20" fill="#E0F2FE" />
      {/* Sun */}
      <circle cx="88" cy="30" r="14" fill="#FDE68A" />
      <circle cx="88" cy="30" r="10" fill="#FCD34D" />
      {/* Mountain back */}
      <polygon points="10,100 50,38 90,100" fill="#A78BFA" />
      {/* Snow cap */}
      <polygon points="50,38 42,58 58,58" fill="white" />
      {/* Mountain front */}
      <polygon points="50,100 80,52 110,100" fill="#8B5CF6" />
      <polygon points="80,52 73,68 87,68" fill="white" />
      {/* Ground */}
      <rect x="10" y="96" width="100" height="14" rx="4" fill="#34D399" />
      {/* Path */}
      <path d="M 30 110 Q 50 90 60 70" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Flag at peak */}
      <line x1="80" y1="52" x2="80" y2="38" stroke="#1F2937" strokeWidth="2" />
      <polygon points="80,38 92,42 80,46" fill="#F97316" />
    </svg>
  );
}
