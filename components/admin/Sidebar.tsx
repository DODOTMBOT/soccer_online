"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  ShieldCheck, 
  Activity, 
  Plus, 
  Search, 
  Bell, 
  ChevronDown,
  UserPlus,
  Globe,
  Layers,
  LogOut,
  Coins,
  Briefcase,
  FileText
} from "lucide-react";

// Основное меню навигации
const MENU_ITEMS = [
  { name: "Главная", href: "/", icon: ShieldCheck },
  { name: "Клубы", href: "/teams", icon: Activity },
  { name: "Правила", href: "/rules", icon: Activity },

  // Добавим быстрый доступ к бирже, чтобы можно было смотреть вакансии
  { name: "Свободные команды", href: "/teams/free", icon: Briefcase },
];

// Меню "Создать" (только для Админа)
const CREATE_ITEMS = [
  { name: "Игрок", href: "/admin/players/new", icon: UserPlus },
  { name: "Клуб", href: "/admin/teams/new", icon: ShieldCheck },
  { name: "Страна", href: "/admin/countries/new", icon: Globe },
  { name: "Лига", href: "/admin/leagues/new", icon: Layers },
  // Новый пункт для управления заявками
  { name: "Заявки", href: "/admin/applications", icon: FileText },
];

export function Sidebar() {
  const { data: session } = useSession(); // Сессия обновляется из БД благодаря правке в lib/auth.ts
  const pathname = usePathname();
  
  // Состояния для выпадающих меню
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Данные пользователя
  const teamId = session?.user?.teamId;
  const userRole = session?.user?.role;
  const userBalance = session?.user?.balance;

  // Форматирование денег (1000000 -> 1.0M)
  const formatBalance = (val: string | undefined) => {
    if (!val) return "0";
    const num = Number(val);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    return num.toLocaleString();
  };

  // Закрытие меню при клике вне элемента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закрытие меню при переходе на другую страницу
  useEffect(() => {
    setIsCreateOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-16 bg-[#000c2d] px-8 flex items-center justify-between shrink-0 text-white z-50 sticky top-0 shadow-xl border-b border-white/5">
      
      {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП И ССЫЛКИ */}
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">
            Football Manager<span className="text-[#e30613]">Online</span>
          </h1>
        </Link>

        <nav className="flex gap-2 items-center">
          {/* Рендеринг основных пунктов меню */}
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isActive ? "bg-[#e30613] text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* --- ДИНАМИЧЕСКАЯ КНОПКА СТАТУСА КОМАНДЫ --- */}
          {session?.user && (
            <Link
              // Если есть команда -> идем в управление командой. Если нет -> на биржу труда
              href={teamId ? `/admin/teams/${teamId}` : "/teams/free"}
              className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                teamId 
                  ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/20" // Зеленая (Есть команда)
                  : "bg-amber-600/10 text-amber-400 border-amber-500/30 hover:bg-amber-600/20" // Желтая (Нет команды)
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${teamId ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {teamId ? "Моя команда" : "Без команды"}
            </Link>
          )}

          {/* --- ВЫПАДАЮЩЕЕ МЕНЮ АДМИНА --- */}
          {userRole === "ADMIN" && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isCreateOpen ? "bg-white/20 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Plus size={14} className="text-[#e30613]" />
                Админ
                <ChevronDown size={12} className={`transition-transform duration-200 ${isCreateOpen ? "rotate-180" : ""}`} />
              </button>

              {isCreateOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-sm shadow-2xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-1 mb-1 border-b border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Панель управления</p>
                  </div>
                  {CREATE_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase text-[#000c2d] hover:bg-gray-100 transition-colors"
                    >
                      <item.icon size={14} className="text-gray-400" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: БАЛАНС И ПРОФИЛЬ */}
      <div className="flex items-center gap-6">
        
        {/* Баланс */}
        {session?.user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-[11px] font-black tracking-tighter text-white">
              {formatBalance(userBalance)}
            </span>
          </div>
        )}

        {/* Уведомления */}
        <div className="flex items-center gap-4 border-r border-white/10 pr-6">
          <Search size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
          <Bell size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>

        {/* Меню профиля */}
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

          {/* Выпадающее меню профиля */}
          {isUserMenuOpen && session && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-sm shadow-2xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 text-[#000c2d]">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-[8px] font-black text-gray-400 uppercase">Account ID</p>
                <p className="text-[10px] font-bold truncate opacity-60 italic">{session.user.id}</p>
              </div>
              
              <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
                <ShieldCheck size={14} className="text-gray-400" />
                Профиль менеджера
              </Link>

              <button 
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"
              >
                <LogOut size={14} />
                Выход из системы
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}