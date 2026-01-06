// lib/soccer-engine.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// --- КОНСТАНТЫ И ТИПЫ ---

const ATTACKING_POSITIONS = new Set<string>(["LW", "RW", "CAM", "ST", "CF", "LF", "RF"]);

const LONG_SHOT_FULL_POSITIONS = new Set<string>([
  "LW", "RW", "CAM", "ST", "CF", "LF", "RF", "LM", "RM"
]);
const LONG_SHOT_MID_POSITIONS = new Set<string>(["DM", "CM", "CDM", "LCM", "RCM"]);

type Philosophy = "JOGA_BONITO" | "TIKI_TAKA" | "GEGENPRESS" | "INTENSIVO" | "CHOLO" | "BUS";
type DefenseSetup = "MAN_MARKING" | "ZONAL";
type PositionEffect = "BUFF" | "NEUTRAL" | "NERF";

type EnginePlayer = {
  id: string;
  name: string; // ДОБАВИЛИ ИМЯ, ЧТОБЫ ПИСАТЬ ЕГО В ЛОГ
  power: number;
  fatigue?: number;
  assignedPosition: string;
  specKr?: number; specKt?: number; specRv?: number; specVp?: number; specIbm?: number; specKp?: number;
  specZv?: number; specLong?: number; specInt?: number; specAnt?: number; specSpd?: number;
  specGkRea?: number; specGkPos?: number; specPhys?: number; specL?: number; specKi?: number;
  specSt?: number;
};

type EngineTeam = {
  teamId: string;
  isHome: boolean;
  tactic: Philosophy;
  defenseSetup: DefenseSetup;
  formationCode?: string;
  players: EnginePlayer[];
};

type EventType = "CHANCE" | "SHOT" | "GOAL" | "FOUL" | "YELLOW" | "RED" | "SAVE";

type MatchEvent = {
  minute: number;
  type: EventType;
  team: "HOME" | "AWAY";
  text: string;
  isGoal: boolean; // Для удобства фильтрации
  player?: { id: string; name: string }; // Кто совершил действие (бил)
  assist?: { id: string; name: string }; // Кто отдал пас
};

type MatchResult = {
  homeScore: number;
  awayScore: number;
  homeXG: number;
  awayXG: number;
  events: MatchEvent[];
  debug?: MatchDebug;
};

