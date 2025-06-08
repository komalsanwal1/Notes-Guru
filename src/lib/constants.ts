
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Process & Study', href: '/process-study' },
  { title: 'OCR Handwritten', href: '/ocr' },
  { title: 'Study Chat', href: '/study-chat' },
];
