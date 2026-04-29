"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: Route;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "דשבורד" },
  { href: "/management-report", label: "דוח הנהלה" },
  { href: "/forward-view", label: "מבט 30 יום" },
  { href: "/quick-update", label: "עדכון מהיר" },
  { href: "/lists", label: "רשימות" },
  { href: "/users", label: "משתמשים" }
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="top-nav" role="banner">
      <div className="top-nav-inner">
        <Link href="/" className="brand-link">PMO-OVERWATCH</Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="פתיחת תפריט ניווט"
          onClick={() => setOpen((prev) => !prev)}
        >
          תפריט
        </button>
        <nav className="desktop-nav" aria-label="ניווט ראשי">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <nav id="mobile-nav" className={`mobile-nav ${open ? "open" : ""}`} aria-label="ניווט מובייל">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="mobile-nav-link" onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
