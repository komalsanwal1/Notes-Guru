export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Simplify Text', href: '/simplify' },
  { title: 'Summarize Notes', href: '/summarize' },
  { title: 'OCR Handwritten', href: '/ocr' },
  { title: 'Study Chat', href: '/study-chat' },
];
