"use client";

import { useState } from "react";
import { 
  Loader2, Zap, Trash2, Plus, Globe, Database, Activity, Dices, Star
} from "lucide-react";
import { FITNESS_RULES, FORM_CURVE } from "@/src/server/domain/rules/fitness";

interface Team { id: string; name: string; }
interface Country { id: string; name: string; }

// Упрощенный список стилей для UI создания (коды должны совпадать с seed.ts)
const AVAILABLE_PLAYSTYLES = [
  { code: 'FINESSE_SHOT', name: 'Удар на технику', cat: 'ATTACK' },
  { code: 'POWER_SHOT', name: 'Мощный удар', cat: 'ATTACK' },
  { code: 'TRIVELA', name: 'Тривела', cat: 'ATTACK' },
  { code: 'INCISIVE_PASS', name: 'Разрезающий пас', cat: 'PASSING' },
  { code: 'LONG_BALL_PASS', name: 'Длинный пас', cat: 'PASSING' },
  { code: 'FIRST_TOUCH', name: 'Первое касание', cat: 'PASSING' },
  { code: 'SLIDE_TACKLE', name: 'Подкат', cat: 'DEFENSE' },
  { code: 'OFFSIDE_TRAP', name: 'Офсайдная ловушка', cat: 'DEFENSE' },
  { code: 'MAN_MARKING', name: 'Опека', cat: 'DEFENSE' },
  { code: 'ATHLETICISM', name: 'Атлетизм', cat: 'PHYSICAL' },
  { code: 'GK_FEET', name: 'Игра ногами', cat: 'GK' },
  { code: 'GK_CROSSES', name: 'Игра на выходе', cat: 'GK' },
  { code: 'LEADER', name: 'Лидер', cat: 'MENTAL' },
  { code: 'CAPTAIN', name: 'Капитан', cat: 'MENTAL' },
];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface PlayerFormProps {
  teams: Team[];
  countries: Country[];
  positions?: string[];
}

