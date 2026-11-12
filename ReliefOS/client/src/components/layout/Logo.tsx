export function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="4" y1="6" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M24 41.5 8.6 26.4A9.8 9.8 0 0 1 22.5 12.6L24 14.1l1.5-1.5a9.8 9.8 0 0 1 13.9 13.8Z"
        fill="url(#logo-grad)"
        opacity="0.95"
      />
      <path
        d="M10 26h7.2l2.6-5.4 4.4 10 3-6.2H38"
        stroke="#e0f2fe"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
