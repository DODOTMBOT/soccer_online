"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar"; // Горизонтальный Navbar
// app/admin/leagues/new/page.tsx

import { 
  Trophy, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Layers, 
  Users, 
  Globe, 
  Info, 
  ChevronRight // Добавьте этот импорт
} from "lucide-react";import Link from "next/link";

export default function NewLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    level: 1,
    teamsCount: 18,
    countryId: "",
    nextLeagueId: ""
  });

  const loadInitialData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        fetch('/api/admin/countries'),
        fetch('/api/admin/leagues')
      ]);
      if (cRes.ok) setCountries(await cRes.json());
      if (lRes.ok) setLeagues(await lRes.json());
    } catch (err) {
      console.error("Ошибка загрузки данных");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при сохранении");
      }

      router.push("/admin/countries/" + form.countryId);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      {/* Горизонтальное меню сверху */}
      <Sidebar />

      {/* SUB-HEADER (Breadcrumbs) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/countries/list" className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
              Создать <span className="text-[#e30613]">новый дивизион</span>
            </h1>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Иерархия футбольных лиг
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white shadow-sm border border-gray-200">
            {/* Заголовок формы */}
            <div className="bg-[#1a3151] px-8 py-3 flex justify-between items-center">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Параметры лиги</h2>
              <Trophy size={14} className="text-white/40" />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Страна */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Страна базирования</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none appearance-none transition-all cursor-pointer"
                      value={form.countryId}
                      onChange={e => setForm({...form, countryId: e.target.value})}
                    >
                      <option value="">Выберите страну</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Название */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Название лиги</label>
                  <input 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none transition-all" 
                    placeholder="Напр: Premier League"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Уровень */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Уровень в иерархии (Level)</label>
                  <div className="relative">
                    <input 
                      type="number" required min="1"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none transition-all" 
                      value={isNaN(form.level) ? "" : form.level}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setForm({...form, level: isNaN(val) ? NaN : val});
                      }}
                    />
                    <Layers className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  </div>
                </div>

                {/* Кол-во команд */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Лимит команд (Teams)</label>
                  <div className="relative">
                    <input 
                      type="number" required min="2"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none transition-all" 
                      value={isNaN(form.teamsCount) ? "" : form.teamsCount}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setForm({...form, teamsCount: isNaN(val) ? NaN : val});
                      }}
                    />
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  </div>
                </div>
              </div>

              {/* Иерархия */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Система повышения (Лига выше)</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none appearance-none transition-all cursor-pointer"
                    value={form.nextLeagueId}
                    onChange={e => setForm({...form, nextLeagueId: e.target.value})}
                  >
                    <option value="">Нет (Высший дивизион страны)</option>
                    {leagues.filter(l => l.countryId === form.countryId).map(l => (
                      <option key={l.id} value={l.id}>{l.name} (L{l.level})</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none rotate-90 md:rotate-0" size={16} />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-[10px] font-bold uppercase text-red-600">Ошибка: {error}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button 
                  disabled={loading}
                  className="bg-[#000c2d] text-white px-10 py-4 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#e30613] transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>Сформировать дивизион <Plus size={14} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Информационный блок */}
          <div className="mt-8 bg-blue-50 border border-blue-100 p-6 flex items-start gap-4 rounded-sm">
            <Info size={20} className="text-blue-600 shrink-0" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider mb-1 text-blue-900">Справка по иерархии</h4>
              <p className="text-[10px] leading-relaxed text-blue-800/80 font-medium">
                Уровень 1 (L1) всегда считается вершиной футбольной пирамиды страны. 
                Указывая "Лигу выше", вы настраиваете автоматическую систему ротации команд (повышение/понижение) для будущих сезонов.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}