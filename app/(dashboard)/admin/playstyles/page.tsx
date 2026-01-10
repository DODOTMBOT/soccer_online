"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast"; // Используем уведомления

export default function PlayStylesAdmin() {
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/playstyles")
      .then(r => r.json())
      .then(data => {
        setDefinitions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Функция сохранения в БД
  const saveDescription = async (id: string, newDescription: string) => {
    try {
      const res = await fetch("/api/playstyles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, description: newDescription }),
      });

      if (!res.ok) throw new Error("Ошибка сервера");
      
      toast.success("Описание сохранено", { duration: 2000 });
    } catch (e) {
      toast.error("Не удалось сохранить");
      console.error(e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f2f5f7] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#1a3151]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />
      <div className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-black uppercase text-[#1a3151] mb-6">Справочник PlayStyles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {definitions.map(def => (
            <div key={def.id} className="bg-white p-5 rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                  {def.category}
                </span>
                <span className="text-[9px] font-mono text-gray-400">{def.code}</span>
              </div>
              
              <h3 className="font-black text-[#1a3151] uppercase mb-4 text-sm flex items-center gap-2">
                {def.name}
              </h3>
              
              <div className="relative">
                <textarea 
                  className="w-full text-xs bg-gray-50 p-3 border border-gray-200 rounded-sm resize-none focus:border-[#1a3151] focus:bg-white outline-none transition-all h-24 font-medium text-gray-600 leading-relaxed"
                  defaultValue={def.description || ""}
                  placeholder="Введите описание эффекта..."
                  // При потере фокуса (клик вне поля) данные улетают на сервер
                  onBlur={(e) => saveDescription(def.id, e.target.value)}
                />
                <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
                  <Save size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}