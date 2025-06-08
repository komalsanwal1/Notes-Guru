
import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 group ml-2" aria-label="NotesGuru Home">
    <svg
      width="32"
      height="32"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a"/>
          <stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>
      </defs>

      {/* Outer circular frame */}
      <circle cx="100" cy="100" r="96" fill="url(#grad)" stroke="#93C5FD" strokeWidth="4"/>

      {/* Open Book */}
      <path d="M60 65C60 60 65 57 70 57H100V143H70C65 143 60 140 60 135V65Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2"/>
      <path d="M140 65C140 60 135 57 130 57H100V143H130C135 143 140 140 140 135V65Z" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="2"/>

      {/* Katana (Ninja Sword) */}
      <line x1="60" y1="40" x2="145" y2="165" stroke="#FACC15" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="60" cy="40" r="5" fill="#FBBF24"/>
      <rect x="140" y="160" width="8" height="8" fill="#111827" transform="rotate(45 140 160)" rx="1"/>

      {/* Sparkle AI stars */}
      <path d="M160 50L164 58L160 66L156 58Z" fill="#E0F2FE"/>
      <circle cx="48" cy="148" r="3" fill="#E0F2FE"/>
    </svg>
    <span className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors duration-300">
      NotesGuru
    </span>
  </Link>
);

export default Logo;
