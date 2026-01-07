"use client";

import { useState } from "react";
import { 
  Loader2, Zap, Trash2, Plus, Globe, Shield, Database, Activity, Star, Brain, Dumbbell, Dices
} from "lucide-react";
import { FITNESS_RULES, FORM_CURVE } from "@/src/server/domain/rules/fitness"; // Импорт правил

interface Team { id: string; name: string; }
interface Country { id: string; name: string; }

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateWeightedValue = (type: 'potential' | 'injury') => {
  const rnd = Math.random() * 100;
  if (type === 'potential') {
    if (rnd <= 1) return getRandomInt(0, 29);
    if (rnd <= 21) return getRandomInt(30, 50);
    if (rnd <= 61) return getRandomInt(51, 60);
    if (rnd <= 81) return getRandomInt(61, 70);
    if (rnd <= 93) return getRandomInt(71, 90);
    return getRandomInt(91, 100);
  } else {
    if (rnd <= 12) return getRandomInt(0, 29);
    if (rnd <= 32) return getRandomInt(30, 50);
    if (rnd <= 72) return getRandomInt(51, 60);
    if (rnd <= 92) return getRandomInt(61, 70);
    if (rnd <= 99) return getRandomInt(71, 90);
    return getRandomInt(91, 100);
  }
};

const ALL_SPEC_KEYS = [
  "specKr", "specKt", "specRv", "specVp", "specIbm", "specKp",
  "specZv", "specSt", "specL", "specKi", "specPhys", "specLong",
  "specInt", "specAnt", "specSpd", "specGkRea", "specGkPos"
];

interface PlayerFormProps {
  teams: Team[];
  countries: Country[];
  positions?: string[];
  schools?: string[];
}

