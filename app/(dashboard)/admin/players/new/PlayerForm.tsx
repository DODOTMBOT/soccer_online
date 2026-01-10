"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Loader2, Zap, Trash2, Plus, Database, Star, X, Settings2, Filter, ChevronDown, Search, UserPlus
} from "lucide-react";
import { PlayStyleDefinition } from "@prisma/client";

// --- ИНТЕРФЕЙСЫ ---
interface Team { id: string; name: string; countryId: string; }
interface Country { id: string; name: string; }

interface SelectedPlayStyle {
  definitionId: string;
  code: string;
  level: "BRONZE" | "SILVER" | "GOLD";
}

interface PlayerFormProps {
  teams: Team[];
  countries: Country[];
  playStyleDefinitions: PlayStyleDefinition[];
  positions?: string[];
}

type RangeConfig = { min: number; max: number; chance: number };

const PLAYSTYLE_CATEGORIES: Record<string, string[]> = {
  "Атака": ["Удар на технику", "Мощный удар", "Тривела"],
  "Пасы": ["Разрезающий пас", "Длинный пас", "Первое касание"],
  "Защита": ["Подкат", "Офсайдная ловушка", "Опека", "Man Marking"],
  "Физика": ["Атлетизм"],
  "Вратарские": ["Игра ногами", "Игра на выходе", "Игра 1 в 1", "Отражение пенальти"],
  "Ментальные": ["Лидер", "Кумир", "Капитан"],
  "Стилевые": ["Скорость", "Трюкач", "Тики Така", "Триггер", "Дисциплина", "Компактность"]
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ГЕНЕРАЦИИ ---
const getWeightedRandom = (ranges: RangeConfig[]) => {
  const totalChance = ranges.reduce((acc, r) => acc + r.chance, 0);
  let random = Math.random() * totalChance;
  for (const range of ranges) {
    if (random < range.chance) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    random -= range.chance;
  }
  return ranges[0].min;
};

const generatePotential = () => getWeightedRandom([
  { min: 0,  max: 29,  chance: 1 },
  { min: 30, max: 50,  chance: 20 },
  { min: 51, max: 60,  chance: 40 },
  { min: 61, max: 70,  chance: 20 },
  { min: 71, max: 90,  chance: 12 },
  { min: 91, max: 99,  chance: 7 },
]);

const generateInjury = () => getWeightedRandom([
  { min: 0,  max: 29,  chance: 12 },
  { min: 30, max: 50,  chance: 20 },
  { min: 51, max: 60,  chance: 40 },
  { min: 61, max: 70,  chance: 20 },
  { min: 71, max: 90,  chance: 7 },
  { min: 91, max: 99,  chance: 1 },
]);

const SearchableCountrySelect = ({ value, countries, onChange, placeholder = "Выберите..." }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedName = useMemo(() => countries.find((c: any) => c.id === value)?.name || "", [countries, value]);
  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [countries, search]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 220)
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full text-xs font-medium bg-transparent border-b border-gray-100 hover:border-emerald-300 cursor-pointer flex items-center justify-between py-1.5 transition-colors">
        <span className="truncate">{selectedName || <span className="text-gray-400">{placeholder}</span>}</span>
        <ChevronDown size={14} className="text-gray-400 ml-1" />
      </div>

      {isOpen && (
        <div 
          className="fixed z-[99999] bg-white border border-emerald-500 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 mt-1"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          <div className="flex items-center px-3 py-2 border-b border-gray-50 bg-gray-50">
            <Search size={12} className="text-gray-400 mr-2"/>
            <input autoFocus className="w-full text-xs font-medium outline-none bg-transparent" placeholder="Поиск нации..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCountries.map((c: any) => (
              <div 
                key={c.id} 
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  onChange(c.id); 
                  setIsOpen(false); 
                }} 
                className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors hover:bg-emerald-50 ${c.id === value ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-gray-700'}`}
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PlayerForm({ 
  teams = [], countries = [], playStyleDefinitions = [],
  positions = ["GK", "LD", "CD", "RD", "LM", "CM", "RM", "LF", "CF", "RF"]
}: PlayerFormProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchCountryId, setSearchCountryId] = useState(countries[0]?.id || "");
  const [globalTeamId, setGlobalTeamId] = useState("");
  const [editingStylesIndex, setEditingStylesIndex] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const filteredTeams = useMemo(() => teams.filter(t => t.countryId === searchCountryId), [teams, searchCountryId]);

  useEffect(() => {
    if (filteredTeams.length > 0) setGlobalTeamId(filteredTeams[0].id);
    else setGlobalTeamId("");
  }, [filteredTeams]);

  const createNewPlayer = (countryId: string) => ({
    tempId: Math.random().toString(36).substr(2, 9),
    firstName: "",
    lastName: "",
    age: "18", 
    mainPosition: "CD",
    power: "40", 
    potential: generatePotential().toString(),
    injuryProne: generateInjury().toString(),
    playStyles: [] as SelectedPlayStyle[],
    countryId: countryId 
  });

  const [bulkPlayers, setBulkPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (mounted && bulkPlayers.length === 0) {
      setBulkPlayers([createNewPlayer(countries[0]?.id || "")]);
    }
  }, [mounted]);

  const updateBulk = (index: number, field: string, value: any) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const removeRow = (index: number) => {
    if (bulkPlayers.length > 1) {
      setBulkPlayers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleStyleLevel = (playerIndex: number, def: PlayStyleDefinition) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      const player = { ...newArr[playerIndex] };
      const currentStyles = [...player.playStyles];
      const existingIndex = currentStyles.findIndex(s => s.definitionId === def.id);

      // Цикл: Нет -> BRONZE -> SILVER -> GOLD -> Удаление
      if (existingIndex === -1) {
        if (currentStyles.length < 5) {
          currentStyles.push({ definitionId: def.id, code: def.code, level: "BRONZE" });
        }
      } else {
        const currentLevel = currentStyles[existingIndex].level;
        if (currentLevel === "BRONZE") {
          currentStyles[existingIndex] = { ...currentStyles[existingIndex], level: "SILVER" };
        } else if (currentLevel === "SILVER") {
          currentStyles[existingIndex] = { ...currentStyles[existingIndex], level: "GOLD" };
        } else {
          currentStyles.splice(existingIndex, 1);
        }
      }
      
      player.playStyles = currentStyles;
      newArr[playerIndex] = player;
      return newArr;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalTeamId) { setError("Выберите клуб!"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = bulkPlayers.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          age: parseInt(p.age),
          power: parseInt(p.power),
          potential: parseInt(p.potential),
          injuryProne: parseInt(p.injuryProne),
          mainPosition: p.mainPosition,
          teamId: globalTeamId,
          countryId: p.countryId,
          playStyles: p.playStyles.map((ps: any) => ({ definitionId: ps.definitionId, level: ps.level }))
      }));
      const res = await fetch("/api/admin/players/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setBulkPlayers([createNewPlayer(countries[0]?.id || "")]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const categorizedDefs = useMemo(() => {
    return Object.entries(PLAYSTYLE_CATEGORIES).map(([catName, names]) => ({
      title: catName,
      items: playStyleDefinitions.filter(d => names.some(n => d.name.includes(n)))
    }));
  }, [playStyleDefinitions]);

  if (!mounted) return null;

  return (
    <div className="w-full space-y-6 pb-60">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Filter size={20}/></div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">1. Фильтр страны клуба</label>
              <SearchableCountrySelect value={searchCountryId} countries={countries} onChange={setSearchCountryId} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Database size={20}/></div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2. Целевой клуб</label>
              <select className="w-full text-sm font-bold text-gray-800 bg-transparent border-b border-gray-100 py-1.5 outline-none cursor-pointer focus:border-emerald-300" value={globalTeamId} onChange={e => setGlobalTeamId(e.target.value)}>
                {filteredTeams.length > 0 ? filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>) : <option>Нет клубов</option>}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4 w-12 text-center">№</th>
              <th className="px-6 py-4 w-48">Нация</th>
              <th className="px-6 py-4">Фамилия и Имя</th>
              <th className="px-4 py-4 w-16 text-center">Возр</th>
              <th className="px-4 py-4 w-16 text-center">Сила</th>
              <th className="px-4 py-4 w-20 text-center">Поз</th>
              <th className="px-4 py-4 w-16 text-center text-blue-500">Пот</th>
              <th className="px-4 py-4 w-16 text-center text-orange-500">Травм</th>
              <th className="px-6 py-4 w-24 text-center">Стили</th>
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bulkPlayers.map((p, idx) => (
              <tr key={p.tempId} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-3 text-center text-xs font-bold text-gray-300">{idx + 1}</td>
                <td className="px-6 py-3">
                  <SearchableCountrySelect value={p.countryId} countries={countries} onChange={(val: any) => updateBulk(idx, "countryId", val)} />
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-3 text-sm font-bold text-gray-900">
                    <input className="w-full bg-transparent outline-none border-b border-transparent focus:border-emerald-500 py-1" placeholder="Имя" value={p.firstName} onChange={e => updateBulk(idx, "firstName", e.target.value)} />
                    <input className="w-full bg-transparent outline-none border-b border-transparent focus:border-emerald-500 py-1" placeholder="Фамилия" value={p.lastName} onChange={e => updateBulk(idx, "lastName", e.target.value)} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center"><input type="number" className="w-12 text-center text-sm font-medium bg-transparent outline-none tabular-nums" value={p.age} onChange={e => updateBulk(idx, "age", e.target.value)} /></td>
                <td className="px-4 py-3 text-center"><input type="number" className="w-12 text-center text-sm font-bold text-emerald-600 bg-transparent outline-none tabular-nums" value={p.power} onChange={e => updateBulk(idx, "power", e.target.value)} /></td>
                <td className="px-4 py-3 text-center">
                  <select className="text-xs font-bold bg-transparent outline-none cursor-pointer text-gray-600" value={p.mainPosition} onChange={e => updateBulk(idx, "mainPosition", e.target.value)}>
                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-center"><input type="number" className="w-12 text-center text-sm font-bold text-blue-500 bg-transparent outline-none italic tabular-nums" value={p.potential} onChange={e => updateBulk(idx, "potential", e.target.value)} /></td>
                <td className="px-4 py-3 text-center"><input type="number" className="w-12 text-center text-sm font-bold text-orange-500 bg-transparent outline-none italic tabular-nums" value={p.injuryProne} onChange={e => updateBulk(idx, "injuryProne", e.target.value)} /></td>
                <td className="px-6 py-3 text-center">
                  <button type="button" onClick={() => setEditingStylesIndex(idx)} className={`p-2 rounded-lg border transition-all ${p.playStyles.length > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                    {p.playStyles.length > 0 ? <div className="flex items-center gap-1 font-bold text-[10px]"><Star size={12} fill="currentColor"/> {p.playStyles.length}</div> : <Settings2 size={14} />}
                  </button>
                </td>
                <td className="px-6 py-3 text-right">
                  <button type="button" onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => setBulkPlayers([...bulkPlayers, createNewPlayer(bulkPlayers[bulkPlayers.length-1].countryId)])} className="w-full py-4 bg-gray-50/50 hover:bg-gray-50 text-xs font-bold text-gray-500 flex items-center justify-center gap-2 transition-all border-t border-gray-50 uppercase tracking-widest">
          <Plus size={14} /> Добавить строку
        </button>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-4">
          {error && <div className="px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 uppercase tracking-widest">{error}</div>}
          {success && <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 italic font-medium uppercase tracking-widest">Успешно зарегистрировано</div>}
        </div>
        <button type="submit" onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all flex items-center gap-3 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Зарегистрировать состав</>}
        </button>
      </div>

      {/* Модалка плейстайлов */}
      {editingStylesIndex !== null && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <Star className="text-emerald-500" /> Настройка стилей: {bulkPlayers[editingStylesIndex].lastName || 'игрок'}
              </h3>
              <button type="button" onClick={() => setEditingStylesIndex(null)} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 bg-gray-50/30">
              {categorizedDefs.map(cat => (
                cat.items.length > 0 && (
                  <div key={cat.title}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">{cat.title}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {cat.items.map(def => {
                        const sel = bulkPlayers[editingStylesIndex].playStyles.find((s: any) => s.definitionId === def.id);
                        return (
                          <button key={def.id} type="button" onClick={() => toggleStyleLevel(editingStylesIndex, def)} className={`p-4 rounded-2xl border text-left transition-all relative group h-16 flex items-center ${sel ? 'bg-white border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-white border-gray-100 hover:border-emerald-200'}`}>
                            <div className="text-[10px] font-bold text-gray-800 leading-tight uppercase pr-4">{def.name}</div>
                            {sel && (
                              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                                sel.level === "BRONZE" ? "bg-orange-500" : 
                                sel.level === "SILVER" ? "bg-slate-400" : 
                                "bg-yellow-400"
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </div>
            <div className="px-8 py-5 bg-white border-t border-gray-50 flex justify-end">
              <button type="button" onClick={() => setEditingStylesIndex(null)} className="px-8 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest">Готово</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}