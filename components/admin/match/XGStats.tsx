"use client";

import { useMemo, useState } from "react";
import { Activity, Target, ChevronDown, ChevronUp, Wrench, Shield } from "lucide-react";

type DefenseGuessOutcome = {
  guessed: boolean;
  chanceQualityMul: number;
  disruptionMul: number;
};

type MatchDebug = {
  xgTotal: number;
  home: {
    tactic: string;
    defenseSetup: string;
    ap: number;
    dp: number;
    chancesPlanned: number;
    defenseGuess: DefenseGuessOutcome;
  };
  away: {
    tactic: string;
    defenseSetup: string;
    ap: number;
    dp: number;
    chancesPlanned: number;
    defenseGuess: DefenseGuessOutcome;
  };
  collision: {
    winner: "HOME" | "AWAY" | "NONE";
    homeDirection: string;
    awayDirection: string;
    homeBonus: number;
    awayBonus: number;
  };
  derivedFromEvents: {
    homeShots: number;
    awayShots: number;
    homeGoals: number;
    awayGoals: number;
    homeSavesByAwayGK: number;
    awaySavesByHomeGK: number;
    homeOnTarget: number;
    awayOnTarget: number;
    homeDisrupted: number;
    awayDisrupted: number;
  };
};

interface MatchStatsProps {
  homeXG: number;
  awayXG: number;
  homeScore?: number;
  awayScore?: number;
  events?: any[]; // Разрешаем передачу массива событий
  debug?: MatchDebug;
}

function StatRow({
  label,
  home,
  away,
  icon,
}: {
  label: string;
  home: React.ReactNode;
  away: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2 border-b border-slate-100 last:border-b-0">
      <div className="text-sm font-semibold text-emerald-700">{home}</div>
      <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-amber-700 text-right">{away}</div>
    </div>
  );
}

