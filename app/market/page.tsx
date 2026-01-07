import { Sidebar } from "@/components/admin/Sidebar";
import { MarketService } from "@/src/server/services/market.service";
import Link from "next/link";
import { ShoppingCart, Search } from "lucide-react";

export default async function MarketPage() {
  const players = await MarketService.getTransferList();

  return (
    <div className="min-h-screen bg-[#f2f5f7] flex flex-col font-sans text-[#1a3151]">
      <Sidebar />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
              <ShoppingCart size={20} className="text-[#e30613]" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tight">Трансферный рынок</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Доступно игроков: {players.length}</p>
            </div>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input placeholder="Поиск по имени..." className="w-full pl-9 pr-4 py-3 rounded-sm border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#1a3151]" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a3151] text-white text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Игрок</th>
                <th className="p-4 text-center">Поз</th>
                <th className="p-4 text-center">Возр</th>
                <th className="p-4 text-center">Сила</th>
                <th className="p-4">Команда</th>
                <th className="p-4 text-right">Цена</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-bold divide-y divide-gray-100">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <Link href={`/players/${p.id}`} className="flex items-center gap-3 hover:text-[#e30613]">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[9px] border border-gray-200">
                        {p.country?.flag && <img src={p.country.flag} className="w-4 h-3 object-cover" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="uppercase text-xs">{p.lastName}</span>
                        <span className="text-[9px] text-gray-400 font-normal">{p.firstName}</span>
                      </div>
                    </Link>
                  </td>
                  <td className={`p-4 text-center ${p.mainPosition === 'GK' ? 'text-yellow-600' : 'text-[#1a3151]'}`}>{p.mainPosition}</td>
                  <td className="p-4 text-center text-gray-500">{p.age}</td>
                  <td className="p-4 text-center">
                    <span className="bg-[#1a3151] text-white px-2 py-1 rounded text-[10px]">{p.power}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      {p.team?.logo && <img src={p.team.logo} className="w-4 h-4 object-contain" />}
                      <span className="uppercase text-[10px]">{p.team?.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600 text-xs">
                    {p.transferPrice ? `$${Number(p.transferPrice).toLocaleString()}` : 'По запросу'}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/players/${p.id}`} className="bg-gray-100 text-[#1a3151] px-4 py-2 rounded-sm text-[9px] uppercase hover:bg-[#e30613] hover:text-white transition-all">
                      Профиль
                    </Link>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-gray-400 uppercase">Рынок пуст</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}