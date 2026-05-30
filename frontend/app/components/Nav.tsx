"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/pos", label: "POS" },
  { href: "/expenses", label: "Expenses" },
  { href: "/reports", label: "Reports" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-brutal-yellow border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-black tracking-tighter uppercase"
            >
              RETAIL ERP
            </Link>
          </div>
          <div className="hidden md:flex space-x-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-bold border-4 border-black transition-transform ${
                    active
                      ? "bg-black text-white translate-x-[-2px] translate-y-[-2px]"
                      : "bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-brutal-sm"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
