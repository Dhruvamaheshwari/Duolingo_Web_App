"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Trophy, User as UserIcon, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { logout } from "@/lib/api";

interface SidebarProps {
  username?: string;
  totalXp?: number;
}

export default function Sidebar({ username, totalXp }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = username ? username.split('@')[0] : 'Learner';

  const navItems = [
    { name: "Learn", href: "/", icon: BookOpen },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border p-4 fixed left-0 top-0 bottom-0 flex-col justify-between z-30 bg-card text-foreground transition-colors duration-200">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="px-4 py-3 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight text-emerald-500 group-hover:opacity-90 transition-opacity uppercase">
              Duolingo
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-all ${
                    isActive
                      ? "bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-500 shadow-md shadow-emerald-500/5"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: Theme Toggle & User Info */}
        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between px-2 pt-2 border-t border-border">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-md flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-foreground truncate">{displayName}</span>
                {totalXp !== undefined && (
                  <span className="text-[11px] font-semibold text-emerald-500">{totalXp} XP</span>
                )}
              </div>
            </div>
            <button 
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              title="Logout"
              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-2 flex justify-around items-center transition-colors">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 font-bold text-xs ${
                isActive ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
