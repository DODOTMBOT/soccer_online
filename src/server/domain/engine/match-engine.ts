import { VflStyle, DefenseType } from "@prisma/client";
// Убедись, что файл rng.ts создан по пути src/shared/utils/rng.ts (из шага 2.1 предыдущего плана)
import { SeededRNG } from "@/src/shared/utils/rng";

// --- ТИПЫ (Контракт движка) ---

export type EnginePlayer = {
  id: string;
  name: string;
  power: number;
  assignedPosition: string; 
  // Спецухи (значения 0-4)
  specKr?: number; specKt?: number; specRv?: number; specVp?: number; specIbm?: number; specKp?: number;
  specZv?: number; specLong?: number; specInt?: number; specAnt?: number; specSpd?: number;
  specGkRea?: number; specGkPos?: number; specPhys?: number; specL?: number; specKi?: number;
  specSt?: number;
};

export type EngineTeam = {
  teamId: string;
  name: string;
  isHome: boolean;
  tactic: VflStyle;
  defenseSetup: DefenseType;
  players: EnginePlayer[];
};

export type MatchEventType = "CHANCE" | "SHOT" | "GOAL" | "SAVE" | "FOUL" | "YELLOW" | "RED";

export type MatchEvent = {
  minute: number;
  type: MatchEventType;
  team: "HOME" | "AWAY";
  text: string;
  isGoal: boolean;
  player?: { id: string; name: string };
  assist?: { id: string; name: string };
};

// Структура для детального дебага (Developer Debugger)
export type TraceEntry = {
  minute: number;
  phase: string;      // Например: "POSSESSION", "SHOT_EXECUTION"
  calc: any;          // Входные данные расчета (шансы, роллы)
  modifiers: string[]; // Что повлияло (дома, спецнавык и т.д.)
  outcome: string;    // Итог шага
};

export type MatchResult = {
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
  events: MatchEvent[];
  debug?: {
    seed: string | number;
    trace: TraceEntry[];
    powerDiff: number;
    hPower: number;
    aPower: number;
  }; 
};

// --- УТИЛИТЫ ---

const ATTACKING_POSITIONS = new Set<string>(["LW", "RW", "CAM", "ST", "CF", "LF", "RF"]);

const normPos = (p: string) => (p || "").toUpperCase().trim();
const isAttackerPos = (pos: string) => ATTACKING_POSITIONS.has(normPos(pos));

// Выбор элемента теперь зависит от RNG
const pickOne = <T>(arr: T[], rng: SeededRNG): T => {
  if (arr.length === 0) return arr[0]; // fallback
  return arr[rng.int(0, arr.length - 1)];
};

// --- ГЛАВНАЯ ФУНКЦИЯ ---

