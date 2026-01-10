"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Save, Zap, Search, Info, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

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

export default function PlayStylesAdmin() {
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/playstyles")
      .then(r => r.json())
      .then(data => {
        setDefinitions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Фильтрация стилей по поиску
  const filteredDefinitions = useMemo(() => {
    return definitions.filter(def => 
      def.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [definitions, searchTerm]);

  const saveDescription = async (id: string, newDescription: string) => {
    try {
      const res = await fetch("/api/playstyles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, description: newDescription }),
      });

      if (!res.ok) throw new Error("Ошибка сервера");
      
      toast.success("Описание сохранено", { 
        style: { borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' } 
      });
    } catch (e) {
      toast.error("Не удалось сохранить");
      console.error(e);
    }
  };

  if (loading) return (
    <div className={`min-h-screen ${THEME.colors.bgMain} flex items-center justify-center`}>
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  return (
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans p-8 pb-20`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Zap size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Справочник данных</span>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none mt-1">
                Игровые <span className={THEME.colors.primaryText}>Стили</span>
              </h1>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ПОИСК СТИЛЯ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-[10px] font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all uppercase tracking-widest" 
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Всего определений</p>
            <p className="text-xl font-black text-gray-900">{definitions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Уникальных категорий</p>
            <p className={`text-xl font-black ${THEME.colors.primaryText}`}>
              {new Set(definitions.map(d => d.category)).size}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDefinitions.map(def => (
            <div key={def.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {def.category}
                </span>
                <span className="text-[9px] font-mono text-gray-400 font-bold bg-white border border-gray-100 px-2 py-0.5 rounded-md uppercase">
                  {def.code}
                </span>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-gray-900 uppercase mb-4 text-sm tracking-tight flex items-center gap-2">
                  {def.name}
                </h3>
                
                <div className="relative flex-1">
                  <textarea 
                    className="w-full text-xs bg-gray-50 p-4 border border-gray-100 rounded-xl resize-none focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-500/5 outline-none transition-all h-32 font-medium text-gray-600 leading-relaxed placeholder:text-gray-300"
                    defaultValue={def.description || ""}
                    placeholder="Опишите механику работы данного стиля..."
                    onBlur={(e) => saveDescription(def.id, e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity">
                    <Save size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredDefinitions.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Ничего не найдено по вашему запросу</p>
            </div>
          )}
        </div>

        {/* System Helper */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[24px] flex items-start gap-4">
          <Info size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-emerald-800 font-medium uppercase tracking-wide">
            Изменения в описаниях стилей <span className="font-black">сохраняются автоматически</span> при выходе из поля ввода (потеря фокуса). 
            Эти тексты отображаются игрокам в профиле футболиста при наведении на иконку стиля.
          </p>
        </div>
      </div>
    </div>
  );
}