import { z } from "zod";
import { Position, VflStyle, DefenseType, Formation, Mentality, TeamSpirit } from "@prisma/client";

// --- УТИЛИТЫ ---
const emptyString = z.string().min(1, "Поле обязательно");
const numberOrString = z.union([z.string(), z.number()]).transform((v) => Number(v));

// --- СХЕМЫ ДЛЯ КОМАНД ---
export const createTeamSchema = z.object({
  name: z.string().min(3, "Название минимум 3 символа"),
  logo: z.string().url("Некорректная ссылка на лого").optional().or(z.literal("")),
  countryId: emptyString,
  leagueId: emptyString,
  stadium: emptyString,
  finances: numberOrString.optional().default(0),
  capacity: numberOrString.optional().default(20000),
  baseLevel: numberOrString.optional().default(1),
  managerId: z.string().optional().nullable(),
});

// --- СХЕМЫ ДЛЯ ИГРОКОВ ---
export const createPlayerSchema = z.object({
  firstName: emptyString,
  lastName: emptyString,
  age: numberOrString.pipe(z.number().min(15).max(45)),
  power: numberOrString.pipe(z.number().min(1).max(99)),
  mainPosition: z.nativeEnum(Position),
  sidePosition: z.nativeEnum(Position).nullable().optional(),
  teamId: emptyString,
  countryId: emptyString,
  formIndex: numberOrString.optional().default(0),
  
  // Спецухи (опционально, по умолчанию 0)
  specSpd: numberOrString.optional().default(0),
  specHeading: numberOrString.optional().default(0),
  specLong: numberOrString.optional().default(0),
  specShortPass: numberOrString.optional().default(0),
  specKt: numberOrString.optional().default(0), // Dribbling
  specCombination: numberOrString.optional().default(0),
  specTackling: numberOrString.optional().default(0),
  specMarking: numberOrString.optional().default(0),
  specZv: numberOrString.optional().default(0), // Shooting
  specSt: numberOrString.optional().default(0), // FreeKicks
  specCorners: numberOrString.optional().default(0),
  specPenalty: numberOrString.optional().default(0),
  specL: numberOrString.optional().default(0), // Captain
  specKi: numberOrString.optional().default(0), // Leader
  specPhys: numberOrString.optional().default(0),
  specSimulation: numberOrString.optional().default(0),
  specGkRea: numberOrString.optional().default(0),
  specGkPos: numberOrString.optional().default(0),
});

// --- СХЕМЫ ДЛЯ СОСТАВА (Lineup) ---
export const matchLineupSchema = z.object({
  matchId: emptyString,
  teamId: emptyString,
  playerIds: z.array(z.string()).length(11, "В основе должно быть ровно 11 игроков"),
  subIds: z.array(z.string()).optional().default([]),
  
  tactic: z.nativeEnum(VflStyle).default("NORMAL"),
  defenseSetup: z.nativeEnum(DefenseType).default("ZONAL"),
  formation: z.nativeEnum(Formation).default("F442"),
  mentality: z.nativeEnum(Mentality).default("NORMAL"),
  spirit: z.nativeEnum(TeamSpirit).default("NORMAL"),
});

// --- СХЕМА: МАССОВОЕ СОЗДАНИЕ ИГРОКОВ (Для формы "Реестр") ---
export const createPlayersBulkSchema = z.array(createPlayerSchema);