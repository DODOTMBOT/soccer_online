"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", surname: "", login: "", email: "", password: "", confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          login: form.login,
          email: form.email,
          password: form.password
        }),
      });

      // Проверка: если сервер вернул HTML вместо JSON (ошибка 404/500)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Сервер вернул некорректный ответ (404 или ошибка сборки). Проверьте API роут.");
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Ошибка регистрации");
      }

      router.push("/auth/signin?success=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 mb-2">Регистрация</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Присоединяйтесь к Soccer Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Имя</label>
              <input 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Фамилия</label>
              <input 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                onChange={e => setForm({...form, surname: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Логин</label>
            <input 
              required 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
              onChange={e => setForm({...form, login: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Email</label>
            <input 
              required 
              type="email" 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
              onChange={e => setForm({...form, email: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Пароль</label>
              <input 
                required 
                type="password" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Повтор</label>
              <input 
                required 
                type="password" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 focus:ring-2 ring-emerald-500/20 outline-none transition-all" 
                onChange={e => setForm({...form, confirmPassword: e.target.value})} 
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-rose-500 text-center leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <>Создать аккаунт <ArrowRight size={14} /></>}
          </button>

          <p className="text-[9px] font-black text-slate-400 text-center pt-2 uppercase tracking-widest leading-none">
            Уже зарегистрированы? <Link href="/auth/signin" className="text-emerald-500 hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}