export default function PlayerForm({ 
  teams = [], 
  countries = [], 
  positions = ["GK", "LD", "CD", "RD", "LM", "CM", "RM", "LF", "CF", "RF"], 
  schools = ["POWER", "TECH", "SPEED", "BALANCED"] 
}: PlayerFormProps) {
  const [isBulk, setIsBulk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [teamId, setTeamId] = useState(teams[0]?.id || "");
  const [countryId, setCountryId] = useState(countries[0]?.id || "");

  const initialPlayerState = {
    tempId: "", firstName: "", lastName: "", age: "18", 
    mainPosition: positions[0] || "CD", sidePosition: "",
    power: "40", school: schools[0] || "POWER",
    potential: "0", injuryProne: "0",
    formIndex: 0, // Изначальный индекс
    specKr: "0", specKt: "0", specRv: "0", specVp: "0", specIbm: "0", specKp: "0",
    specZv: "0", specSt: "0", specL: "0", specKi: "0", specPhys: "0", specLong: "0",
    specInt: "0", specAnt: "0", specSpd: "0", specGkRea: "0", specGkPos: "0"
  };

  const createNewPlayer = () => ({
    ...initialPlayerState,
    tempId: Math.random().toString(36).substr(2, 9),
    potential: generateWeightedValue('potential').toString(),
    injuryProne: generateWeightedValue('injury').toString(),
    // РАНДОМНЫЙ СТАРТ ПО СИНУСОИДЕ (от 0 до 11)
    formIndex: Math.floor(Math.random() * FORM_CURVE.length)
  });

  const [singleForm, setSingleForm] = useState({ ...createNewPlayer(), tempId: "single" });
  const [bulkPlayers, setBulkPlayers] = useState([createNewPlayer()]);

  const getTotalSpecs = (player: any) => {
    return ALL_SPEC_KEYS.reduce((sum, key) => sum + parseInt(player[key] || "0"), 0);
  };

  const updateBulkPlayer = (index: number, field: string, value: any) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const updateSinglePlayer = (field: string, value: any) => {
    setSingleForm(prev => ({ ...prev, [field]: value }));
  };

  // Регенерация формы (отдельная кнопка если нужно)
  const regenerateForm = (isTable: boolean, index: number) => {
    const newIdx = Math.floor(Math.random() * FORM_CURVE.length);
    if (isTable) updateBulkPlayer(index, 'formIndex', newIdx);
    else updateSinglePlayer('formIndex', newIdx);
  };

  const regenerateStat = (isTable: boolean, index: number, field: 'potential' | 'injury') => {
    const newValue = generateWeightedValue(field).toString();
    if (isTable) updateBulkPlayer(index, field === 'potential' ? 'potential' : 'injuryProne', newValue);
    else updateSinglePlayer(field === 'potential' ? 'potential' : 'injuryProne', newValue);
  };

  const addRow = () => setBulkPlayers([...bulkPlayers, createNewPlayer()]);
  const removeRow = (index: number) => {
    if (bulkPlayers.length > 1) setBulkPlayers(bulkPlayers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const prepareData = (p: any) => {
        const data: any = { 
            ...p, 
            teamId, 
            countryId, 
            age: parseInt(p.age), 
            power: parseInt(p.power),
            potential: parseInt(p.potential),
            injuryProne: parseInt(p.injuryProne),
            formIndex: p.formIndex, // Отправляем индекс в БД
            sidePosition: p.sidePosition || null
        };
        ALL_SPEC_KEYS.forEach(key => data[key] = parseInt(p[key]));
        return data;
      };
      const payload = isBulk ? bulkPlayers.map(prepareData) : [prepareData(singleForm)];
      
      const res = await fetch("/api/admin/players/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка при сохранении контрактов");
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (isBulk) setBulkPlayers([createNewPlayer()]);
      else setSingleForm({ ...createNewPlayer(), tempId: "single" });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const renderSpecSelect = (field: string, isTable = false, bulkIndex?: number, label?: string) => {
    const player = isTable ? bulkPlayers[bulkIndex!] : singleForm;
    const currentVal = parseInt((player as any)[field] || "0");
    const totalWithoutCurrent = getTotalSpecs(player) - currentVal;
    const remaining = 16 - totalWithoutCurrent;

    return (
      <div key={field + (isTable ? player.tempId : "single")} className={!isTable ? "flex flex-col items-center gap-1" : ""}>
        {!isTable && label && <span className="text-[9px] font-bold text-gray-500 uppercase text-center whitespace-nowrap">{label}</span>}
        <select 
          className={`bg-white border border-gray-200 text-[10px] font-bold p-1 outline-none rounded-sm cursor-pointer text-center ${!isTable ? 'w-full py-2' : 'min-w-[35px]'} ${remaining <= 0 && currentVal === 0 ? 'opacity-30' : ''}`}
          value={currentVal} 
          onChange={e => {
            const val = e.target.value;
            if (isTable) updateBulkPlayer(bulkIndex!, field, val);
            else updateSinglePlayer(field, val);
          }}
        >
          {[0, 1, 2, 3, 4].map(v => (
            <option key={v} value={v} disabled={v > remaining}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const SPEC_GROUPS = {
    basics: [{ k: "specKr", l: "Креатив" }, { k: "specKt", l: "Контроль" }, { k: "specRv", l: "Рывки" }, { k: "specVp", l: "Верт.пер" }, { k: "specIbm", l: "б/мяча" }, { k: "specKp", l: "Компакт" }],
    advanced: [{ k: "specZv", l: "Заверш" }, { k: "specSt", l: "Станд" }, { k: "specL", l: "Лидер" }, { k: "specKi", l: "Легенда" }, { k: "specPhys", l: "Физика" }, { k: "specLong", l: "Дальний" }],
    mental: [{ k: "specInt", l: "Перехв" }, { k: "specAnt", l: "Предчув" }, { k: "specSpd", l: "Скор" }, { k: "specGkRea", l: "Реакц" }, { k: "specGkPos", l: "Позиц" }]
  };

  return (
    <div className="w-full">
      <div className="flex bg-[#1a3151] border-b border-white/10 px-2 shadow-md">
        <button type="button" onClick={() => setIsBulk(false)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${!isBulk ? 'border-[#e30613] text-white' : 'border-transparent text-white/40 hover:text-white'}`}>Одиночный контракт</button>
        <button type="button" onClick={() => setIsBulk(true)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${isBulk ? 'border-[#e30613] text-white' : 'border-transparent text-white/40 hover:text-white'}`}>Групповая заявка</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 shadow-sm p-6 space-y-6">
        
        <div className="flex justify-between items-center bg-[#f8fafc] border border-gray-200 p-5 rounded-sm">
           <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-[#1a3151]"/>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Клуб</span>
                    <select className="text-sm font-black uppercase outline-none bg-transparent" value={teamId} onChange={e => setTeamId(e.target.value)}>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#e30613]"/>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Нац. состав</span>
                    <select className="text-sm font-black uppercase outline-none bg-transparent" value={countryId} onChange={e => setCountryId(e.target.value)}>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
              </div>
           </div>

           {!isBulk && (
             <div className="flex gap-10 items-center">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Начальная форма</span>
                    <span className={`text-xl font-black italic text-emerald-600`}>
                      {FITNESS_RULES.getFormPercentage(singleForm.formIndex)}%
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Слоты специализаций</span>
                    <span className={`text-xl font-black italic ${getTotalSpecs(singleForm) >= 16 ? 'text-red-600' : 'text-[#1a3151]'}`}>
                      {getTotalSpecs(singleForm)} / 16
                    </span>
                </div>
             </div>
           )}
        </div>

        {!isBulk ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-400">Личные данные</label>
                   <div className="flex gap-2">
                    <input required placeholder="ИМЯ" className="w-1/2 border border-gray-300 p-3 text-xs font-bold uppercase outline-none focus:border-[#e30613]" value={singleForm.firstName} onChange={e => updateSinglePlayer("firstName", e.target.value)} />
                    <input required placeholder="ФАМИЛИЯ" className="w-1/2 border border-gray-300 p-3 text-xs font-bold uppercase outline-none focus:border-[#e30613]" value={singleForm.lastName} onChange={e => updateSinglePlayer("lastName", e.target.value)} />
                   </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Возраст</label>
                    <input type="number" className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.age} onChange={e => updateSinglePlayer("age", e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Сила (RS)</label>
                    <input type="number" className="w-full border border-gray-300 p-3 text-xs font-bold outline-none text-[#e30613]" value={singleForm.power} onChange={e => updateSinglePlayer("power", e.target.value)} />
                </div>
             </div>

             <div className="grid grid-cols-4 gap-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Позиция</label>
                    <select className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.mainPosition} onChange={e => updateSinglePlayer("mainPosition", e.target.value)}>
                       {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Вторая поз.</label>
                    <select className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.sidePosition} onChange={e => updateSinglePlayer("sidePosition", e.target.value)}>
                       <option value="">НЕТ</option>
                       {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Травматичность</label>
                    <div className="flex items-center gap-1">
                       <input readOnly className="w-full bg-gray-50 border border-gray-300 p-3 text-xs font-bold text-center" value={singleForm.injuryProne} />
                       <button type="button" onClick={() => regenerateStat(false, 0, 'injury')} className="p-3 bg-[#1a3151] text-white rounded-sm hover:bg-[#e30613] transition-colors"><Dices size={14} /></button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Потенциал</label>
                    <div className="flex items-center gap-1">
                       <input readOnly className="w-full bg-gray-50 border border-gray-300 p-3 text-xs font-bold text-center" value={singleForm.potential} />
                       <button type="button" onClick={() => regenerateStat(false, 0, 'potential')} className="p-3 bg-[#1a3151] text-white rounded-sm hover:bg-[#e30613] transition-colors"><Dices size={14} /></button>
                    </div>
                </div>
             </div>
             
             {/* ДОБАВЛЕННЫЙ БЛОК ФИЗ. ФОРМЫ В ОДИНОЧНОЙ ФОРМЕ */}
             <div className="bg-[#f0f9ff] border border-blue-100 p-4 rounded-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Activity className="text-blue-600" size={20}/>
                    <div>
                        <p className="text-[10px] font-black uppercase text-blue-900">Начальная физическая форма</p>
                        <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tight">Влияет на Реальную Силу (RS) в первом туре</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-blue-700 italic">{FITNESS_RULES.getFormPercentage(singleForm.formIndex)}%</span>
                    <button type="button" onClick={() => regenerateForm(false, 0)} className="p-2 bg-blue-600 text-white rounded-sm hover:bg-[#e30613] transition-colors shadow-lg shadow-blue-200"><Dices size={16} /></button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 border border-gray-200">
                   <h3 className="text-[10px] font-black uppercase text-[#1a3151] mb-4 flex items-center gap-2 border-b pb-2 border-gray-200"><Brain size={14}/> Креатив / Тактика</h3>
                   <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                      {SPEC_GROUPS.basics.map(s => renderSpecSelect(s.k, false, undefined, s.l))}
                   </div>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200">
                   <h3 className="text-[10px] font-black uppercase text-[#e30613] mb-4 flex items-center gap-2 border-b pb-2 border-gray-200"><Star size={14}/> Атака / Физика</h3>
                   <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                      {SPEC_GROUPS.advanced.map(s => renderSpecSelect(s.k, false, undefined, s.l))}
                   </div>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200">
                   <h3 className="text-[10px] font-black uppercase text-emerald-700 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200"><Dumbbell size={14}/> GK / Ментальность</h3>
                   <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                      {SPEC_GROUPS.mental.map(s => renderSpecSelect(s.k, false, undefined, s.l))}
                   </div>
                </div>
             </div>
          </div>
        ) : (
          /* ================= МАССОВЫЙ (ТАБЛИЦА) ================= */
          <div className="border border-gray-300 overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1600px]">
                <thead className="bg-[#1a3151] text-white text-[9px] font-bold uppercase italic">
                  <tr>
                    <th className="p-3 w-10">№</th>
                    <th className="p-3 w-48">Фамилия Имя</th>
                    <th className="p-3 text-center w-14">RS</th>
                    <th className="p-3 text-center w-14">ФИЗ</th> {/* Столбец для физ формы */}
                    <th className="p-3 text-center w-20">СЛОТЫ</th>
                    <th className="p-3 text-center w-24">ТР / ПОТ</th>
                    {Object.values(SPEC_GROUPS).flat().map(s => (
                      <th key={s.k} className="p-1 text-center w-14 border-l border-white/10" title={s.l}>{s.l.substring(0,5)}</th>
                    ))}
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPlayers.map((p, idx) => (
                    <tr key={p.tempId} className={`border-b border-gray-100 hover:bg-emerald-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-2 text-center text-[10px] font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <input className="w-1/2 bg-transparent border-b p-1 text-[10px] font-bold uppercase outline-none focus:border-[#e30613]" placeholder="ИМЯ" value={p.firstName} onChange={e => updateBulkPlayer(idx, "firstName", e.target.value)} />
                          <input className="w-1/2 bg-transparent border-b p-1 text-[10px] font-bold uppercase outline-none focus:border-[#e30613]" placeholder="ФАМИЛИЯ" value={p.lastName} onChange={e => updateBulkPlayer(idx, "lastName", e.target.value)} />
                        </div>
                      </td>
                      <td className="p-2"><input type="number" className="w-full text-center font-black text-[10px] text-[#e30613] bg-transparent outline-none" value={p.power} onChange={e => updateBulkPlayer(idx, "power", e.target.value)} /></td>
                      
                      {/* ОТОБРАЖЕНИЕ ФОРМЫ В ТАБЛИЦЕ */}
                      <td className="p-2 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-blue-600">{FITNESS_RULES.getFormPercentage(p.formIndex)}%</span>
                            <button type="button" onClick={() => regenerateForm(true, idx)} className="text-gray-300 hover:text-blue-600"><Dices size={10}/></button>
                         </div>
                      </td>

                      <td className={`p-2 text-center font-black text-[10px] italic ${getTotalSpecs(p) >= 16 ? 'text-red-600' : 'text-gray-400'}`}>
                        {getTotalSpecs(p)} / 16
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2 text-[9px] font-black">
                          <span className="text-orange-600">{p.injuryProne}</span>
                          <span className="text-gray-300">/</span>
                          <span className="text-blue-600">{p.potential}</span>
                          <button type="button" onClick={() => {regenerateStat(true, idx, 'injury'); regenerateStat(true, idx, 'potential');}} className="text-gray-300 hover:text-[#1a3151]"><Dices size={12}/></button>
                        </div>
                      </td>
                      {Object.values(SPEC_GROUPS).flat().map(s => (
                         <td key={s.k} className="p-1 border-l border-gray-100">{renderSpecSelect(s.k, true, idx)}</td>
                      ))}
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-600 transition-colors" disabled={bulkPlayers.length === 1}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addRow} className="w-full py-4 bg-[#f8fafc] text-[10px] font-black uppercase text-[#1a3151] hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 border-t border-gray-200">
              <Plus size={14} /> Добавить новую строку в реестр
            </button>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 rounded-sm">
          <Activity size={16} className="text-emerald-600" />
          <p className="text-[10px] text-emerald-800 font-bold uppercase italic tracking-tight">
             Система автоматически проверяет суммарный лимит специализаций (макс. 16) и назначает стартовую физ. форму игрока.
          </p>
        </div>

        <div className="flex justify-end gap-6 items-center pt-4">
          {error && <span className="text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 px-4 py-2 border border-red-100">{error}</span>}
          {success && <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 border border-emerald-100 animate-pulse">Контракты успешно активированы</span>}
          <button type="submit" disabled={loading} className="bg-[#000c2d] hover:bg-[#e30613] text-white px-16 py-5 font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl disabled:opacity-50 group">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} className="group-hover:text-yellow-400 transition-colors" fill="currentColor" /> Активировать контракты</>}
          </button>
        </div>
      </form>
    </div>
  );
}