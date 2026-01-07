"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2, XCircle } from "lucide-react";

interface PlayerActionsProps {
  playerId: string;
  isOwner: boolean;
  isOnTransfer: boolean;
  marketPrice: string | null; // Цена продажи
  realPrice: string | null;   // Номинал
}

export function PlayerActions({ playerId, isOwner, isOnTransfer, marketPrice, realPrice }: PlayerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Логика Владельца: Выставить/Снять с трансфера
  const toggleTransfer = async () => {
    let price = 0;
    
    if (!isOnTransfer) {
      const input = prompt("Введите стоимость трансфера ($):", realPrice || "1000000");
      if (input === null) return;
      price = parseInt(input);
      if (isNaN(price) || price < 0) return alert("Некорректная цена");
    } else {
      if (!confirm("Снять игрока с трансфера?")) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/players/${playerId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnTransfer: !isOnTransfer, price }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  // Логика Покупателя: Сделать предложение
  const handleMakeOffer = async () => {
    // Предлагаем цену по умолчанию: либо ту, что запросил продавец, либо номинал
    const defaultPrice = marketPrice || realPrice || "1000000";
    
    const input = prompt("Введите сумму предложения ($):", defaultPrice.toString());
    if (input === null) return;
    
    // Удаляем все не-цифры (на случай если ввели 1 000 000)
    const price = parseInt(input.replace(/\D/g, '')); 
    
    if (isNaN(price) || price <= 0) return alert("Некорректная сумма");

    setLoading(true);
    try {
      const res = await fetch("/api/market/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, price }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Предложение успешно отправлено! Владелец игрока рассмотрит его.");
      } else {
        alert(data.error || "Ошибка отправки");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {isOwner ? (
        <>
          <button className="px-6 py-2 bg-[#1a3151] text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#e30613] transition-all">
            Тренировать
          </button>
          
          <button 
            onClick={toggleTransfer}
            disabled={loading}
            className={`px-6 py-2 border rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              isOnTransfer 
                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                : "bg-white border-gray-300 text-[#1a3151] hover:bg-gray-100"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={14}/> : (isOnTransfer ? <XCircle size={14}/> : <DollarSign size={14}/>)}
            {isOnTransfer ? "Снять с трансфера" : "На трансфер"}
          </button>
        </>
      ) : (
        <button 
          onClick={handleMakeOffer}
          disabled={loading}
          className="px-6 py-2 bg-[#e30613] text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
        >
          {loading ? "Отправка..." : (isOnTransfer ? `Купить за $${Number(marketPrice).toLocaleString()}` : "Сделать предложение")}
        </button>
      )}
    </div>
  );
}