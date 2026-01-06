"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    login: "",
    email: "",
    password: "",
    name: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // Логика входа через NextAuth
      const res = await signIn("credentials", {
        login: form.login,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Неверный логин или пароль");
        setLoading(false);
      } else {
        router.push("/admin/teams/list"); // Редирект после успешного входа
        router.refresh();
      }
    } else {
      // Логика регистрации через наш API
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Ошибка при регистрации");
          setLoading(false);
        } else {
          // После успешной регистрации переключаем на вход
          setIsLogin(true);
          setError("");
          setLoading(false);
          alert("Регистрация успешна! Теперь войдите в систему.");
        }
      } catch (err) {
        setError("Ошибка соединения с сервером");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-sm overflow-hidden">
        
        {/* Шапка формы */}
        <div className="bg-[#1a3151] p-8 text-white text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-emerald-400" />
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            {isLogin ? "Вход в лигу" : "Регистрация менеджера"}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mt-2">
            Professional Football Management System
          </p>
        </div>

        {/* Тело формы */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-[11px] font-bold uppercase border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Поле Логин (обязательно для обоих режимов) */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">Логин</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#1a3151] focus:bg-white outline-none text-sm transition-all text-[#000c2d]"
                  placeholder="Ваш уникальный логин"
                  onChange={e => setForm({...form, login: e.target.value})}
                />
              </div>
            </div>

            {/* Дополнительные поля для регистрации */}
            {!isLogin && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-300" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#1a3151] focus:bg-white outline-none text-sm transition-all text-[#000c2d]"
                      placeholder="example@mail.com"
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">Имя и Фамилия</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#1a3151] focus:bg-white outline-none text-sm transition-all text-[#000c2d]"
                    placeholder="Александр Иванов"
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
              </>
            )}

            {/* Поле Пароль */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-300" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:border-[#1a3151] focus:bg-white outline-none text-sm transition-all text-[#000c2d]"
                  placeholder="••••••••"
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-[#006400] hover:bg-[#004d00] text-white font-black py-4 rounded-sm uppercase text-xs tracking-[0.2em] transition-all mt-6 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.98]"
          >
            {loading ? "Обработка..." : isLogin ? "Войти в систему" : "Создать аккаунт"}
            {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {/* Переключатель режимов */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1a3151] transition-colors"
          >
            {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть профиль? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}