export function playMatch(
  home: EngineTeam, 
  away: EngineTeam,
  seed: number | string = Date.now(),
  isDebug: boolean = false
): MatchResult {
  
  // Инициализация RNG
  const numericSeed = typeof seed === 'string' 
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) 
    : seed;
  const rng = new SeededRNG(numericSeed);
  
  // Инициализация трейса
  const trace: TraceEntry[] = [];
  const log = (minute: number, phase: string, calc: any, outcome: string, modifiers: string[] = []) => {
    if (isDebug) trace.push({ minute, phase, calc, modifiers, outcome });
  };

  // 1. Валидация (Техническое поражение если нет игроков)
  if (home.players.length < 7) return createTechWin(away, home, "AWAY");
  if (away.players.length < 7) return createTechWin(home, away, "HOME");

  // 2. Расчет силы
  const getTeamPower = (t: EngineTeam) => {
    const totalPower = t.players.reduce((acc, p) => acc + (p.power || 0), 0);
    return totalPower / t.players.length;
  };

  const hBase = getTeamPower(home);
  const aBase = getTeamPower(away);
  
  const hPower = hBase * (home.isHome ? 1.1 : 1.0); // 10% бонус дома
  const aPower = aBase;

  // Лог начальных условий
  if (isDebug) {
    log(0, "PREMATCH_CALC", { hBase, aBase, homeBonus: 1.1 }, "POWER_CALCULATED", ["HOME_ADVANTAGE"]);
  }

  // 3. Симуляция моментов
  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [];
  
  // Коэффициент перевеса
  const ratio = hPower / (aPower + 1); 
  const totalChances = 10; 

  for (let i = 0; i < totalChances; i++) {
    // Время теперь детерминировано
    const minute = 5 + i * 9 + rng.int(0, 5);
    
    // Кто атакует?
    const attackRoll = rng.next();
    const attackThreshold = ratio / (ratio + 1);
    const isHomeAttack = attackRoll < attackThreshold; 

    log(minute, "POSSESSION", { roll: attackRoll.toFixed(4), threshold: attackThreshold.toFixed(4) }, isHomeAttack ? "HOME_ATTACK" : "AWAY_ATTACK");

    const attackingTeam = isHomeAttack ? home : away;
    const defendingTeam = isHomeAttack ? away : home;
    const teamTag = isHomeAttack ? "HOME" : "AWAY";

    // Герои эпизода (выбор через RNG)
    const attacker = pickAttacker(attackingTeam, rng);
    const gk = getGoalkeeper(defendingTeam);
    
    // Шанс гола (зависит от дуэли Нападающий vs Вратарь)
    const duelFactor = attacker.power / (gk.power + attacker.power);
    const goalChance = duelFactor * 0.7; // Базовый множитель
    const goalRoll = rng.next();
    
    if (goalRoll < goalChance) {
      if (isHomeAttack) homeScore++; else awayScore++;
      
      log(minute, "SHOT_EXECUTION", { shooter: attacker.name, gk: gk.name, chance: goalChance.toFixed(3), roll: goalRoll.toFixed(3) }, "GOAL");
      
      events.push({
        minute,
        type: "GOAL",
        team: teamTag,
        text: `ГОЛ! ${attacker.name} реализует момент!`,
        isGoal: true,
        player: { id: attacker.id, name: attacker.name }
      });
    } else {
      const isSave = rng.bool(0.5); // 50/50 сейв или промах
      
      log(minute, "SHOT_EXECUTION", { shooter: attacker.name, gk: gk.name, chance: goalChance.toFixed(3), roll: goalRoll.toFixed(3) }, isSave ? "SAVE" : "MISS");

      if (isSave) {
        events.push({
          minute,
          type: "SAVE",
          team: teamTag,
          text: `Сейв! ${gk.name} спасает ворота после удара ${attacker.name}.`,
          isGoal: false,
          player: { id: attacker.id, name: attacker.name }
        });
      } else {
        events.push({
          minute,
          type: "SHOT",
          team: teamTag,
          text: `Удар мимо! ${attacker.name} бьет неточно.`,
          isGoal: false,
          player: { id: attacker.id, name: attacker.name }
        });
      }
    }
  }

  return {
    homeScore,
    awayScore,
    homeXG: Number((homeScore * 0.85).toFixed(2)),
    awayXG: Number((awayScore * 0.85).toFixed(2)),
    events: events.sort((a, b) => a.minute - b.minute),
    debug: isDebug ? { 
      seed, 
      trace, 
      hPower, 
      aPower, 
      powerDiff: hPower - aPower 
    } : undefined
  };
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function createTechWin(winner: EngineTeam, loser: EngineTeam, winSide: "HOME" | "AWAY"): MatchResult {
  return {
    homeScore: winSide === "HOME" ? 3 : 0,
    awayScore: winSide === "AWAY" ? 3 : 0,
    homeXG: 0, awayXG: 0,
    events: [{
      minute: 0, type: "CHANCE", team: winSide, isGoal: false,
      text: `Техническая победа. У команды ${loser.name} недостаточно игроков.`
    }]
  };
}

function pickAttacker(team: EngineTeam, rng: SeededRNG): EnginePlayer {
  const attackers = team.players.filter(p => isAttackerPos(p.assignedPosition));
  if (attackers.length > 0) return pickOne(attackers, rng);
  
  const outfield = team.players.filter(p => normPos(p.assignedPosition) !== "GK");
  return outfield.length > 0 ? pickOne(outfield, rng) : team.players[0];
}

function getGoalkeeper(team: EngineTeam): EnginePlayer {
  const gk = team.players.find(p => normPos(p.assignedPosition) === "GK");
  return gk || { id: "dummy", name: "Empty Net", power: 10, assignedPosition: "GK" };
}