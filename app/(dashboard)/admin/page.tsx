import React from 'react';
import { 
  Users, 
  Shield, 
  Settings, 
  MonitorCheck,
  Trophy,
  type LucideIcon 
} from 'lucide-react';

// --- НАСТРОЙКИ ДИЗАЙНА ---
const THEME = {
  colors: {
    bgMain: "bg-gray-50",
    primary: "bg-emerald-600",
    primaryText: "text-emerald-600",
    cardBg: "bg-white",
    textMain: "text-gray-900",
    textMuted: "text-gray-500",
  }
};

// --- ТИПИЗАЦИЯ ---

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subLabel?: string;
}

const StatCard = ({ icon: Icon, label, value, subLabel }: StatCardProps) => (
  <div className={`${THEME.colors.cardBg} p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32`}>
    <div className="flex justify-between items-start">
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon size={20} className={THEME.colors.textMuted} />
      </div>
      <span className={`text-3xl font-bold ${THEME.colors.textMain}`}>{value}</span>
    </div>
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider ${THEME.colors.textMuted}`}>{label}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
    </div>
  </div>
);

// --- СТРАНИЦА (Только контент) ---

export default function AdminDashboard() {
  return (
    <div className={`flex flex-col w-full h-full ${THEME.colors.bgMain} font-sans`}>
      
      {/* Header / Top Bar */}
      <header className={`${THEME.colors.cardBg} h-16 border-b border-gray-200 flex items-center justify-between px-8`}>
        <div className="text-sm breadcrumbs text-gray-400">
          <span>Админ панель</span> <span className="mx-2">/</span> <span className="text-gray-800 font-medium">Рабочий стол</span>
        </div>
        <div className="flex items-center gap-4">
           {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
            <MonitorCheck size={14} />
            <span>Все модули работают штатно</span>
          </div>
        </div>
      </header>

      {/* Content Body */}
      <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Рабочий <span className={THEME.colors.primaryText}>стол</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm uppercase tracking-wider">
              ar@ar.ru • Главный администратор системы
            </p>
          </div>
          
          {/* Season Badge */}
          <div className={`${THEME.colors.cardBg} border border-gray-200 px-5 py-3 rounded-lg shadow-sm`}>
            <p className="text-xs text-gray-400 uppercase font-bold text-center mb-1">Текущий сезон</p>
            <p className={`text-xl font-bold ${THEME.colors.primaryText} text-center`}>2025 SEASON</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Пользователей" value="0" />
          <StatCard icon={Trophy} label="Лиг в базе" value="6" />
          <StatCard icon={Shield} label="Всего команд" value="4" />
          
          {/* Action Card (Season Management) */}
          <div className="bg-gray-900 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
               <Settings size={100} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Управление сезонами</p>
                <h3 className="text-xl font-bold leading-tight">Идет сезон 2025</h3>
              </div>
              <button className={`mt-4 w-full py-2 ${THEME.colors.primary} hover:opacity-90 text-white text-sm font-bold rounded transition-colors`}>
                ПЕРЕЙТИ К СЕЗОНУ
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}