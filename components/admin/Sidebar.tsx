"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, Calendar, Users, Briefcase, 
  Settings, LogOut, LayoutDashboard, Globe 
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Настройки меню
const MENU = [
  { name: "Главная", href: "/admin", icon: LayoutDashboard },
  { name: "Клубы", href: "/admin/teams/list", icon: Shield },
  { name: "Игроки", href: "/admin/players/new", icon: Users },
  { name: "Федерации", href: "/admin/countries/list", icon: Globe },
  { name: "Календарь", href: "/admin/schedule", icon: Calendar },
  { name: "Трансферы", href: "/market", icon: Briefcase },
  { name: "Настройки", href: "/admin/seasons", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    // Добавил bg-gray-900, чтобы перекрасить фон в современный темный
    <div className="flex flex-col min-h-full bg-gray-900 border-r border-gray-800">
      
      {/* Логотип */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-white font-bold text-xl tracking-wider">
          SOCCER<span className="text-emerald-600">MANAGER</span>
        </h1>
      </div>

      {/* Меню навигации */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {MENU.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-gray-800 text-white" // Активный: Темно-серый фон + белый текст
                  : "text-gray-400 hover:bg-gray-800 hover:text-white" // Неактивный: Серый текст
              }`}
            >
              <item.icon size={20} className={isActive ? "text-emerald-500" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Профиль пользователя внизу */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 px-2 mb-3">
          {/* Аватарка */}
          <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-white">
            {session?.user?.name?.[0] || "A"}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:bg-gray-800 py-2 rounded transition-colors text-xs font-medium uppercase tracking-wider"
        >
          <LogOut size={16} /> Выход
        </button>
      </div>
    </div>
  );
}