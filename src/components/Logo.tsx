interface LogoIconProps {
  size?: number
}

export function LogoIcon({ size = 40 }: LogoIconProps) {
  const h = Math.round(size * 1.3)
  return (
    <svg width={size} height={h} viewBox="0 0 42 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coral pin shape */}
      <path
        d="M21 2C10.61 2 2 10.61 2 21C2 34 21 52 21 52C21 52 40 34 40 21C40 10.61 31.39 2 21 2Z"
        fill="#ff6b52"
      />
      {/* White P — vertical stroke */}
      <rect x="11" y="10" width="6" height="22" rx="3" fill="white" />
      {/* White P — bowl (right semicircle) */}
      <path d="M17 10 L22 10 A9 9 0 0 1 22 28 L17 28 Z" fill="white" />
      {/* Coral hole inside bowl */}
      <circle cx="22" cy="19" r="5" fill="#ff6b52" />
    </svg>
  )
}

export default function PlaneappLogo({
  size = 32,
  showText = true,
  className = "",
}: {
  size?: number
  showText?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className="font-extrabold text-[#111c2d] text-lg tracking-tight">
          plane<span className="text-[#ff6b52]">app</span>
        </span>
      )}
    </div>
  )
}