type MatchDebug = {
  xgTotal: number;
  home: {
    tactic: Philosophy;
    defenseSetup: DefenseSetup;
    ap: number;
    dp: number;
    chancesPlanned: number;
    defenseGuess: DefenseGuessOutcome;
  };
  away: {
    tactic: Philosophy;
    defenseSetup: DefenseSetup;
    ap: number;
    dp: number;
    chancesPlanned: number;
    defenseGuess: DefenseGuessOutcome;
  };
  collision: {
    winner: "HOME" | "AWAY" | "NONE";
    homeDirection: "ATTACK" | "UNIVERSAL" | "DEFENSE";
    awayDirection: "ATTACK" | "UNIVERSAL" | "DEFENSE";
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

// --- СПРАВОЧНИКИ ---

const TACTIC_DIRECTION: Record<Philosophy, "ATTACK" | "UNIVERSAL" | "DEFENSE"> = {
  JOGA_BONITO: "ATTACK", TIKI_TAKA: "UNIVERSAL", GEGENPRESS: "DEFENSE",
  INTENSIVO: "ATTACK", CHOLO: "UNIVERSAL", BUS: "DEFENSE",
};

const COLLISION_WINS_AGAINST: Record<Philosophy, Philosophy> = {
  JOGA_BONITO: "CHOLO", CHOLO: "GEGENPRESS", GEGENPRESS: "INTENSIVO",
  INTENSIVO: "TIKI_TAKA", TIKI_TAKA: "BUS", BUS: "JOGA_BONITO",
};

const COLLISION_BONUS: Record<"ATTACK" | "UNIVERSAL" | "DEFENSE", number> = {
  ATTACK: 0.30, UNIVERSAL: 0.32, DEFENSE: 0.34,
};

type PositionMatrix = Partial<Record<string, PositionEffect>>;
const DEFAULT_MATRIX: PositionMatrix = {};

const STYLE_BONUS_MATRIX: Record<Philosophy, {
  specKr: number; specKt: number; specRv: number; specVp: number; specIbm: number; specKp: number;
}> = {
  JOGA_BONITO: { specKr: 0.10, specKt: 0.06, specRv: 0.04, specVp: 0.02, specIbm: 0.02, specKp: 0.02 },
  TIKI_TAKA:   { specKr: 0.04, specKt: 0.10, specRv: 0.06, specVp: 0.02, specIbm: 0.02, specKp: 0.02 },
  GEGENPRESS:  { specKr: 0.06, specKt: 0.04, specRv: 0.10, specVp: 0.02, specIbm: 0.02, specKp: 0.02 },
  INTENSIVO:   { specKr: 0.02, specKt: 0.02, specRv: 0.02, specVp: 0.10, specIbm: 0.06, specKp: 0.04 },
  CHOLO:       { specKr: 0.02, specKt: 0.02, specRv: 0.02, specVp: 0.04, specIbm: 0.10, specKp: 0.06 },
  BUS:         { specKr: 0.02, specKt: 0.02, specRv: 0.02, specVp: 0.06, specIbm: 0.04, specKp: 0.10 },
};

const TACTIC_POSITION_MATRIX: Record<Philosophy, PositionMatrix> = {
  JOGA_BONITO: { CF: "BUFF" },
  TIKI_TAKA: { CM: "BUFF" },
  GEGENPRESS: { DM: "BUFF", CAM: "BUFF" },
  INTENSIVO: { ST: "BUFF", DM: "BUFF", RB: "BUFF" },
  CHOLO: { DM: "BUFF", RB: "BUFF" },
  BUS: { CB: "BUFF", SW: "BUFF" },
};

const LEADER_BONUS_BY_LEVEL = [0, 0.005, 0.01, 0.02, 0.03];
const ZV_BONUS_BY_LEVEL = [0, 0.05, 0.10, 0.15, 0.20];
const ST_ATTACK_BONUS = [0, 0.05, 0.10, 0.15, 0.20];
const ST_DEFENSE_BONUS = [0, 0.10, 0.20, 0.30, 0.40];
const LONG_SHOT_PROB_BONUS = [0, 0.03, 0.06, 0.09, 0.12];

const POSITION_WEIGHTS: Record<string, { ap: number; dp: number }> = {
  GK: { ap: 0.00, dp: 1.00 },
  LD: { ap: 0.20, dp: 0.80 }, RD: { ap: 0.20, dp: 0.80 },
  CD: { ap: 0.10, dp: 0.90 }, CB: { ap: 0.10, dp: 0.90 }, LCB: { ap: 0.10, dp: 0.90 }, RCB: { ap: 0.10, dp: 0.90 }, SW: { ap: 0.10, dp: 0.90 },
  LB: { ap: 0.30, dp: 0.70 }, RB: { ap: 0.30, dp: 0.70 }, LWB: { ap: 0.30, dp: 0.70 }, RWB: { ap: 0.30, dp: 0.70 },
  DM: { ap: 0.15, dp: 0.85 }, CDM: { ap: 0.15, dp: 0.85 },
  CM: { ap: 0.35, dp: 0.65 }, LCM: { ap: 0.35, dp: 0.65 }, RCM: { ap: 0.35, dp: 0.65 },
  CAM: { ap: 0.60, dp: 0.40 }, AMC: { ap: 0.60, dp: 0.40 },
  LM: { ap: 0.65, dp: 0.35 }, RM: { ap: 0.65, dp: 0.35 },
  ST: { ap: 0.90, dp: 0.10 }, LS: { ap: 0.90, dp: 0.10 }, RS: { ap: 0.90, dp: 0.10 }, CF: { ap: 0.80, dp: 0.20 },
  LW: { ap: 0.75, dp: 0.25 }, RW: { ap: 0.75, dp: 0.25 }, LF: { ap: 0.80, dp: 0.20 }, RF: { ap: 0.80, dp: 0.20 },
};

// --- УТИЛИТЫ ---
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const randRange = (a: number, b: number) => a + Math.random() * (b - a);
const pickOne = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const normPos = (p: string) => (p || "").toUpperCase().trim();
const getLineByPos = (pos: string): "GK" | "DF" | "MF" | "FW" => {
  const p = normPos(pos);
  if (p === "GK") return "GK";
  if (["LB", "RB", "LCB", "RCB", "CB", "SW"].includes(p)) return "DF";
  if (["DM", "CM", "CAM", "LM", "RM"].includes(p)) return "MF";
  return "FW";
};
const isAttackerPos = (pos: string) => ATTACKING_POSITIONS.has(normPos(pos));
const countAttackers = (team: EngineTeam) => team.players.filter((p) => isAttackerPos(p.assignedPosition)).length;

const getPositionEffect = (tactic: Philosophy, pos: string): PositionEffect => {
  const p = normPos(pos);
  const matrix = TACTIC_POSITION_MATRIX[tactic] || {};
  return matrix[p] || "NEUTRAL";
};

const applyPositionEffect = (rs: number, effect: PositionEffect) => {
  if (effect === "BUFF") return rs * 1.05;
  if (effect === "NERF") return rs * 0.95;
  return rs;
};

// --- РАСЧЕТЫ (ФОН) ---

const calcPlayerRS = (player: EnginePlayer, teamTactic: Philosophy, isHome: boolean) => {
  let rs = player.power || 0;
  const matrix = STYLE_BONUS_MATRIX[teamTactic];
  const styleBonusPercent = 
    (player.specKr || 0) * matrix.specKr + (player.specKt || 0) * matrix.specKt +
    (player.specRv || 0) * matrix.specRv + (player.specVp || 0) * matrix.specVp +
    (player.specIbm || 0) * matrix.specIbm + (player.specKp || 0) * matrix.specKp;

  rs = rs * (1 + styleBonusPercent);
  const posEffect = getPositionEffect(teamTactic, player.assignedPosition);
  rs = applyPositionEffect(rs, posEffect);
  void isHome; 
  return rs;
};

const applyTeamBonuses = (team: EngineTeam, playerRS: Map<string, number>) => {
  const leaderLevelMax = Math.max(0, ...team.players.map((p) => p.specL || 0));
  const leaderBonus = LEADER_BONUS_BY_LEVEL[Math.min(leaderLevelMax, 4)] || 0;
  const leaderMul = 1 + leaderBonus;
  
  const legendLevelMax = Math.max(0, ...team.players.map((p) => p.specKi || 0));
  const LEGEND_HOME_K_PER_LVL = 0.00;
  const legendMul = team.isHome ? 1 + legendLevelMax * LEGEND_HOME_K_PER_LVL : 1;

  for (const p of team.players) {
    const base = playerRS.get(p.id) || 0;
    playerRS.set(p.id, base * leaderMul * legendMul);
  }
};

const whoWinsCollision = (t1: Philosophy, t2: Philosophy): "T1" | "T2" | "NONE" => {
  if (COLLISION_WINS_AGAINST[t1] === t2) return "T1";
  if (COLLISION_WINS_AGAINST[t2] === t1) return "T2";
  return "NONE";
};

const applyCollisionBonus = (team: EngineTeam, playerRS: Map<string, number>, didWin: boolean) => {
  if (!didWin) return;
  const dir = TACTIC_DIRECTION[team.tactic];
  const bonus = COLLISION_BONUS[dir];
  const mul = 1 + bonus;
  for (const p of team.players) {
    const base = playerRS.get(p.id) || 0;
    playerRS.set(p.id, base * mul);
  }
};

const calcTeamAPDP = (team: EngineTeam, playerRS: Map<string, number>) => {
  let ap = 0;
  let dp = 0;
  for (const p of team.players) {
    const rs = playerRS.get(p.id) || 0;
    const pos = normPos(p.assignedPosition);
    const weights = POSITION_WEIGHTS[pos] || { ap: 0.35, dp: 0.65 };
    ap += rs * weights.ap;
    dp += rs * weights.dp;
  }
  return { ap, dp };
};

type DefenseGuessOutcome = {
  guessed: boolean;
  chanceQualityMul: number;
  disruptionMul: number;
};

const evalDefenseGuess = (defender: EngineTeam, attacker: EngineTeam): DefenseGuessOutcome => {
  const attackers = countAttackers(attacker);
  const correct = attackers <= 3 ? "MAN_MARKING" : "ZONAL";
  const guessed = defender.defenseSetup === correct;
  const QUALITY_MUL_IF_GUESSED = 0.85;
  const DISRUPT_MUL_IF_GUESSED = 1.20;
  return {
    guessed,
    chanceQualityMul: guessed ? QUALITY_MUL_IF_GUESSED : 1.0,
    disruptionMul: guessed ? DISRUPT_MUL_IF_GUESSED : 1.0,
  };
};

// --- МИКРО-ДУЭЛИ ---

const calcDisruptionChance = (defenders: EnginePlayer[], base: number, setPieceType: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY") => {
  const leader = defenders.reduce((prev, current) => (prev.power > current.power) ? prev : current);
  let powerFactor = 1 + (leader.power - 50) * 0.005;

  // Если это стандарт (кроме пенальти), защита организуется лучше
  if (setPieceType !== "NONE" && setPieceType !== "PENALTY") {
    const stLevel = leader.specSt || 0;
    const stBonus = ST_DEFENSE_BONUS[Math.min(stLevel, 4)] || 0;
    powerFactor *= (1 + stBonus);
  }

  const INT_K_PER_LVL = 0.00;
  const ANT_K_PER_LVL = 0.00;
  const maxIntercept = Math.max(0, ...defenders.map((p) => p.specInt || 0));
  const maxAnt = Math.max(0, ...defenders.map((p) => p.specAnt || 0));
  const specFactor = (1 + maxIntercept * INT_K_PER_LVL) * (1 + maxAnt * ANT_K_PER_LVL);

  const chance = base * powerFactor * specFactor;
  return clamp(chance, 0, 0.95);
};

type ShotOutcome = { saved: boolean; finalXG: number };

const resolveShot = (shooter: EnginePlayer, gk: EnginePlayer | undefined, baseShotXG: number, shotType: "NORMAL" | "LONG", setPieceType: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY"): ShotOutcome => {
  // 1. Сила Бьющего
  let shooterPower = shooter.power;
  const zvLevel = shooter.specZv || 0;
  const zvBonus = ZV_BONUS_BY_LEVEL[Math.min(zvLevel, 4)] || 0;
  shooterPower = shooterPower * (1 + zvBonus);

  // Бонус Стандарта (если это стандарт)
  if (setPieceType !== "NONE") {
    const stLevel = shooter.specSt || 0;
    const stBonus = ST_ATTACK_BONUS[Math.min(stLevel, 4)] || 0;
    shooterPower = shooterPower * (1 + stBonus);
  }

  // 2. Сила Вратаря
  let gkPower = gk ? gk.power : 1; 

  // 3. Баттл
  const powerRatio = shooterPower / (gkPower + 1e-9);
  
  // 4. xG
  let xg = baseShotXG * Math.pow(powerRatio, 1.5);

  // 5. Дальний
  if (shotType === "LONG") {
    const longLevel = shooter.specLong || 0;
    const rawBonus = LONG_SHOT_PROB_BONUS[Math.min(longLevel, 4)] || 0;
    const pos = normPos(shooter.assignedPosition);
    let posCoef = 0.3;
    if (LONG_SHOT_FULL_POSITIONS.has(pos)) posCoef = 1.0; 
    else if (LONG_SHOT_MID_POSITIONS.has(pos)) posCoef = 0.6; 
    xg = xg * (1 + rawBonus * posCoef);
  }

  // 6. Проверка гола
  xg = clamp(xg, 0.01, 0.99);
  const saved = Math.random() > xg; 

  return { saved, finalXG: xg };
};

// --- ГЕНЕРАТОР ТЕКСТА ---
const generateEventText = (
  type: "GOAL" | "SAVE" | "SHOT",
  setPiece: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY",
  isLong: boolean,
  shooter: EnginePlayer,
  assist?: EnginePlayer,
  gk?: EnginePlayer
): string => {
  const shooterName = shooter.name;
  const assistName = assist ? assist.name : "";
  const gkName = gk ? gk.name : "Вратарь";

  if (type === "GOAL") {
    if (setPiece === "PENALTY") return `ГОЛ! ${shooterName} хладнокровно реализует пенальти!`;
    if (setPiece === "FREE_KICK") return `ГОЛ! Великолепный удар со штрафного в исполнении ${shooterName}!`;
    if (setPiece === "CORNER") return `ГОЛ! ${assistName} навешивает с углового, и ${shooterName} вколачивает мяч в сетку!`;
    
    if (isLong) return `ГОЛ! Невероятный дальний выстрел! ${shooterName} застает вратаря врасплох!`;
    
    if (assist) return `ГОЛ! ${assistName} выводит на удар, и ${shooterName} не промахивается!`;
    return `ГОЛ! ${shooterName} берет игру на себя и забивает!`;
  }

  if (type === "SAVE") {
    if (setPiece === "PENALTY") return `СЕЙВ! ${gkName} тащит пенальти от ${shooterName}!`;
    if (isLong) return `Удар издали от ${shooterName} — ${gkName} на месте.`;
    return `Опасный момент! ${shooterName} бьет, но ${gkName} спасает команду!`;
  }

  // type === SHOT (мимо)
  if (setPiece === "FREE_KICK") return `Опасно со штрафного бьет ${shooterName}, но мяч проходит мимо.`;
  if (isLong) return `Дальний удар ${shooterName} — неточно.`;
  return `Хорошая попытка от ${shooterName}, но мяч не идет в створ.`;
};


// --- ГЛАВНАЯ ФУНКЦИЯ ---

export function playMatch(t1Data: EngineTeam, t2Data: EngineTeam): MatchResult {
  const home = t1Data.isHome ? t1Data : t2Data;
  const away = t1Data.isHome ? t2Data : t1Data;

  const homeRS = new Map<string, number>();
  const awayRS = new Map<string, number>();

  for (const p of home.players) homeRS.set(p.id, calcPlayerRS(p, home.tactic, true));
  for (const p of away.players) awayRS.set(p.id, calcPlayerRS(p, away.tactic, false));

  applyTeamBonuses(home, homeRS);
  applyTeamBonuses(away, awayRS);

  const winner = whoWinsCollision(home.tactic, away.tactic);
  applyCollisionBonus(home, homeRS, winner === "T1");
  applyCollisionBonus(away, awayRS, winner === "T2");

  const homeAPDP = calcTeamAPDP(home, homeRS);
  const awayAPDP = calcTeamAPDP(away, awayRS);

  const homeDefGuess = evalDefenseGuess(home, away);
  const awayDefGuess = evalDefenseGuess(away, home);

  const xgTotal = randRange(2.6, 2.8);

  const atkEdgeHome = Math.log((homeAPDP.ap + 1e-9) / (awayAPDP.dp + 1e-9));
  const atkEdgeAway = Math.log((awayAPDP.ap + 1e-9) / (homeAPDP.dp + 1e-9));
  const xgShareHome = clamp(0.5 + 0.16 * (atkEdgeHome - atkEdgeAway), 0.25, 0.75);
  const homeXGBase = xgTotal * xgShareHome;
  const awayXGBase = xgTotal * (1 - xgShareHome);

  const homeXG = homeXGBase * awayDefGuess.chanceQualityMul;
  const awayXG = awayXGBase * homeDefGuess.chanceQualityMul;

  const baseChances = 12;
  const homeChances = Math.round(clamp(baseChances * (homeXG / (homeXG + awayXG + 1e-9)), 4, 16));
  const awayChances = baseChances - homeChances;

  let homeGoalsCount = 0;
  let awayGoalsCount = 0;
  const events: MatchEvent[] = [];

  const getGK = (team: EngineTeam) => team.players.find((p) => normPos(p.assignedPosition) === "GK");
  const homeGK = getGK(home);
  const awayGK = getGK(away);

  // Выбор бьющего
  const pickAttacker = (team: EngineTeam) => {
    const attackers = team.players.filter((p) => isAttackerPos(p.assignedPosition));
    return attackers.length ? pickOne(attackers) : pickOne(team.players);
  };

  // Выбор ассистента (любой кроме вратаря и бьющего, приоритет MF/Wingers)
  const pickAssistant = (team: EngineTeam, shooterId: string) => {
    const candidates = team.players.filter(p => p.id !== shooterId && normPos(p.assignedPosition) !== "GK");
    if (candidates.length === 0) return undefined;
    // Можно добавить логику приоритета плеймейкеров тут, пока рандом
    return pickOne(candidates);
  };

  const pickDefenders = (team: EngineTeam) => {
    const defenders = team.players.filter((p) => ["DF", "MF"].includes(getLineByPos(p.assignedPosition)));
    return defenders.length ? defenders : team.players;
  };

  const simulateTurn = (attackerTeam: EngineTeam, defenderTeam: EngineTeam, isHomeAttack: boolean, chances: number) => {
    const defenderGK = isHomeAttack ? awayGK : homeGK;
    const teamTag = isHomeAttack ? "HOME" : "AWAY";
    const defenderAPDP = isHomeAttack ? awayAPDP : homeAPDP;
    const attackerAPDP = isHomeAttack ? homeAPDP : awayAPDP;
    const defGuess = isHomeAttack ? awayDefGuess : homeDefGuess;

    for (let i = 0; i < chances; i++) {
      const minute = Math.floor(randRange(1, 91));
      const defenders = pickDefenders(defenderTeam);
      
      // Тип момента: Игра, Угловой, Штрафной, Пенальти
      const rnd = Math.random();
      let setPieceType: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY" = "NONE";
      
      if (rnd < 0.02) setPieceType = "PENALTY"; // 2% Пенальти
      else if (rnd < 0.08) setPieceType = "FREE_KICK"; // 6% Штрафной
      else if (rnd < 0.18) setPieceType = "CORNER"; // 10% Угловой
      // Остальное - с игры

      // Срыв атаки (Пенальти сорвать нельзя)
      if (setPieceType !== "PENALTY") {
        const baseDisrupt = clamp(0.30 + (defenderAPDP.dp - attackerAPDP.ap) / (attackerAPDP.ap + defenderAPDP.dp + 1e-9), 0.15, 0.70);
        const disruptChance = calcDisruptionChance(defenders, baseDisrupt, setPieceType) * defGuess.disruptionMul;
        
        if (Math.random() < disruptChance) {
          const disruptText = isHomeAttack ? "Атака хозяев сорвана обороной." : "Атака гостей сорвана обороной.";
          events.push({ minute, type: "CHANCE", team: teamTag, text: disruptText, isGoal: false });
          continue;
        }
      }

      // Если дошли до удара
      const shooter = pickAttacker(attackerTeam);
      const assistant = (setPieceType === "NONE" || setPieceType === "CORNER") ? pickAssistant(attackerTeam, shooter.id) : undefined;
      
      // Дальний удар? (Только с игры и иногда со штрафного)
      let isLong = false;
      if (setPieceType === "NONE" && Math.random() < 0.25) isLong = true;
      if (setPieceType === "FREE_KICK" && Math.random() < 0.40) isLong = true;

      // Базовый xG
      let baseShotXG = 0.12; // Средний
      if (setPieceType === "PENALTY") baseShotXG = 0.78;
      else if (setPieceType === "CORNER") baseShotXG = 0.09;
      else if (setPieceType === "FREE_KICK") baseShotXG = 0.07; // Прямой удар сложен
      else if (isLong) baseShotXG = randRange(0.03, 0.09);
      else baseShotXG = randRange(0.10, 0.35); // Близкий удар с игры

      // Расчет
      const { saved, finalXG } = resolveShot(shooter, defenderGK, baseShotXG, isLong ? "LONG" : "NORMAL", setPieceType);
      
      // Формируем событие
      if (saved) {
        const text = generateEventText("SAVE", setPieceType, isLong, shooter, assistant, defenderGK);
        events.push({ minute, type: "SAVE", team: teamTag, text, isGoal: false, player: { id: shooter.id, name: shooter.name } });
      } else {
        // Мимо или Гол?
        // В resolveShot мы уже определили saved (сейв или мимо считаем одним неуспехом для простоты, 
        // но здесь можно разделить. Если saved=false, значит залетело, если saved=true - не залетело.
        // Стоп, resolveShot возвращает saved=true если ВРАТАРЬ СПАС/ПРОМАХ. saved=false если ГОЛ? 
        // Смотрим код resolveShot: const saved = Math.random() > xg. 
        // Если xG 0.8, random 0.1 -> saved=false (ГОЛ). Логика верная.
        
        // Но нам нужно различить "Сейв" и "Мимо" для красоты. 
        // Давай считать, что resolveShot вернул "не гол".
        // Сейчас в коде выше: if (saved) -> SAVE. Значит это НЕ гол.
        
        // В блоке ELSE (значит saved = false, значит ГОЛ)
        if (isHomeAttack) homeGoalsCount++; else awayGoalsCount++;
        const text = generateEventText("GOAL", setPieceType, isLong, shooter, assistant, defenderGK);
        
        events.push({ 
          minute, 
          type: "GOAL", 
          team: teamTag, 
          text, 
          isGoal: true, 
          player: { id: shooter.id, name: shooter.name },
          assist: assistant ? { id: assistant.id, name: assistant.name } : undefined
        });
      }
      
      // Добавим промахи (SHOT) отдельно? 
      // В текущей логике `saved` объединяет и сейв и промах. 
      // Давай добавим 3-й исход в resolveShot? Или упростим:
      // Если saved = true, то с вероятностью 50% это Сейв, 50% Мимо.
      if (saved) {
         // Мы уже запушили SAVE выше. Давай поменяем тип на SHOT если это промах
         // Переделаем немного логику выше
      }
    }
  };

  // Перепишем циклы симуляции, используя функцию simulateTurn для чистоты, 
  // но чтобы не ломать структуру, я вставлю логику прямо в циклы как было, но обновленную.
  
  // --- СИМУЛЯЦИЯ ХОЗЯЕВ (ОБНОВЛЕННАЯ) ---
  for (let i = 0; i < homeChances; i++) {
    const minute = Math.floor(randRange(1, 91));
    const defenders = pickDefenders(away);
    
    // 1. Тип момента
    const rnd = Math.random();
    let setPieceType: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY" = "NONE";
    if (rnd < 0.02) setPieceType = "PENALTY";
    else if (rnd < 0.08) setPieceType = "FREE_KICK";
    else if (rnd < 0.18) setPieceType = "CORNER";

    // 2. Срыв (кроме пенальти)
    if (setPieceType !== "PENALTY") {
      const baseDisrupt = clamp(0.30 + (awayAPDP.dp - homeAPDP.ap) / (homeAPDP.ap + awayAPDP.dp + 1e-9), 0.15, 0.70);
      const disruptChance = calcDisruptionChance(defenders, baseDisrupt, setPieceType) * awayDefGuess.disruptionMul;
      if (Math.random() < disruptChance) {
        events.push({ minute, type: "CHANCE", team: "HOME", text: "Атака хозяев захлебнулась.", isGoal: false });
        continue;
      }
    }

    // 3. Участники
    const shooter = pickAttacker(home);
    // Ассистент возможен только с игры или углового
    const assistant = (setPieceType === "NONE" || setPieceType === "CORNER") ? pickAssistant(home, shooter.id) : undefined;
    
    let isLong = false;
    if (setPieceType === "NONE" && Math.random() < 0.25) isLong = true;
    if (setPieceType === "FREE_KICK" && Math.random() < 0.40) isLong = true;

    // 4. xG
    let baseShotXG = 0.14; 
    if (setPieceType === "PENALTY") baseShotXG = 0.78;
    else if (setPieceType === "CORNER") baseShotXG = 0.10;
    else if (setPieceType === "FREE_KICK") baseShotXG = 0.08;
    else if (isLong) baseShotXG = randRange(0.03, 0.09);
    else baseShotXG = randRange(0.12, 0.40);

    const { saved, finalXG } = resolveShot(shooter, awayGK, baseShotXG, isLong ? "LONG" : "NORMAL", setPieceType);

    if (saved) {
      // Это или Сейв или Промах. Пусть 60% сейв, 40% промах
      const isSave = Math.random() < 0.6;
      const type = isSave ? "SAVE" : "SHOT";
      const text = generateEventText(type, setPieceType, isLong, shooter, assistant, awayGK);
      events.push({ minute, type, team: "HOME", text, isGoal: false, player: { id: shooter.id, name: shooter.name } });
    } else {
      homeGoalsCount++;
      const text = generateEventText("GOAL", setPieceType, isLong, shooter, assistant, awayGK);
      events.push({ 
        minute, type: "GOAL", team: "HOME", text, isGoal: true, 
        player: { id: shooter.id, name: shooter.name },
        assist: assistant ? { id: assistant.id, name: assistant.name } : undefined
      });
    }
  }

  // --- СИМУЛЯЦИЯ ГОСТЕЙ (ОБНОВЛЕННАЯ) ---
  for (let i = 0; i < awayChances; i++) {
    const minute = Math.floor(randRange(1, 91));
    const defenders = pickDefenders(home);
    
    const rnd = Math.random();
    let setPieceType: "NONE" | "CORNER" | "FREE_KICK" | "PENALTY" = "NONE";
    if (rnd < 0.02) setPieceType = "PENALTY";
    else if (rnd < 0.08) setPieceType = "FREE_KICK";
    else if (rnd < 0.18) setPieceType = "CORNER";

    if (setPieceType !== "PENALTY") {
      const baseDisrupt = clamp(0.30 + (homeAPDP.dp - awayAPDP.ap) / (awayAPDP.ap + homeAPDP.dp + 1e-9), 0.15, 0.70);
      const disruptChance = calcDisruptionChance(defenders, baseDisrupt, setPieceType) * homeDefGuess.disruptionMul;
      if (Math.random() < disruptChance) {
        events.push({ minute, type: "CHANCE", team: "AWAY", text: "Атака гостей остановлена защитой.", isGoal: false });
        continue;
      }
    }

    const shooter = pickAttacker(away);
    const assistant = (setPieceType === "NONE" || setPieceType === "CORNER") ? pickAssistant(away, shooter.id) : undefined;
    
    let isLong = false;
    if (setPieceType === "NONE" && Math.random() < 0.25) isLong = true;
    if (setPieceType === "FREE_KICK" && Math.random() < 0.40) isLong = true;

    let baseShotXG = 0.14; 
    if (setPieceType === "PENALTY") baseShotXG = 0.78;
    else if (setPieceType === "CORNER") baseShotXG = 0.10;
    else if (setPieceType === "FREE_KICK") baseShotXG = 0.08;
    else if (isLong) baseShotXG = randRange(0.03, 0.09);
    else baseShotXG = randRange(0.12, 0.40);

    const { saved, finalXG } = resolveShot(shooter, homeGK, baseShotXG, isLong ? "LONG" : "NORMAL", setPieceType);

    if (saved) {
      const isSave = Math.random() < 0.6;
      const type = isSave ? "SAVE" : "SHOT";
      const text = generateEventText(type, setPieceType, isLong, shooter, assistant, homeGK);
      events.push({ minute, type, team: "AWAY", text, isGoal: false, player: { id: shooter.id, name: shooter.name } });
    } else {
      awayGoalsCount++;
      const text = generateEventText("GOAL", setPieceType, isLong, shooter, assistant, homeGK);
      events.push({ 
        minute, type: "GOAL", team: "AWAY", text, isGoal: true, 
        player: { id: shooter.id, name: shooter.name },
        assist: assistant ? { id: assistant.id, name: assistant.name } : undefined
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  const homeShots = events.filter(e => e.team === "HOME" && (e.type === "SHOT" || e.type === "GOAL" || e.type === "SAVE")).length;
  const awayShots = events.filter(e => e.team === "AWAY" && (e.type === "SHOT" || e.type === "GOAL" || e.type === "SAVE")).length;
  const homeGoals = events.filter(e => e.team === "HOME" && e.type === "GOAL").length;
  const awayGoals = events.filter(e => e.team === "AWAY" && e.type === "GOAL").length;
  const homeOnTarget = events.filter(e => e.team === "HOME" && (e.type === "GOAL" || e.type === "SAVE")).length;
  const awayOnTarget = events.filter(e => e.team === "AWAY" && (e.type === "GOAL" || e.type === "SAVE")).length;
  const homeDisrupted = events.filter(e => e.team === "HOME" && e.type === "CHANCE").length;
  const awayDisrupted = events.filter(e => e.team === "AWAY" && e.type === "CHANCE").length;
  const homeSavesByAwayGK = events.filter(e => e.team === "HOME" && e.type === "SAVE").length;
  const awaySavesByHomeGK = events.filter(e => e.team === "AWAY" && e.type === "SAVE").length;

  const collisionWinnerNorm = winner === "T1" ? "HOME" : winner === "T2" ? "AWAY" : "NONE";

  return {
    homeScore: homeGoalsCount,
    awayScore: awayGoalsCount,
    homeXG: Number(homeXG.toFixed(2)),
    awayXG: Number(awayXG.toFixed(2)),
    events,
    debug: {
      xgTotal: Number(xgTotal.toFixed(2)),
      home: {
        tactic: home.tactic,
        defenseSetup: home.defenseSetup,
        ap: Number(homeAPDP.ap.toFixed(1)),
        dp: Number(homeAPDP.dp.toFixed(1)),
        chancesPlanned: homeChances,
        defenseGuess: homeDefGuess,
      },
      away: {
        tactic: away.tactic,
        defenseSetup: away.defenseSetup,
        ap: Number(awayAPDP.ap.toFixed(1)),
        dp: Number(awayAPDP.dp.toFixed(1)),
        chancesPlanned: awayChances,
        defenseGuess: awayDefGuess,
      },
      collision: {
        winner: collisionWinnerNorm,
        homeDirection: TACTIC_DIRECTION[home.tactic],
        awayDirection: TACTIC_DIRECTION[away.tactic],
        homeBonus: COLLISION_BONUS[TACTIC_DIRECTION[home.tactic]],
        awayBonus: COLLISION_BONUS[TACTIC_DIRECTION[away.tactic]],
      },
      derivedFromEvents: {
        homeShots,
        awayShots,
        homeGoals,
        awayGoals,
        homeSavesByAwayGK,
        awaySavesByHomeGK,
        homeOnTarget,
        awayOnTarget,
        homeDisrupted,
        awayDisrupted,
      },
    },
  };
}

