import { Shield, Star } from 'lucide-react';

interface ScoreboardProps {
  homeTeam: any;
  awayTeam: any;
  homeScore: number | null;
  awayScore: number | null;
  homePower: number;
  awayPower: number;
  isFinished: boolean;
}

export function Scoreboard({ homeTeam, awayTeam, homeScore, awayScore, homePower, awayPower, isFinished }: ScoreboardProps) {
  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
      
      <div className="flex items-center justify-between relative z-10">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 shadow-inner">
            {homeTeam.logo ? <img src={homeTeam.logo} className="w-16 h-16 object-contain" alt="home" /> : <Shield size={48} className="text-slate-200" />}
          </div>
          <div className="space-y-1">
            <span className="font-black uppercase italic text-lg tracking-tighter block">{homeTeam.name}</span>
            <div className="flex items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Star size={10} className="text-emerald-600 fill-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700">{homePower}</span>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-2 px-10">
          <div className="flex items-center gap-4">
            <span className={`text-7xl font-black italic tracking-tighter ${isFinished ? 'text-slate-900' : 'text-slate-200'}`}>
              {isFinished ? homeScore : '?'}
            </span>
            <span className="text-2xl font-black text-slate-300 italic">:</span>
            <span className={`text-7xl font-black italic tracking-tighter ${isFinished ? 'text-slate-900' : 'text-slate-200'}`}>
              {isFinished ? awayScore : '?'}
            </span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isFinished ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
            {isFinished ? 'Матч завершен' : 'Ожидание генерации'}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 shadow-inner">
            {awayTeam.logo ? <img src={awayTeam.logo} className="w-16 h-16 object-contain" alt="away" /> : <Shield size={48} className="text-slate-200" />}
          </div>
          <div className="space-y-1">
            <span className="font-black uppercase italic text-lg tracking-tighter block">{awayTeam.name}</span>
            <div className="flex items-center justify-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <Star size={10} className="text-amber-600 fill-amber-600" />
                <span className="text-[10px] font-black text-amber-700">{awayPower}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}