export function MatchStats({
  homeXG,
  awayXG,
  homeScore,
  awayScore,
  events = [],
  debug,
}: MatchStatsProps) {
  const totalXG = homeXG + awayXG || 1;
  const homePercent = (homeXG / totalXG) * 100;

  const [devOpen, setDevOpen] = useState(false);

  const matchStats = useMemo(() => {
    // Вариант 1: Берем готовую статистику из дебага, если она есть
    if (debug?.derivedFromEvents) {
      const d = debug.derivedFromEvents;
      return {
        shots: { home: d.homeShots, away: d.awayShots },
        onTarget: { home: d.homeOnTarget, away: d.awayOnTarget },
        saves: { home: d.awaySavesByHomeGK, away: d.homeSavesByAwayGK },
        disrupted: { home: d.homeDisrupted, away: d.awayDisrupted },
      };
    }

    // Вариант 2: Если дебага нет, считаем вручную по массиву событий
    if (!events || events.length === 0) return null;

    return {
      shots: {
        home: events.filter((e) => e.team === "HOME" && (e.type === "SHOT" || e.type === "GOAL" || e.type === "SAVE")).length,
        away: events.filter((e) => e.team === "AWAY" && (e.type === "SHOT" || e.type === "GOAL" || e.type === "SAVE")).length,
      },
      onTarget: {
        home: events.filter((e) => e.team === "HOME" && (e.type === "GOAL" || e.type === "SAVE")).length,
        away: events.filter((e) => e.team === "AWAY" && (e.type === "GOAL" || e.type === "SAVE")).length,
      },
      saves: {
        home: events.filter((e) => e.team === "AWAY" && e.type === "SAVE").length,
        away: events.filter((e) => e.team === "HOME" && e.type === "SAVE").length,
      },
      disrupted: {
        home: events.filter((e) => e.team === "HOME" && e.type === "CHANCE").length,
        away: events.filter((e) => e.team === "AWAY" && e.type === "CHANCE").length,
      }
    };
  }, [debug, events]);

  return (
    <div className="w-full space-y-4">
      {/* Черта + заголовок */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-[1px] flex-1 bg-slate-200" />
        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          Статистика матча
        </div>
        <div className="h-[1px] flex-1 bg-slate-200" />
      </div>

      {/* xG блок */}
      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[140px]">
        <span className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">
          Ожидаемые голы (xG)
        </span>

        <div className="flex items-center gap-8 w-full max-w-2xl px-4">
          <span className="font-black text-4xl text-emerald-600 italic tracking-tighter">
            {homeXG.toFixed(2)}
          </span>

          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${homePercent}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-out"
              style={{ width: `${100 - homePercent}%` }}
            />
          </div>

          <span className="font-black text-4xl text-amber-600 italic tracking-tighter">
            {awayXG.toFixed(2)}
          </span>
        </div>

        <span className="text-[9px] font-black text-slate-300 mt-4 uppercase tracking-[0.3em] italic">
          Качество моментов
        </span>
      </div>

      {/* “Футбольная” статистика */}
      {matchStats && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">
            По матчу (из событий)
          </div>

          <div className="space-y-0">
            {typeof homeScore === "number" && typeof awayScore === "number" && (
              <StatRow
                label="Счёт"
                home={homeScore}
                away={awayScore}
                icon={<Target className="w-3.5 h-3.5" />}
              />
            )}

            <StatRow
              label="Удары"
              home={matchStats.shots.home}
              away={matchStats.shots.away}
              icon={<Activity className="w-3.5 h-3.5" />}
            />

            <StatRow
              label="В створ"
              home={matchStats.onTarget.home}
              away={matchStats.onTarget.away}
              icon={<Target className="w-3.5 h-3.5" />}
            />

            <StatRow
              label="Сейвы"
              home={matchStats.saves.home}
              away={matchStats.saves.away}
              icon={<Shield className="w-3.5 h-3.5" />}
            />

            <StatRow
              label="Сорвано атак"
              home={matchStats.disrupted.home}
              away={matchStats.disrupted.away}
            />
          </div>
        </div>
      )}

      {/* Для разработчика */}
      {debug && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setDevOpen((v) => !v)}
            className="w-full px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.22em]">
                Для разработчика
              </span>
            </div>
            {devOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {devOpen && (
            <div className="px-6 pb-6 pt-2 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.18em] mb-2">
                    Total xG
                  </div>
                  <div className="text-lg font-black text-slate-700">{debug.xgTotal.toFixed(2)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.18em] mb-2">
                    Коллизия
                  </div>
                  <div className="text-sm font-black text-slate-700">
                    Winner: {debug.collision.winner}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    HOME {debug.collision.homeDirection} (+{Math.round(debug.collision.homeBonus * 100)}%)
                    {" · "}
                    AWAY {debug.collision.awayDirection} (+{Math.round(debug.collision.awayBonus * 100)}%)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                  <div className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.18em] mb-2">
                    HOME engine
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    tactic: <span className="font-black">{debug.home.tactic}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    defense: <span className="font-black">{debug.home.defenseSetup}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    AP/DP: <span className="font-black">{debug.home.ap}</span> /{" "}
                    <span className="font-black">{debug.home.dp}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    planned chances: <span className="font-black">{debug.home.chancesPlanned}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    defense guess:{" "}
                    <span className="font-black">{debug.home.defenseGuess.guessed ? "YES" : "NO"}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    qMul: {debug.home.defenseGuess.chanceQualityMul} · disruptMul:{" "}
                    {debug.home.defenseGuess.disruptionMul}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                  <div className="text-[10px] font-black uppercase text-amber-700 tracking-[0.18em] mb-2">
                    AWAY engine
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    tactic: <span className="font-black">{debug.away.tactic}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    defense: <span className="font-black">{debug.away.defenseSetup}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    AP/DP: <span className="font-black">{debug.away.ap}</span> /{" "}
                    <span className="font-black">{debug.away.dp}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    planned chances: <span className="font-black">{debug.away.chancesPlanned}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700">
                    defense guess:{" "}
                    <span className="font-black">{debug.away.defenseGuess.guessed ? "YES" : "NO"}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    qMul: {debug.away.defenseGuess.chanceQualityMul} · disruptMul:{" "}
                    {debug.away.defenseGuess.disruptionMul}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.18em] mb-2">
                  События (агрегаты)
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-semibold text-slate-700">
                  <div>HOME shots: <span className="font-black">{debug.derivedFromEvents.homeShots}</span></div>
                  <div>AWAY shots: <span className="font-black">{debug.derivedFromEvents.awayShots}</span></div>
                  <div>HOME on target: <span className="font-black">{debug.derivedFromEvents.homeOnTarget}</span></div>
                  <div>AWAY on target: <span className="font-black">{debug.derivedFromEvents.awayOnTarget}</span></div>
                  <div>HOME disrupted: <span className="font-black">{debug.derivedFromEvents.homeDisrupted}</span></div>
                  <div>AWAY disrupted: <span className="font-black">{debug.derivedFromEvents.awayDisrupted}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}