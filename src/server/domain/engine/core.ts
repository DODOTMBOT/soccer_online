import { VflStyle, DefenseType } from "@prisma/client";

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

export type MatchResult = {
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
  events: MatchEvent[];
  debug?: any; 
};

// --- УТИЛИТЫ ---

const ATTACKING_POSITIONS = new Set<string>(["LW", "RW", "CAM", "ST", "CF", "LF", "RF"]);
const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const normPos = (p: string) => (p || "").toUpperCase().trim();
const isAttackerPos = (pos: string) => ATTACKING_POSITIONS.has(normPos(pos));

// --- ГЛАВНАЯ ФУНКЦИЯ ---

export function playMatch(home: EngineTeam, away: EngineTeam): MatchResult {
  // 1. Валидация (Техническое поражение если нет игроков)
  if (home.players.length < 7) return createTechWin(away, home, "AWAY");
  if (away.players.length < 7) return createTechWin(home, away, "HOME");

  // 2. Расчет силы (упрощенный, но рабочий вариант из твоей логики)
  const getTeamPower = (t: EngineTeam) => {
    const totalPower = t.players.reduce((acc, p) => acc + (p.power || 0), 0);
    return totalPower / t.players.length;
  };

  const hPower = getTeamPower(home) * (home.isHome ? 1.1 : 1.0); // 10% бонус дома
  const aPower = getTeamPower(away);

  // 3. Симуляция моментов
  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [];
  
  // Коэффициент перевеса
  const ratio = hPower / (aPower + 1); 
  const totalChances = 10; 

  for (let i = 0; i < totalChances; i++) {
    const minute = 5 + i * 9 + Math.floor(Math.random() * 5);
    // Кто атакует? (зависит от силы)
    const isHomeAttack = Math.random() < (ratio / (ratio + 1)); 

    const attackingTeam = isHomeAttack ? home : away;
    const defendingTeam = isHomeAttack ? away : home;
    const teamTag = isHomeAttack ? "HOME" : "AWAY";

    // Герои эпизода
    const attacker = pickAttacker(attackingTeam);
    const gk = getGoalkeeper(defendingTeam);
    
    // Шанс гола (зависит от дуэли Нападающий vs Вратарь)
    const duelFactor = attacker.power / (gk.power + attacker.power);
    const goalChance = duelFactor * 0.7; // Базовый множитель
    
    if (Math.random() < goalChance) {
      if (isHomeAttack) homeScore++; else awayScore++;
      events.push({
        minute,
        type: "GOAL",
        team: teamTag,
        text: `ГОЛ! ${attacker.name} реализует момент!`,
        isGoal: true,
        player: { id: attacker.id, name: attacker.name }
      });
    } else {
      const isSave = Math.random() > 0.5;
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
    debug: { hPower, aPower, ratio }
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

function pickAttacker(team: EngineTeam): EnginePlayer {
  const attackers = team.players.filter(p => isAttackerPos(p.assignedPosition));
  if (attackers.length > 0) return pickOne(attackers);
  const outfield = team.players.filter(p => normPos(p.assignedPosition) !== "GK");
  return outfield.length > 0 ? pickOne(outfield) : team.players[0];
}

function getGoalkeeper(team: EngineTeam): EnginePlayer {
  const gk = team.players.find(p => normPos(p.assignedPosition) === "GK");
  return gk || { id: "dummy", name: "Empty Net", power: 10, assignedPosition: "GK" };
}