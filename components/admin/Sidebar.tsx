"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Shield, Calendar, Users, Briefcase, 
  Settings, LogOut, LayoutDashboard, Globe,
  ChevronDown, ChevronRight, Zap
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Обновленная структура меню с вложенностью
const MENU = [
  { name: "Главная", href: "/admin", icon: LayoutDashboard },
  { 
    name: "Панель администратора", 
    icon: Settings, // Иконка группы
    children: [
      { name: "Клубы", href: "/admin/teams/list", icon: Shield },
      { name: "Игроки", href: "/admin/players/new", icon: Users },
      { name: "Федерации", href: "/admin/countries/list", icon: Globe },
      { name: "Календарь", href: "/admin/schedule", icon: Calendar },
      { name: "Сезоны", href: "/admin/seasons", icon: Settings },
      { name: "Стили игры", href: "/admin/playstyles", icon: Zap },
     { name: "Заявки на команды", href: "/admin/applications", icon: Zap },
          { name: "Панель отладки", href: "/admin/debug", icon: Zap },
                { name: "Импорт реальных данных", href: "/admin/import", icon: Globe },



    ]
  },
  { name: "Трансферы", href: "/market", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Определяем, активен ли какой-то из дочерних элементов
  const isParentActive = (children: any[]) => children.some(child => child.href === pathname);

  // Состояние раскрытия меню (по умолчанию открыто, если мы внутри раздела)
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  // Автоматически открываем меню при навигации (опционально)
  useEffect(() => {
    const adminGroup = MENU.find(item => item.name === "Панель администратора");
    if (adminGroup?.children && isParentActive(adminGroup.children)) {
      setIsAdminOpen(true);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-full bg-gray-900 border-r border-gray-800 w-64 shrink-0">
      
      {/* Логотип */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-white font-bold text-xl tracking-wider">
          SOCCER<span className="text-emerald-600">MANAGER</span>
        </h1>
      </div>

      {/* Меню навигации */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {MENU.map((item, index) => {
          // Рендер для группы с выпадающим списком
          if (item.children) {
            const isActive = isParentActive(item.children);
            
            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? "text-emerald-500" : ""} />
                    {item.name}
                  </div>
                  {isAdminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Выпадающий список */}
                {isAdminOpen && (
                  <div className="relative ml-4 pl-4 border-l border-gray-800 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            isChildActive 
                              ? "bg-gray-800 text-white shadow-sm" 
                              : "text-gray-500 hover:text-white hover:bg-gray-800/50"
                          }`}
                        >
                          <child.icon size={16} className={isChildActive ? "text-emerald-500" : "opacity-70"} />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Рендер для обычных ссылок (Главная, Трансферы)
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-emerald-500" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Профиль пользователя внизу */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 mt-auto">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
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