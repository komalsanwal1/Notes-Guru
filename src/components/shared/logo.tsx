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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary group-hover:text-accent transition-colors duration-300"
      aria-hidden="true"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v8" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M2.5 12.5a2.5 2.5 0 0 1 0-5c1.5 0 2.5 1 2.5 2.5S4 12.5 2.5 12.5z" />
      <path d="m19.5 7.5-1.22-1.22a1.5 1.5 0 0 0-2.12 0L14 8.5l4.5 4.5 2.22-2.22a1.5 1.5 0 0 0 0-2.12z" />
    </svg>
    <span className="text-2xl font-bold font-headline text-foreground group-hover:text-primary transition-colors duration-300">
      NoteGuru
    </span>
  </Link>
);

export default Logo;
