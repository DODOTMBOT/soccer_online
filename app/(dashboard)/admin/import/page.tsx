// app/admin/import/page.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Loader2, UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";

export default function ImportPage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    setResult(null);
    setError("");
    
    try {
      // 1. Проверяем валидность JSON перед отправкой
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        throw new Error("Некорректный JSON. Проверьте скобки и запятые.");
      }

      setLoading(true);
      
      // 2. Отправляем на сервер
      const res = await fetch("/api/admin/import/real-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Если JSON обернут в { data: ... }, отправляем как есть, иначе оборачиваем
        body: JSON.stringify({ data: Array.isArray(parsed) ? parsed : parsed.data }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Пример JSON для подсказки
  const exampleJson = `[
  {
    "externalId": "tm_11", 
    "name": "Arsenal",
    "country": "Англия",
    "league": "Premier League",
    "players": [
      {
        "externalId": "pl_7",
        "firstName": "Bukayo",
        "lastName": "Saka",
        "age": 23,
        "position": "RM",
        "power": 90
      }
    ]
  }
]`;

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />
      <div className="p-8 max-w-5xl mx-auto w-full">
        
        <h1 className="text-2xl font-black uppercase text-[#1a3151] mb-6 flex items-center gap-3">
          <UploadCloud className="text-[#e30613]" /> Импорт реальных данных
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ЛЕВАЯ КОЛОНКА - ВВОД */}
          <div className="space-y-4">
            <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Вставьте JSON массив команд</p>
              <textarea 
                className="w-full h-96 p-4 text-xs font-mono border border-gray-200 rounded-sm bg-gray-50 focus:border-[#1a3151] outline-none resize-none"
                placeholder={exampleJson}
                value={json}
                onChange={e => setJson(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleImport}
              disabled={loading || !json}
              className="w-full bg-[#1a3151] text-white py-4 rounded-sm font-black uppercase text-xs tracking-[0.2em] hover:bg-[#e30613] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16}/> : "Загрузить в базу"}
            </button>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 border-l-4 border-red-500 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16}/> {error}
              </div>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА - РЕЗУЛЬТАТ */}
          <div className="space-y-4">
            <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm h-full">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4">
                Результат операции
              </h3>
              
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle size={24} />
                    <span className="font-black text-lg">Импорт успешен!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-sm">
                      <p className="text-[9px] uppercase text-gray-400 font-bold">Команд</p>
                      <p className="text-xl font-black text-[#1a3151]">{result.stats.teams}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-sm">
                      <p className="text-[9px] uppercase text-gray-400 font-bold">Игроков</p>
                      <p className="text-xl font-black text-[#1a3151]">{result.stats.players}</p>
                    </div>
                  </div>

                  <div className="bg-[#000c2d] text-gray-300 p-4 rounded-sm text-[10px] font-mono h-48 overflow-y-auto">
                    {result.logs.length > 0 ? result.logs.map((l: string, i: number) => (
                      <div key={i}>&gt; {l}</div>
                    )) : (
                      <span className="opacity-50">Нет подробных логов...</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <UploadCloud size={48} className="mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Ожидание данных...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}