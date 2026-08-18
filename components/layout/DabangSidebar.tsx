"use client";

import {
  MessageSquare,
  PieChart,
  Upload,
  FileText,
  ScrollText,
  Users,
  Activity,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminUser } from "@/lib/auth";
import { useMobileNav } from "./MobileNav";

export default function ETISidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const user = getAdminUser();
    // getAdminUser() reads localStorage, which does not exist during SSR. Reading it
    // in an effect keeps the first client render identical to the server HTML, so the
    // Administration group appears only after hydration, for super admins.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(user?.is_superuser || false);
  }, []);

  // Grouped so the nav reads as sections rather than one long list
  const groups = [
    {
      label: "Overview",
      items: [{ name: "Dashboard", icon: PieChart, href: "/" }],
    },
    {
      label: "Engagement",
      items: [{ name: "Messages", icon: MessageSquare, href: "/messages" }],
    },
    {
      label: "Knowledge",
      items: [
        { name: "Upload Content", icon: Upload, href: "/ai" },
        { name: "Uploaded Documents", icon: FileText, href: "/documents" },
        { name: "AI Instructions", icon: ScrollText, href: "/instructions" },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Administration",
            items: [
              { name: "Admin Management", icon: Users, href: "/admin-management" },
              { name: "Activity Log", icon: Activity, href: "/activity-log" },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Scrim, only while the drawer is open on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(15,28,46,0.5)] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-72 shrink-0 h-screen flex flex-col bg-gradient-to-b from-[#00325f] via-[#002c5c] to-[#001d3f] text-white
          fixed inset-y-0 left-0 z-50 transition-transform duration-200
          lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand - the logo is navy + green, so it sits on a white plate to stay
            legible against the navy panel */}
        <div className="h-16 px-3 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/ETI_logo.svg" alt="Electrical Training Institute" className="w-[29px] h-auto" />
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.01em] whitespace-nowrap text-white/90">
            Electrical Training Institute
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="lg:hidden ml-auto shrink-0 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="eti-scroll-dark flex-1 overflow-y-auto overscroll-contain py-4 px-3">
          {groups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--color-secondary)]">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-white/12 text-white font-semibold"
                          : "text-white/70 font-medium hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {/* Active marker: a green rail, not a full-bleed fill */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full transition-opacity ${
                          active ? "bg-[var(--color-secondary)] opacity-100" : "opacity-0"
                        }`}
                      />
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[var(--color-secondary)]" : ""}`}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
