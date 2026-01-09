"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { 
  Trophy, ArrowLeft, Loader2, Plus, Layers, 
  Users, Globe, Info, ChevronRight 
} from "lucide-react";
import Link from "next/link";

export default function NewLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [countries, setCountries] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    level: 1,
    teamsCount: 16,
    countryId: "",
    nextLeagueId: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, lRes, sRes] = await Promise.all([
          // ВАЖНО: Добавлен параметр ?includeEmpty=true и { cache: 'no-store' }
          fetch('/api/admin/countries?includeEmpty=true', { cache: 'no-store' }),
          fetch('/api/admin/leagues', { cache: 'no-store' }),
          fetch('/api/admin/seasons', { cache: 'no-store' })
        ]);
        
        if (cRes.ok) setCountries(await cRes.json());
        if (lRes.ok) setLeagues(await lRes.json());
        
        if (sRes.ok) {
          const seasons = await sRes.json();
          // Ищем сезон со статусом ACTIVE
          const active = seasons.find((s: any) => s.status === 'ACTIVE');
          if (active) {
            setActiveSeason(active);
          } else {
            setError("В системе нет активного сезона. Сначала создайте сезон в панели управления.");
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        setError("Ошибка при загрузке данных с сервера");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSeason?.id) {
      setError("Ошибка: Сезон не определен. Создайте активный сезон.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          seasonId: activeSeason.id // Передаем ID сезона в API
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при сохранении");
      }

      alert("Лига успешно создана");
      router.push("/admin/countries/list");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f2f5f7] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1a3151]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/countries/list" className="text-gray-400 hover:text-[#000c2d]">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase italic text-[#000c2d]">
              Новый <span className="text-[#e30613]">Дивизион</span>
            </h1>
          </div>
          {activeSeason && (
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm text-[9px] font-bold text-emerald-700 uppercase tracking-widest">
              Активный сезон: {activeSeason.year}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 p-8">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white shadow-sm border border-gray-200">
            <div className="bg-[#1a3151] px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest">
              Параметры нового дивизиона
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Страна */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500">Федерация</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold"
                    value={form.countryId}
                    onChange={e => setForm({...form, countryId: e.target.value})}
                  >
                    <option value="">Выберите страну...</option>
                    {countries.length > 0 ? (
                      countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      <option disabled>Нет доступных стран</option>
                    )}
                  </select>
                </div>

                {/* Название */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500">Название лиги</label>
                  <input 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold" 
                    placeholder="Напр: Premier League"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500">Уровень (1 - высший)</label>
                  <input 
                    type="number" required min="1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold" 
                    value={form.level}
                    onChange={e => setForm({...form, level: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500">Количество команд</label>
                  <input 
                    type="number" required min="2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold" 
                    value={form.teamsCount}
                    onChange={e => setForm({...form, teamsCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 border-l-4 border-red-500 text-[10px] font-bold uppercase">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  disabled={loading || !activeSeason}
                  className="bg-[#000c2d] text-white px-8 py-4 rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-[#e30613] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Создать дивизион"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}