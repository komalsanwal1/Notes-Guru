import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 group" aria-label="NoteGuru Home">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary group-hover:text-accent transition-colors duration-300"
      aria-hidden="true"
    >
      {/* <!-- Open notebook/document --> */}
      <path d="M6 22h12c1.1 0 2-.9 2-2V6" />
      <path d="M6 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12" />
      <path d="M18 4H6a2 2 0 0 0-2 2" />
      {/* <!-- Binding rings --> */}
      <path d="M12 4V2M8 4V2M16 4V2" />
      
      {/* <!-- Spark/idea icon (filled) --> */}
      <path d="M12 9l.94 1.88L15 11.25l-2.06 1.37L12 15l-.94-1.88L9 11.25l2.06-1.37L12 9z" fill="currentColor" strokeWidth="1"/>
      
      {/* <!-- Lines representing text --> */}
      <line x1="8" y1="9" x2="9.5" y2="9" strokeWidth="1"/>
      <line x1="14.5" y1="9" x2="16" y2="9" strokeWidth="1"/>
      <line x1="8" y1="15" x2="16" y2="15" strokeWidth="1"/>
    </svg>
    <span className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors duration-300">
      NoteGuru
    </span>
  </Link>
);

export default Logo;
