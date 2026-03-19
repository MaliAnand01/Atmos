import { Link } from "react-router-dom";

// Atmos brand logo — inline SVG / wordmark
export default function AtmosLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: { ring: 16, text: "text-xs tracking-[0.2em]" },
    md: { ring: 22, text: "text-sm tracking-[0.25em]" },
    lg: { ring: 32, text: "text-lg tracking-[0.3em]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
      {/* Ring mark */}
      <svg
        width={s.ring}
        height={s.ring}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="16" cy="16" r="14" stroke="url(#atmGrad)" strokeWidth="1.5" opacity="0.6" />
        {/* Mid ring */}
        <circle cx="16" cy="16" r="9" stroke="url(#atmGrad)" strokeWidth="1.5" opacity="0.8" />
        {/* Core dot */}
        <circle cx="16" cy="16" r="3.5" fill="url(#atmGrad)" />
        {/* Gradient def */}
        <defs>
          <linearGradient id="atmGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#FF007F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span
        className={`font-display font-bold uppercase ${s.text} text-transparent bg-clip-text bg-gradient-to-r from-chill-blue via-purple-400 to-energy-pink`}
      >
        Atmos
      </span>
    </Link>
  );
}
