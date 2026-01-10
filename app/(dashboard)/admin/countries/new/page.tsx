"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar"; // Теперь это горизонтальный Navbar
import { Globe, Flag, Loader2, ArrowLeft, Plus, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const CONFEDERATIONS = ["UEFA", "CONMEBOL", "CONCACAF", "AFC", "CAF", "OFC"];

export default function NewCountryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    flag: "",
    confederation: "UEFA",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при создании");

      setSuccess(true);
      setTimeout(() => router.push("/admin/countries/list"), 1500);
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
              Добавить новую <span className="text-[#e30613]">страну</span>
            </h1>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Реестр конфедераций FIFA
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white shadow-sm border border-gray-200">
            {/* Заголовок формы в стиле таблицы */}
            <div className="bg-[#1a3151] px-8 py-3">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Основная информация</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Название */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Название страны</label>
                  <div className="relative">
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none transition-all" 
                      placeholder="Напр: Бразилия"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  </div>
                </div>

                {/* Конфедерация */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Конфедерация</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none appearance-none transition-all cursor-pointer"
                      value={form.confederation}
                      onChange={e => setForm({...form, confederation: e.target.value})}
                    >
                      {CONFEDERATIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* URL Флага */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">URL иконки флага (PNG/SVG)</label>
                <div className="relative">
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs font-bold text-[#000c2d] focus:border-[#1a3151] outline-none transition-all" 
                    placeholder="https://tm-assets.com/flags/br.png"
                    value={form.flag}
                    onChange={e => setForm({...form, flag: e.target.value})}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">🚩</div>
                </div>
                <p className="text-[8px] text-gray-400 font-medium italic">Рекомендуемый размер 24x24 или 48x48 пикселей.</p>
              </div>

              {/* Статусные сообщения */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-[10px] font-bold uppercase text-red-600">Ошибка: {error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={16} />
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Страна добавлена в базу данных Transfermarkt GEN</p>
                </div>
              )}

              {/* Кнопка действия */}
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#000c2d] text-white px-10 py-4 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#e30613] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:bg-[#000c2d]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>Зарегистрировать страну <Plus size={14} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Информационный блок */}
          <div className="mt-8 bg-white border border-gray-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-sm">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-wider mb-1">Важная информация</h4>
              <p className="text-[10px] leading-relaxed text-gray-500 font-medium">
                После создания страны вы сможете привязывать к ней национальные лиги, кубки и игроков. 
                Убедитесь, что название соответствует официальному реестру FIFA для корректной работы системы коллизий и стилей.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}