"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Loader2, Zap, Trash2, Plus, Database, Star, X, Settings2, Filter, ChevronDown, Search
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

// --- КАТЕГОРИИ СТИЛЕЙ ---
const PLAYSTYLE_CATEGORIES: Record<string, string[]> = {
  "АТАКА": ["Удар на технику", "Мощный удар", "Тривела"],
  "ПАСЫ": ["Разрезающий пас", "Длинный пас", "Первое касание"],
  "ЗАЩИТА": ["Подкат", "Офсайдная ловушка", "Опека", "Man Marking"],
  "ФИЗИКА": ["Атлетизм"],
  "ВРАТАРСКИЕ": ["Игра ногами", "Игра на выходе", "Игра 1 в 1", "Отражение пенальти"],
  "МЕНТАЛЬНЫЕ": ["Лидер", "Кумир", "Капитан"],
  "СТИЛЕВЫЕ": [
    "Скорость (Интенсив)", "Трюкач (Joga Bonito)", "Тики Така", 
    "Триггер (Гегенпрессинг)", "Дисциплина (Автобус)", "Компактность (Чоло)",
    "Скорость", "Трюкач", "Триггер", "Дисциплина", "Компактность"
  ]
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
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
  { min: 0,  max: 29, chance: 1 },
  { min: 30, max: 50, chance: 20 },
  { min: 51, max: 60, chance: 40 },
  { min: 61, max: 70, chance: 20 },
  { min: 71, max: 90, chance: 12 },
  { min: 91, max: 99, chance: 7 },
]);

const generateInjury = () => getWeightedRandom([
  { min: 0,  max: 29, chance: 12 },
  { min: 30, max: 50, chance: 20 },
  { min: 51, max: 60, chance: 40 },
  { min: 61, max: 70, chance: 20 },
  { min: 71, max: 90, chance: 7 },
  { min: 91, max: 99, chance: 1 },
]);

