"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, ArrowLeft, Loader2, Plus, 
  ChevronRight, CalendarDays, Building2, Layers
} from "lucide-react";
import Link from "next/link";

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
          fetch('/api/admin/countries?includeEmpty=true', { cache: 'no-store' }),
          fetch('/api/admin/leagues', { cache: 'no-store' }),
          fetch('/api/admin/seasons', { cache: 'no-store' })
        ]);
        
        if (cRes.ok) setCountries(await cRes.json());
        if (lRes.ok) setLeagues(await lRes.json());
        
        if (sRes.ok) {
          const seasons = await sRes.json();
          const active = seasons.find((s: any) => s.status === 'ACTIVE');
          if (active) {
            setActiveSeason(active);
          } else {
            setError("В системе нет активного сезона. Создайте его в панели управления.");
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
      setError("Ошибка: Сезон не определен.");
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
          seasonId: activeSeason.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при сохранении");
      }

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
      <div className={`min-h-screen ${THEME.colors.bgMain} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${THEME.colors.bgMain} font-sans p-8`}>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/admin/countries/list" className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Админ панель / Федерации</span>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Новый <span className={THEME.colors.primaryText}>Дивизион</span>
              </h2>
            </div>
          </div>
          
          {activeSeason && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
              <CalendarDays size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Сезон {activeSeason.year}
              </span>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <Layers size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-700">Конфигурация дивизиона</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Страна */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider italic">1. Федерация</label>
                <select 
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                  value={form.countryId}
                  onChange={e => setForm({...form, countryId: e.target.value})}
                >
                  <option value="">Выберите страну...</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Название */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider italic">2. Название лиги</label>
                <input 
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all placeholder:text-gray-300" 
                  placeholder="Напр: Premier League"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Уровень */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider italic">3. Уровень иерархии</label>
                <div className="relative flex items-center">
                   <input 
                    type="number" required min="1"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" 
                    value={form.level}
                    onChange={e => setForm({...form, level: parseInt(e.target.value)})}
                  />
                  <span className="absolute right-4 text-[10px] font-black text-gray-300 uppercase">(1 - Высший)</span>
                </div>
              </div>

              {/* Команды */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider italic">4. Лимит команд</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" required min="2"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" 
                    value={form.teamsCount}
                    onChange={e => setForm({...form, teamsCount: parseInt(e.target.value)})}
                  />
                   <Building2 className="absolute right-4 text-gray-300" size={16} />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</span>
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading || !activeSeason}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Создать дивизион
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Helper */}
        <div className="bg-white border border-gray-100 p-6 rounded-[24px] flex items-start gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
            <Trophy size={16} className="text-emerald-600" />
          </div>
          <p className="text-[10px] leading-relaxed text-gray-400 font-medium uppercase tracking-wide">
            Новый дивизион будет автоматически привязан к текущему активному сезону. После создания вы сможете распределить клубы в этот дивизион через панель <span className="text-emerald-600 font-black">"Состав"</span> в реестре федераций.
          </p>
        </div>
      </div>
    </div>
  );
}