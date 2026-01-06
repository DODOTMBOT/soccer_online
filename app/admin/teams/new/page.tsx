"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Loader2, 
  ArrowLeft,
  ImageIcon,
  Globe,
  Map,
  Plus,
  Info,
  UserCheck,
  Building2,
  DollarSign,
  ChevronRight // Добавьте этот импорт
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";

interface Country { id: string; name: string; }
interface League { id: string; name: string; countryId: string; }
interface Manager { id: string; login: string; name: string | null; surname: string | null; }

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);

  const [form, setForm] = useState({
    name: "",
    logo: "",
    countryId: "",
    leagueId: "",
    stadium: "",
    finances: 0,
    baseLevel: 1, // Новое поле из схемы
    managerId: "", // Новое поле из схемы
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, leaguesRes, managersRes] = await Promise.all([
          fetch("/api/admin/countries"),
          fetch("/api/admin/leagues"),
          fetch("/api/admin/users/available-managers") // Эндпоинт для получения юзеров без клубов
        ]);
        
        if (countriesRes.ok) setCountries(await countriesRes.json());
        if (leaguesRes.ok) setLeagues(await leaguesRes.json());
        if (managersRes.ok) setAvailableManagers(await managersRes.json());
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
          // Преобразуем в null если менеджер не выбран (клуб может быть без менеджера)
          managerId: form.managerId || null,
          finances: Number(form.finances),
          baseLevel: Number(form.baseLevel)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при сохранении клуба");

      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(l => l.countryId === form.countryId);

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans">
      <Sidebar />

      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0 shadow-sm">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/teams" className="text-gray-400 hover:text-[#000c2d] transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#000c2d]">
              Создание <span className="text-[#e30613]">профессионального клуба</span>
            </h1>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-12 gap-8">
          
          {/* ФОРМА (Слева) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#1a3151] px-6 py-2.5 flex items-center gap-2">
                <Building2 size={14} className="text-white/50" />
                <h2 className="text-[9px] font-black text-white uppercase tracking-widest">Основная информация</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Название клуба</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2.5 text-xs font-bold focus:border-[#1a3151] outline-none" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Стадион</label>
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2.5 text-xs font-bold focus:border-[#1a3151] outline-none" 
                      value={form.stadium}
                      onChange={e => setForm({...form, stadium: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">URL Логотипа</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2.5 text-xs font-bold focus:border-[#1a3151] outline-none" 
                      value={form.logo}
                      onChange={e => setForm({...form, logo: e.target.value})}
                    />
                    <ImageIcon className="absolute right-3 top-2.5 text-gray-300" size={16} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Страна</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2.5 text-xs font-bold outline-none"
                      value={form.countryId}
                      onChange={e => setForm({...form, countryId: e.target.value, leagueId: ""})}
                    >
                      <option value="">Выбрать...</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Дивизион</label>
                    <select 
                      disabled={!form.countryId}
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2.5 text-xs font-bold outline-none disabled:opacity-50"
                      value={form.leagueId}
                      onChange={e => setForm({...form, leagueId: e.target.value})}
                    >
                      <option value="">Выбрать...</option>
                      {filteredLeagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* ПАРАМЕТРЫ КЛУБА */}
                <div className="bg-[#f8fafc] p-4 border border-gray-100 grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Бюджет ($)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-white border border-gray-200 rounded-sm px-8 py-2.5 text-xs font-bold outline-none focus:border-emerald-500" 
                        value={form.finances}
                        onChange={e => setForm({...form, finances: Number(e.target.value)})}
                      />
                      <DollarSign className="absolute left-2.5 top-2.5 text-emerald-500" size={14} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider italic">Уровень базы (1-10)</label>
                    <input 
                      type="range" min="1" max="10"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a3151] mt-4"
                      value={form.baseLevel}
                      onChange={e => setForm({...form, baseLevel: Number(e.target.value)})}
                    />
                    <div className="text-right text-[10px] font-black text-[#1a3151]">LVL: {form.baseLevel}</div>
                  </div>
                </div>

                {error && <div className="text-[10px] font-black text-[#e30613] uppercase bg-red-50 p-3 border-l-2 border-[#e30613]">{error}</div>}
                {success && <div className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 p-3 border-l-2 border-emerald-600 italic">Клуб успешно зарегистрирован в системе</div>}

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" disabled={loading}
                    className="bg-[#000c2d] text-white px-12 py-3.5 rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-[#e30613] transition-all flex items-center gap-3 shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <>Активировать клуб <ChevronRight size={14}/></>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* МЕНЕДЖЕР (Справа) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#000c2d] px-6 py-2.5 flex items-center gap-2">
                <UserCheck size={14} className="text-white/50" />
                <h2 className="text-[9px] font-black text-white uppercase tracking-widest">Назначить менеджера</h2>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-medium text-gray-400 mb-4 leading-relaxed uppercase">
                  Выберите специалиста, который возглавит команду. Вы можете оставить это поле пустым (команда будет под управлением ИИ).
                </p>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-3 text-xs font-bold outline-none"
                  value={form.managerId}
                  onChange={e => setForm({...form, managerId: e.target.value})}
                >
                  <option value="">Без менеджера (ИИ)</option>
                  {availableManagers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.surname} {m.name} ({m.login})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#1a3151] p-6 text-white rounded-sm shadow-xl relative overflow-hidden group">
              <Info className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24 group-hover:rotate-12 transition-transform" />
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 text-[#e30613]">Системная справка</h4>
              <ul className="text-[10px] space-y-2 font-medium opacity-80 uppercase leading-tight">
                <li>• Бюджет влияет на лимиты зарплат игроков</li>
                <li>• Уровень базы ускоряет регенерацию усталости</li>
                <li>• Наличие менеджера открывает ручное управление составом</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}