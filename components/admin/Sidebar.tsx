"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  ShieldCheck, Activity, Briefcase, Settings, UserPlus, CalendarClock, LogOut, Coins, UploadCloud 
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Главная", href: "/", icon: ShieldCheck },
  { name: "Расписание", href: "/admin/schedule", icon: CalendarClock }, 
  { name: "Клубы", href: "/teams", icon: Activity },
  { name: "Трансферы", href: "/market", icon: Briefcase },
  { name: "Правила", href: "/rules", icon: Activity },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const teamId = session?.user?.teamId;
  const userRole = session?.user?.role;
  const userBalance = session?.user?.balance;

  const formatBalance = (val: string | undefined) => {
    if (!val) return "0";
    const num = Number(val);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    return num.toLocaleString();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-16 bg-[#000c2d] px-8 flex items-center justify-between shrink-0 text-white z-50 sticky top-0 shadow-xl border-b border-white/5">
      
      {/* ЛЕВАЯ ЧАСТЬ */}
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">
            Football Manager<span className="text-[#e30613]">Online</span>
          </h1>
        </Link>

        <nav className="flex gap-2 items-center">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  isActive ? "bg-[#e30613] text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={14} />
                {item.name}
              </Link>
            );
          })}

          {/* ЛОГИКА КНОПКИ КОМАНДЫ */}
          {session?.user && (
            teamId ? (
              <Link
                href={`/teams/${teamId}`}
                className="px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Моя команда
              </Link>
            ) : (
              <Link
                href="/teams/free"
                className="px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border bg-white/10 text-white border-white/20 hover:bg-white/20 animate-pulse"
              >
                <UserPlus size={14} />
                Взять команду
              </Link>
            )
          )}

          {userRole === "ADMIN" && (
            <>
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  pathname === "/admin" ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Settings size={14} className="text-[#e30613]" />
                Админка
              </Link>
              
              <Link
                href="/admin/import"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  pathname === "/admin/import" ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <UploadCloud size={14} className="text-[#e30613]" />
                Импорт
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div className="flex items-center gap-6">
        {session?.user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-[11px] font-black tracking-tighter text-white">
              {formatBalance(userBalance)} $
            </span>
          </div>
        )}

        <div className="relative" ref={userMenuRef}>
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1 group-hover:text-emerald-400 transition-colors">
                {userRole || "Гость"}
              </p>
              <p className="text-[10px] font-bold text-white leading-none">
                {session?.user?.name || "Пользователь"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-sm bg-[#1a3151] border border-white/10 flex items-center justify-center text-[10px] font-black text-white shadow-inner uppercase italic border-b-2 border-b-[#e30613]">
              {session?.user?.name ? session.user.name.substring(0, 2) : "UN"}
            </div>
          </div>

          {isUserMenuOpen && session && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-sm shadow-2xl border border-gray-200 py-2 text-[#000c2d]">
               <button 
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Выход
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}