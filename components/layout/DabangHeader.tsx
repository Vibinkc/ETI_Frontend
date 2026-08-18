"use client";

import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminUser, removeAuthToken, type AdminUser } from "@/lib/auth";
import { useMobileNav } from "./MobileNav";

const PAGES: Record<string, { title: string; sub: string }> = {
  "/": { title: "Dashboard", sub: "Chatbot activity and knowledge base health" },
  "/ai": { title: "Upload Content", sub: "Add documents or scrape a website for the bot to learn from" },
  "/documents": { title: "Uploaded Documents", sub: "Files and pages the bot answers from" },
  "/instructions": { title: "AI Instructions", sub: "How the assistant should behave" },
  "/bot-script": { title: "Bot Script", sub: "Embed the widget on your website" },
  "/messages": { title: "Messages", sub: "Conversations from your website visitors" },
  "/forms": { title: "Form Submissions", sub: "Enquiries captured by the chatbot" },
  "/admin-management": { title: "Admin Management", sub: "Who can access this console" },
  "/activity-log": { title: "Activity Log", sub: "Everything admins have done in this console" },
};

export default function ETIHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen } = useMobileNav();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // getAdminUser() reads localStorage, which does not exist during SSR. Loading
    // it in an effect keeps the first client render identical to the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdminUser(getAdminUser());
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const page = PAGES[pathname] ?? PAGES["/"];

  const fullName =
    adminUser?.first_name && adminUser?.last_name
      ? `${adminUser.first_name} ${adminUser.last_name}`
      : adminUser?.first_name || adminUser?.last_name || "Admin User";

  const initials = (adminUser?.first_name?.[0] || adminUser?.email?.[0] || "A").toUpperCase();

  return (
    <header className="sticky top-0 z-30 lg:static h-16 shrink-0 bg-white border-b border-[var(--eti-border)] flex items-center justify-between gap-4 px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="lg:hidden shrink-0 -ml-1 p-2 rounded-lg text-[var(--eti-ink-muted)] hover:bg-[#f2f5f9] hover:text-[var(--eti-ink)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Short brand rule, aligned to the title block rather than the full width */}
        <span className="hidden sm:block h-8 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]" />
        <div className="min-w-0">
          <h1 className="text-[1.0625rem] font-semibold tracking-tight leading-tight truncate text-[var(--color-primary)]">
            {page.title}
          </h1>
          <p className="text-[11.5px] leading-tight text-[var(--eti-ink-subtle)] truncate">{page.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-4">
        <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--eti-border)]">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[13px] font-semibold">
            {initials}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-[var(--eti-ink)]">{fullName}</span>
            <span className="text-[11px] text-[var(--eti-ink-subtle)]">{adminUser?.email || "—"}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 p-2 rounded-[10px] text-[var(--eti-ink-subtle)] hover:text-[var(--eti-critical)] hover:bg-[#fef3f2] transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
