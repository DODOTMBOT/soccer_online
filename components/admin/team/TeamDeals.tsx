"use client";

import { useState } from "react";
import { Check, X, ArrowRight, Loader2, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TeamDealsProps {
  incoming: any[];
  outgoing: any[];
  teamId: string;
}

export function TeamDeals({ incoming, outgoing }: TeamDealsProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (offerId: string, action: 'accept' | 'reject') => {
    if (!confirm(action === 'accept' ? "Продать игрока? Действие необратимо." : "Отклонить предложение?")) return;
    
    setLoadingId(offerId);
    try {
      const endpoint = action === 'accept' ? '/api/market/accept' : '/api/market/reject';
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });

      if (res.ok) {
        alert(action === 'accept' ? "Сделка состоялась! Деньги зачислены." : "Предложение отклонено.");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ВХОДЯЩИЕ (Продажа) */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
        <div className="bg-[#1a3151] px-6 py-3 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400"/> Входящие предложения (Продажа)
          </h3>
          <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[9px] font-bold">{incoming.length}</span>
        </div>
        
        {incoming.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-[10px] font-black uppercase">Нет предложений</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[9px] font-black text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Игрок</th>
                <th className="px-6 py-3">Покупатель</th>
                <th className="px-6 py-3 text-right">Сумма</th>
                <th className="px-6 py-3 text-right">Решение</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px] font-bold">
              {incoming.map((offer) => (
                <tr key={offer.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/players/${offer.playerId}`} className="text-[#1a3151] hover:text-[#e30613] hover:underline">
                      {offer.player.lastName} {offer.player.firstName}
                    </Link>
                    <div className="text-[9px] text-gray-400 font-normal mt-0.5">RS: {offer.player.power}</div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {offer.buyerTeam.logo && <img src={offer.buyerTeam.logo} className="w-5 h-5 object-contain" alt=""/>}
                    <span className="uppercase">{offer.buyerTeam.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm">
                    ${Number(offer.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(offer.id, 'accept')}
                        disabled={!!loadingId}
                        className="p-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        title="Принять и продать"
                      >
                        {loadingId === offer.id ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                      </button>
                      <button 
                        onClick={() => handleAction(offer.id, 'reject')}
                        disabled={!!loadingId}
                        className="p-2 bg-red-100 text-red-600 rounded-sm hover:bg-red-200 disabled:opacity-50 transition-colors"
                        title="Отклонить"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ИСХОДЯЩИЕ (Покупка) */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden opacity-80">
        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <ArrowRight size={14}/> Исходящие заявки (Покупка)
          </h3>
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[9px] font-bold">{outgoing.length}</span>
        </div>
        
        {outgoing.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-[10px] font-black uppercase">Вы никого не пытаетесь купить</div>
        ) : (
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-100 text-[11px] font-bold">
              {outgoing.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    {offer.player.lastName} ({offer.player.power})
                  </td>
                  <td className="px-6 py-3 text-gray-400 uppercase text-[9px]">
                    Владелец: {offer.player.team?.name || "???"}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    Предложено: ${Number(offer.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                       onClick={() => handleAction(offer.id, 'reject')}
                       className="text-[9px] text-red-500 hover:underline uppercase font-bold"
                    >
                      Отменить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}