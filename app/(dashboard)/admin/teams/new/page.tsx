"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  ArrowLeft,
  ImageIcon,
  ChevronRight,
  MapPin
} from "lucide-react";
import Link from "next/link";

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

interface Country { id: string; name: string; }
interface League { id: string; name: string; countryId: string; }

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);

  const [form, setForm] = useState({
    name: "",
    logo: "",
    countryId: "",
    leagueId: "",
    stadium: "",
    finances: 0,
    baseLevel: 1,
    managerId: null, // Убрали выбор менеджера из формы по ТЗ
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, leaguesRes] = await Promise.all([
          fetch("/api/admin/countries"),
          fetch("/api/admin/leagues"),
        ]);
        
        if (countriesRes.ok) setCountries(await countriesRes.json());
        if (leaguesRes.ok) setLeagues(await leaguesRes.json());
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!form.countryId) throw new Error("Выберите страну");
      if (!form.leagueId) throw new Error("Выберите лигу");

      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          finances: Number(form.finances),
          baseLevel: Number(form.baseLevel)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при сохранении клуба");

      setSuccess(true);
      setTimeout(() => router.push("/admin/teams/list"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(l => l.countryId === form.countryId);

  return (
    <div className={`w-full min-h-full ${THEME.colors.bgMain} font-sans p-6`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Админ панель / Регистрация</span>
            <h2 className="text-2xl font-bold text-gray-900">Создание <span className={THEME.colors.primaryText}>клуба</span></h2>
          </div>
          <Link 
            href="/admin/teams/list" 
            className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Отмена
          </Link>
        </div>

        <hr className="border-gray-200" />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Блок: Основные параметры */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Основные параметры</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Название организации</label>
                <input 
                  required 
                  placeholder="Напр. Real Madrid" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-emerald-500/10 transition-all"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Домашняя арена</label>
                <div className="relative">
                  <input 
                    required 
                    placeholder="Напр. Santiago Bernabéu" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:ring-2 ring-emerald-500/10 transition-all"
                    value={form.stadium} 
                    onChange={e => setForm({...form, stadium: e.target.value})} 
                  />
                  <MapPin className="absolute right-3 top-3 text-gray-300" size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Логотип (URL)</label>
              <div className="relative">
                <input 
                  placeholder="https://example.com/logo.png" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:ring-2 ring-emerald-500/10 transition-all"
                  value={form.logo} 
                  onChange={e => setForm({...form, logo: e.target.value})} 
                />
                <ImageIcon className="absolute right-3 top-3 text-gray-300" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Страна</label>
                <select 
                  required 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-medium outline-none cursor-pointer focus:ring-2 ring-emerald-500/10 transition-all"
                  value={form.countryId} 
                  onChange={e => setForm({...form, countryId: e.target.value, leagueId: ""})}
                >
                  <option value="">Выберите страну...</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Лига / Дивизион</label>
                <select 
                  required 
                  disabled={!form.countryId} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-medium outline-none cursor-pointer disabled:opacity-30 focus:ring-2 ring-emerald-500/10 transition-all"
                  value={form.leagueId} 
                  onChange={e => setForm({...form, leagueId: e.target.value})}
                >
                  <option value="">Выберите лигу...</option>
                  {filteredLeagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Блок: Экономика и База */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Экономика и База</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Финансы</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-emerald-500/10 transition-all tabular-nums"
                  value={form.finances} 
                  onChange={e => setForm({...form, finances: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-gray-600">Инфраструктура</label>
                  <span className="text-sm font-bold text-emerald-600">Уровень {form.baseLevel}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-4"
                  value={form.baseLevel} 
                  onChange={e => setForm({...form, baseLevel: Number(e.target.value)})} 
                />
              </div>
            </div>
          </div>

          {/* Кнопка отправки и ошибки */}
          <div className="pt-4 space-y-4">
            {error && (
              <div className="text-sm font-medium text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                Клуб успешно добавлен в систему
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Добавить клуб <ChevronRight size={20}/></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}