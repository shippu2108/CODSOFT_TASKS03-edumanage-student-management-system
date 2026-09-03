"use client";

import { signOut } from "next-auth/react";
import { LogOut, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AppShellProps = {
  role: string;
  userName: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function AppShell({
  role,
  userName,
  navItems,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col bg-[#0F1C33] text-white md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-6">
          <GraduationCap className="h-7 w-7 text-[#C9A227]" />

          <span className="text-lg font-semibold tracking-tight [font-family:var(--font-serif)]">
            EduManage
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map(function renderNavItem(item) {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={function handleLogout() {
              signOut({ callbackUrl: "/login" });
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#E4E1D8] bg-white px-6 py-4 md:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#C9A227]">
              {role}
            </p>

            <h1 className="text-xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
              Welcome, {userName}
            </h1>
          </div>

          {/* Mobile Sign Out */}
          <button
            onClick={function handleLogoutMobile() {
              signOut({ callbackUrl: "/login" });
            }}
            className="flex items-center gap-2 rounded-md border border-[#E4E1D8] px-3 py-1.5 text-sm text-[#4C6485] hover:bg-[#FAFAF7] md:hidden"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}