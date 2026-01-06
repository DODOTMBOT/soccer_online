"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ login: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        login: form.login,
        password: form.password,
        redirect: false, // Оставляем false, чтобы обработать ошибку вручную
      });

      if (res?.error) {
        // Если NextAuth вернул ошибку (401)
        setError("Неверный логин или пароль");
        setLoading(false);
      } else {
        // Успешный вход
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Произошла ошибка при входе");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 mb-2">Вход в систему</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Soccer Hub Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Логин или Email</label>
            <input 
              required
              name="login"
              autoComplete="username"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 ring-emerald-500/20 transition-all" 
              onChange={e => setForm({...form, login: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Пароль</label>
            <input 
              required
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 ring-emerald-500/20 transition-all" 
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-rose-500 text-center leading-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1F2937] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <>Войти <ArrowRight size={14} /></>}
          </button>

          <p className="text-[9px] font-black text-slate-400 text-center pt-4 uppercase tracking-widest leading-none">
            Нет аккаунта? <Link href="/auth/register" className="text-emerald-500 hover:underline">Создать аккаунт</Link>
          </p>
        </form>
      </div>
    </div>
  );
}