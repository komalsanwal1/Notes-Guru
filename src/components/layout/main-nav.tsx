"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      {NAV_ITEMS.map((item: NavItem) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
            item.disabled && "cursor-not-allowed opacity-80"
          )}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  // TODO: Implement mobile navigation, e.g., using a Sheet component
  return (
     <nav className="md:hidden flex flex-col space-y-2 mt-4">
      {NAV_ITEMS.map((item: NavItem) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-base font-medium transition-colors hover:text-primary p-2 rounded-md",
            pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50",
            item.disabled && "cursor-not-allowed opacity-80"
          )}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
