import { z } from "zod";
import { Position } from "@prisma/client";

// Экспортируем схемы матчей из соседнего файла
export * from "./match.dto";

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
  
  // ИЗМЕНЕНО: Лимит силы увеличен до 200 (было 99)
  power: numberOrString.pipe(z.number().min(1).max(200)), 
  
  mainPosition: z.nativeEnum(Position),
  sidePosition: z.nativeEnum(Position).nullable().optional(),
  teamId: emptyString,
  countryId: emptyString,
  formIndex: numberOrString.optional().default(0),
  
  // Новая система: массив кодов PlayStyles
  playStyles: z.array(z.string()).max(5).optional(), 
});

// --- СХЕМА: МАССОВОЕ СОЗДАНИЕ ИГРОКОВ ---
export const createPlayersBulkSchema = z.array(createPlayerSchema);