// --- КОМПОНЕНТ ДЛЯ ПОИСКА СТРАНЫ ---
const SearchableCountrySelect = ({ 
  value, 
  countries, 
  onChange, 
  placeholder = "Выберите..." 
}: { 
  value: string, 
  countries: Country[], 
  onChange: (val: string) => void,
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Находим имя выбранной страны
  const selectedName = useMemo(() => {
    return countries.find(c => c.id === value)?.name || "";
  }, [countries, value]);

  // Фильтрация
  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [countries, search]);

  // При открытии фокус и очистка, если нужно
  useEffect(() => {
    if (isOpen) {
      setSearch(""); // Очищаем поиск, чтобы показать все, или можно оставить selectedName
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {!isOpen ? (
        <div 
          onClick={() => setIsOpen(true)}
          className="w-full text-[10px] font-bold uppercase bg-transparent border-b border-gray-100 hover:border-gray-300 cursor-pointer flex items-center justify-between truncate py-1"
        >
          <span className="truncate">{selectedName || <span className="text-gray-400">{placeholder}</span>}</span>
          <ChevronDown size={10} className="text-gray-400 opacity-50 ml-1 shrink-0" />
        </div>
      ) : (
        <div className="absolute top-0 left-0 w-full min-w-[200px] z-[100] bg-white border border-blue-500 shadow-xl rounded-sm">
          <div className="flex items-center px-2 border-b border-gray-100">
            <Search size={10} className="text-gray-400 mr-2"/>
            <input
              autoFocus
              className="w-full py-2 text-[10px] font-bold uppercase outline-none bg-transparent"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => {
                // Небольшая задержка, чтобы успел сработать onClick по элементу списка
                setTimeout(() => setIsOpen(false), 200);
              }}
            />
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar bg-white">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => (
                <div
                  key={c.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Предотвращаем потерю фокуса input'а до клика
                    onChange(c.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-[10px] font-bold uppercase cursor-pointer hover:bg-blue-50 transition-colors ${c.id === value ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`}
                >
                  {c.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-[10px] text-gray-400 text-center">Нет совпадений</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function PlayerForm({ 
  teams = [], 
  countries = [], 
  playStyleDefinitions = [],
  positions = ["GK", "LD", "CD", "RD", "LM", "CM", "RM", "LF", "CF", "RF"]
}: PlayerFormProps) {
  const [isBulk, setIsBulk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [searchCountryId, setSearchCountryId] = useState(countries[0]?.id || "");
  
  const filteredTeams = useMemo(() => {
    return teams.filter(t => t.countryId === searchCountryId);
  }, [teams, searchCountryId]);

  const [globalTeamId, setGlobalTeamId] = useState("");

  useMemo(() => {
    if (filteredTeams.length > 0) {
        setGlobalTeamId(filteredTeams[0].id);
    } else {
        setGlobalTeamId(""); 
    }
  }, [filteredTeams]);

  const defaultPlayerCountryId = countries[0]?.id || "";

  const [editingStylesIndex, setEditingStylesIndex] = useState<number | null>(null);

  const createNewPlayer = (countryId: string) => ({
    tempId: Math.random().toString(36).substr(2, 9),
    firstName: "",
    lastName: "",
    age: "18", 
    mainPosition: positions[0] || "CD",
    sidePosition: "",
    power: "40", 
    potential: generatePotential().toString(),
    injuryProne: generateInjury().toString(),
    formIndex: 0,
    playStyles: [] as SelectedPlayStyle[],
    countryId: countryId 
  });

  const [singleForm, setSingleForm] = useState(createNewPlayer(defaultPlayerCountryId));
  const [bulkPlayers, setBulkPlayers] = useState([createNewPlayer(defaultPlayerCountryId)]);

  const updateBulk = (index: number, field: string, value: any) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const toggleStyleLevel = (playerIndex: number, def: PlayStyleDefinition) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      const player = { ...newArr[playerIndex] };
      const currentStyles = [...player.playStyles];
      
      const existingIndex = currentStyles.findIndex(s => s.definitionId === def.id);

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
        } else if (currentLevel === "GOLD") {
            currentStyles.splice(existingIndex, 1);
        }
      }

      player.playStyles = currentStyles;
      newArr[playerIndex] = player;
      return newArr;
    });
  };

  const addRow = () => {
    const lastUsedCountry = bulkPlayers.length > 0 
      ? bulkPlayers[bulkPlayers.length - 1].countryId 
      : defaultPlayerCountryId;
      
    setBulkPlayers([...bulkPlayers, createNewPlayer(lastUsedCountry)]);
  };

  const removeRow = (index: number) => {
    if (bulkPlayers.length > 1) setBulkPlayers(bulkPlayers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalTeamId) {
        setError("Выберите клуб!");
        return;
    }

    setLoading(true);
    setError("");
    try {
      const prepareData = (p: any) => ({ 
          firstName: p.firstName,
          lastName: p.lastName,
          age: parseInt(p.age),
          power: parseInt(p.power),
          potential: parseInt(p.potential),
          injuryProne: parseInt(p.injuryProne),
          mainPosition: p.mainPosition,
          sidePosition: p.sidePosition || null,
          teamId: globalTeamId,
          countryId: p.countryId,
          formIndex: p.formIndex,
          playStyles: p.playStyles.map((ps: SelectedPlayStyle) => ({
            definitionId: ps.definitionId,
            level: ps.level
          }))
      });

      const payload = isBulk ? bulkPlayers.map(prepareData) : [prepareData(singleForm)];
      
      const res = await fetch("/api/admin/players/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка при сохранении");
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      if (isBulk) setBulkPlayers([createNewPlayer(defaultPlayerCountryId)]);
      else setSingleForm(createNewPlayer(defaultPlayerCountryId));
      
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BRONZE": return "bg-orange-100 text-orange-800 border-orange-300";
      case "SILVER": return "bg-slate-200 text-slate-700 border-slate-300";
      case "GOLD": return "bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm";
      default: return "bg-white text-gray-400";
    }
  };

  const getCategorizedDefs = () => {
    const usedIds = new Set<string>();
    const categorized = Object.entries(PLAYSTYLE_CATEGORIES).map(([catName, styleNames]) => {
      const defs = playStyleDefinitions.filter(def => 
        styleNames.some(name => def.name.toLowerCase().includes(name.toLowerCase()))
      );
      defs.forEach(d => usedIds.add(d.id));
      return { title: catName, items: defs };
    });

    const others = playStyleDefinitions.filter(d => !usedIds.has(d.id));
    if (others.length > 0) {
      categorized.push({ title: "ДРУГИЕ", items: others });
    }

    return categorized;
  };

  return (
    <div className="w-full relative">
      <div className="flex bg-[#1a3151] border-b border-white/10 px-2 shadow-md">
        <button type="button" onClick={() => setIsBulk(false)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${!isBulk ? 'border-[#e30613] text-white' : 'border-transparent text-white/40 hover:text-white'}`}>Одиночный контракт</button>
        <button type="button" onClick={() => setIsBulk(true)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${isBulk ? 'border-[#e30613] text-white' : 'border-transparent text-white/40 hover:text-white'}`}>Групповая заявка</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 shadow-sm p-6 space-y-6">
        
        <div className="flex justify-between items-center bg-[#f8fafc] border border-gray-200 p-5 rounded-sm">
           <div className="flex flex-wrap gap-8 w-full">
              <div className="flex items-center gap-3 w-full md:w-1/3">
                <Filter size={18} className="text-gray-400"/>
                <div className="flex flex-col w-full">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">1. Страна клуба (Фильтр)</span>
                    {/* ЗАМЕНИЛ STANDARD SELECT НА SEARCHABLE */}
                    <SearchableCountrySelect 
                      value={searchCountryId}
                      countries={countries}
                      onChange={(val) => setSearchCountryId(val)}
                      placeholder="Фильтр стран..."
                    />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-1/3">
                <Database size={18} className="text-[#1a3151]"/>
                <div className="flex flex-col w-full">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">2. Клуб (для добавления)</span>
                    <select 
                        className="text-sm font-black uppercase outline-none bg-transparent w-full truncate" 
                        value={globalTeamId} 
                        onChange={e => setGlobalTeamId(e.target.value)}
                        disabled={filteredTeams.length === 0}
                    >
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                        ) : (
                            <option value="">Нет клубов в этой стране</option>
                        )}
                    </select>
                </div>
              </div>

           </div>
        </div>

        {!isBulk ? (
          <div className="p-10 text-center text-gray-400 text-xs uppercase font-bold">
            Переключитесь на вкладку "Групповая заявка" для массового создания
          </div>
        ) : (
          <div className="border border-gray-300 overflow-hidden shadow-sm relative">
             <div className="bg-blue-50 p-2 text-[10px] text-center text-blue-800 font-bold border-b border-blue-100 flex justify-center gap-4">
               <span>⚡️ Потенциал и травматичность генерируются автоматически (умный рандом)</span>
               <span>🛠 Нажмите на шестеренку, чтобы настроить PlayStyles</span>
             </div>
            <div className="overflow-visible"> {/* overflow-visible чтобы выпадающий список мог выходить за границы (если позволяет контейнер) */}
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a3151] text-white text-[9px] font-bold uppercase italic">
                  <tr>
                    <th className="p-3 w-8">№</th>
                    <th className="p-3 w-40">Нация</th>
                    <th className="p-3 w-1/4">Фамилия Имя</th>
                    <th className="p-3 text-center w-14">Возр</th>
                    <th className="p-3 text-center w-14">RS</th>
                    <th className="p-3 text-center w-16">Поз</th>
                    <th className="p-3 text-center w-14 text-blue-200">Пот</th>
                    <th className="p-3 text-center w-14 text-orange-200">Травм</th>
                    <th className="p-3 text-center w-20">Styles</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPlayers.map((p, idx) => (
                    <tr key={p.tempId} className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                      <td className="p-2 text-center text-[10px] font-bold text-gray-400">{idx + 1}</td>
                      
                      <td className="p-2 relative">
                        {/* ИСПОЛЬЗУЕМ КЛАССНЫЙ ПОИСК ВМЕСТО ОБЫЧНОГО SELECT */}
                        <SearchableCountrySelect 
                          value={p.countryId}
                          countries={countries}
                          onChange={(val) => updateBulk(idx, "countryId", val)}
                        />
                      </td>

                      <td className="p-2">
                        <div className="flex gap-2">
                          <input 
                            className="w-1/2 bg-transparent border-b border-gray-200 focus:border-[#e30613] p-1 text-[11px] font-black outline-none" 
                            placeholder="ИМЯ" 
                            value={p.firstName} 
                            onChange={e => updateBulk(idx, "firstName", e.target.value)} 
                          />
                          <input 
                            className="w-1/2 bg-transparent border-b border-gray-200 focus:border-[#e30613] p-1 text-[11px] font-black outline-none" 
                            placeholder="ФАМИЛИЯ" 
                            value={p.lastName} 
                            onChange={e => updateBulk(idx, "lastName", e.target.value)} 
                          />
                        </div>
                      </td>
                      <td className="p-2"><input type="number" className="w-full text-center font-bold text-[11px] bg-transparent outline-none border-b border-transparent focus:border-gray-300" value={p.age} onChange={e => updateBulk(idx, "age", e.target.value)} /></td>
                      <td className="p-2"><input type="number" className="w-full text-center font-black text-[12px] text-[#e30613] bg-transparent outline-none border-b border-transparent focus:border-[#e30613]" value={p.power} onChange={e => updateBulk(idx, "power", e.target.value)} /></td>
                      <td className="p-2">
                        <select className="w-full text-[11px] font-bold bg-transparent outline-none cursor-pointer" value={p.mainPosition} onChange={e => updateBulk(idx, "mainPosition", e.target.value)}>
                           {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                      </td>
                      <td className="p-2"><input type="number" className="w-full text-center font-bold text-[11px] text-blue-600 bg-transparent outline-none" value={p.potential} onChange={e => updateBulk(idx, "potential", e.target.value)} /></td>
                      <td className="p-2"><input type="number" className="w-full text-center font-bold text-[11px] text-orange-600 bg-transparent outline-none" value={p.injuryProne} onChange={e => updateBulk(idx, "injuryProne", e.target.value)} /></td>
                      
                      <td className="p-2 text-center">
                         <button 
                           type="button" 
                           onClick={() => setEditingStylesIndex(idx)}
                           className={`flex items-center justify-center gap-1 mx-auto px-2 py-1 rounded border text-[10px] font-bold uppercase transition-all ${p.playStyles.length > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400'}`}
                         >
                           {p.playStyles.length > 0 ? (
                             <><Star size={10} fill="currentColor"/> {p.playStyles.length}</>
                           ) : (
                             <Settings2 size={12} />
                           )}
                         </button>
                      </td>

                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-600" disabled={bulkPlayers.length === 1}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addRow} className="w-full py-4 bg-[#f8fafc] hover:bg-gray-100 text-[10px] font-black uppercase text-[#1a3151] flex items-center justify-center gap-2 border-t border-gray-200 transition-colors">
              <Plus size={14} /> Добавить строку
            </button>
          </div>
        )}

        {/* MODAL / OVERLAY ДЛЯ PLAYSTYLES */}
        {editingStylesIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
               <div className="bg-[#1a3151] text-white p-4 flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" />
                    Настройка стилей: <span className="text-yellow-400">{bulkPlayers[editingStylesIndex].lastName || "Игрок"}</span>
                  </h3>
                  <button type="button" onClick={() => setEditingStylesIndex(null)} className="hover:text-red-400"><X size={18}/></button>
               </div>
               
               <div className="p-6 bg-[#f8fafc] overflow-y-auto space-y-6">
                 {getCategorizedDefs().map(category => (
                   category.items.length > 0 && (
                     <div key={category.title}>
                       <h4 className="text-[#1a3151] font-extrabold text-[11px] uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                         {category.title}
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {category.items.map(def => {
                            const selected = bulkPlayers[editingStylesIndex].playStyles.find(s => s.definitionId === def.id);
                            const isMaxed = !selected && bulkPlayers[editingStylesIndex].playStyles.length >= 5;

                            return (
                              <button 
                                key={def.id}
                                type="button"
                                disabled={isMaxed}
                                onClick={() => toggleStyleLevel(editingStylesIndex, def)}
                                className={`
                                  p-3 border rounded text-left transition-all relative group h-14 flex items-center
                                  ${selected ? getLevelColor(selected.level) : isMaxed ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'bg-white hover:border-gray-400 hover:shadow-sm'}
                                `}
                              >
                                <div className="text-[10px] font-black uppercase pr-6 leading-tight">{def.name}</div>
                                
                                <div className="absolute top-2 right-2">
                                  {selected ? (
                                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                      selected.level === "BRONZE" ? "bg-orange-500" :
                                      selected.level === "SILVER" ? "bg-slate-400" : "bg-yellow-400"
                                    }`} />
                                  ) : (
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-200 group-hover:bg-gray-200" />
                                  )}
                                </div>
                              </button>
                            )
                          })}
                       </div>
                     </div>
                   )
                 ))}
               </div>
               
               <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center shrink-0">
                  <span className="text-[10px] text-gray-500 font-bold uppercase hidden md:inline">
                    Кликните для улучшения: Нет → Бронза → Серебро → Золото → Нет
                  </span>
                  <button type="button" onClick={() => setEditingStylesIndex(null)} className="bg-[#000c2d] text-white px-6 py-2 text-[10px] font-black uppercase rounded-sm hover:bg-[#1a3151] ml-auto">
                    Готово
                  </button>
               </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-6 items-center pt-4">
          {error && <span className="text-red-600 text-[10px] font-black uppercase bg-red-50 px-4 py-2">{error}</span>}
          {success && <span className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-4 py-2">Успешно</span>}
          <button type="submit" disabled={loading} className="bg-[#000c2d] hover:bg-[#e30613] text-white px-16 py-5 font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center gap-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} /> Создать {isBulk ? "группу" : "игрока"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}