export default function PlayerForm({ 
  teams = [], 
  countries = [], 
  positions = ["GK", "LD", "CD", "RD", "LM", "CM", "RM", "LF", "CF", "RF"]
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
    power: "40", 
    potential: "70", injuryProne: "10",
    formIndex: 0,
    playStyles: [] as string[] // Массив кодов выбранных стилей
  };

  const createNewPlayer = () => ({
    ...initialPlayerState,
    tempId: Math.random().toString(36).substr(2, 9),
    potential: getRandomInt(50, 95).toString(),
    injuryProne: getRandomInt(1, 20).toString(),
    formIndex: Math.floor(Math.random() * FORM_CURVE.length)
  });

  const [singleForm, setSingleForm] = useState({ ...createNewPlayer(), tempId: "single" });
  const [bulkPlayers, setBulkPlayers] = useState([createNewPlayer()]);

  // Обновление в одиночной форме
  const updateSingle = (field: string, value: any) => {
    setSingleForm(prev => ({ ...prev, [field]: value }));
  };

  // Переключение стиля (checkbox logic)
  const toggleStyleSingle = (code: string) => {
    const current = singleForm.playStyles;
    if (current.includes(code)) {
      updateSingle('playStyles', current.filter(c => c !== code));
    } else {
      if (current.length >= 5) return; // Лимит 5
      updateSingle('playStyles', [...current, code]);
    }
  };

  // Обновление в массовой форме
  const updateBulk = (index: number, field: string, value: any) => {
    setBulkPlayers(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
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
      const prepareData = (p: any) => ({ 
          firstName: p.firstName,
          lastName: p.lastName,
          age: parseInt(p.age),
          power: parseInt(p.power),
          mainPosition: p.mainPosition,
          sidePosition: p.sidePosition || null,
          teamId, 
          countryId, 
          formIndex: p.formIndex,
          playStyles: p.playStyles
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
      if (isBulk) setBulkPlayers([createNewPlayer()]);
      else setSingleForm({ ...createNewPlayer(), tempId: "single" });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
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
             </div>
           )}
        </div>

        {!isBulk ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-400">Личные данные</label>
                   <div className="flex gap-2">
                    <input required placeholder="ИМЯ" className="w-1/2 border border-gray-300 p-3 text-xs font-bold uppercase outline-none focus:border-[#e30613]" value={singleForm.firstName} onChange={e => updateSingle("firstName", e.target.value)} />
                    <input required placeholder="ФАМИЛИЯ" className="w-1/2 border border-gray-300 p-3 text-xs font-bold uppercase outline-none focus:border-[#e30613]" value={singleForm.lastName} onChange={e => updateSingle("lastName", e.target.value)} />
                   </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Возраст</label>
                    <input type="number" className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.age} onChange={e => updateSingle("age", e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Сила (RS)</label>
                    <input type="number" className="w-full border border-gray-300 p-3 text-xs font-bold outline-none text-[#e30613]" value={singleForm.power} onChange={e => updateSingle("power", e.target.value)} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Позиция</label>
                    <select className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.mainPosition} onChange={e => updateSingle("mainPosition", e.target.value)}>
                       {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400">Вторая поз.</label>
                    <select className="w-full border border-gray-300 p-3 text-xs font-bold outline-none" value={singleForm.sidePosition} onChange={e => updateSingle("sidePosition", e.target.value)}>
                       <option value="">НЕТ</option>
                       {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
             </div>

             {/* ВЫБОР PLAYSTYLES */}
             <div className="bg-gray-50 p-4 border border-gray-200">
                <div className="flex justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase text-[#1a3151] flex items-center gap-2"><Star size={14}/> PlayStyles</h3>
                  <span className={`text-[10px] font-bold ${singleForm.playStyles.length === 5 ? 'text-red-500' : 'text-gray-400'}`}>
                    Выбрано: {singleForm.playStyles.length} / 5
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AVAILABLE_PLAYSTYLES.map(ps => {
                    const isSelected = singleForm.playStyles.includes(ps.code);
                    const disabled = !isSelected && singleForm.playStyles.length >= 5;
                    return (
                      <button 
                        key={ps.code}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleStyleSingle(ps.code)}
                        className={`p-2 border rounded text-left transition-all ${
                          isSelected 
                            ? 'bg-[#1a3151] border-[#1a3151] text-white' 
                            : disabled ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-[9px] font-black uppercase leading-none mb-1">{ps.name}</div>
                        <div className={`text-[8px] font-bold ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>{ps.cat}</div>
                      </button>
                    )
                  })}
                </div>
             </div>
          </div>
        ) : (
          /* ================= МАССОВЫЙ (Упрощенный, без выбора стилей для экономии места) ================= */
          <div className="border border-gray-300 overflow-hidden shadow-sm">
             <div className="bg-yellow-50 p-2 text-[10px] text-center text-yellow-800 font-bold border-b border-yellow-200">
                В массовом режиме создание PlayStyles временно недоступно. Игроки будут созданы без стилей.
             </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a3151] text-white text-[9px] font-bold uppercase italic">
                  <tr>
                    <th className="p-3 w-10">№</th>
                    <th className="p-3">Фамилия Имя</th>
                    <th className="p-3 text-center w-14">RS</th>
                    <th className="p-3 text-center w-20">Поз</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPlayers.map((p, idx) => (
                    <tr key={p.tempId} className="border-b border-gray-100 bg-white">
                      <td className="p-2 text-center text-[10px] font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <input className="w-1/2 bg-transparent border-b p-1 text-[10px] font-bold uppercase outline-none" placeholder="ИМЯ" value={p.firstName} onChange={e => updateBulk(idx, "firstName", e.target.value)} />
                          <input className="w-1/2 bg-transparent border-b p-1 text-[10px] font-bold uppercase outline-none" placeholder="ФАМИЛИЯ" value={p.lastName} onChange={e => updateBulk(idx, "lastName", e.target.value)} />
                        </div>
                      </td>
                      <td className="p-2"><input type="number" className="w-full text-center font-black text-[10px] text-[#e30613] bg-transparent outline-none" value={p.power} onChange={e => updateBulk(idx, "power", e.target.value)} /></td>
                      <td className="p-2">
                        <select className="w-full text-[10px] font-bold" value={p.mainPosition} onChange={e => updateBulk(idx, "mainPosition", e.target.value)}>
                           {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-600" disabled={bulkPlayers.length === 1}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addRow} className="w-full py-4 bg-[#f8fafc] text-[10px] font-black uppercase text-[#1a3151] flex items-center justify-center gap-2 border-t border-gray-200">
              <Plus size={14} /> Добавить строку
            </button>
          </div>
        )}

        <div className="flex justify-end gap-6 items-center pt-4">
          {error && <span className="text-red-600 text-[10px] font-black uppercase bg-red-50 px-4 py-2">{error}</span>}
          {success && <span className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-4 py-2">Успешно</span>}
          <button type="submit" disabled={loading} className="bg-[#000c2d] hover:bg-[#e30613] text-white px-16 py-5 font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center gap-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} /> Создать игрока</>}
          </button>
        </div>
      </form>
    </div>
  );
}