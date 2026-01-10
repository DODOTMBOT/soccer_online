"use client";

import { useEffect, useState } from "react";
import { Check, X, User, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        setApps(await res.json());
      }
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleResolve = async (appId: string, decision: 'APPROVE' | 'REJECT') => {
    const toastId = toast.loading("Обработка...");
    try {
      // Используем новый REST endpoint с методом PATCH
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: appId, 
          status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED' 
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка обработки");
      }

      toast.success(decision === 'APPROVE' ? "Одобрено" : "Отклонено", { id: toastId });
      fetchApps(); // Обновляем список
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase text-[#1a3151] mb-6">Входящие заявки</h1>
      
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-500">
            <tr>
              <th className="p-4">Менеджер</th>
              <th className="p-4">Клуб</th>
              <th className="p-4">Дата</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">Заявок нет</td></tr>
            ) : apps.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1a3151]">{app.user.login}</div>
                      <div className="text-xs text-gray-400">{app.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-bold text-[#1a3151]">
                    <Shield size={14} className="text-emerald-500" />
                    {app.team.name}
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-gray-500">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleResolve(app.id, 'APPROVE')}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-sm hover:bg-emerald-100 transition-colors"
                      title="Принять"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleResolve(app.id, 'REJECT')}
                      className="p-2 bg-red-50 text-red-600 rounded-sm hover:bg-red-100 transition-colors"
                      title="Отклонить"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}