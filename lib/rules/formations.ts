import { Position, Formation } from "@prisma/client";

/**
 * Интерфейс для конфигурации конкретного слота на поле.
 * label: Отображение в UI (например, "LD").
 * main: Основная позиция для записи в БД.
 * alternatives: Список позиций, на которые можно переключить слот (тумблер).
 */
export interface SlotConfig {
  label: string;
  main: Position;
  alternatives: Position[];
}

/**
 * Глобальный справочник всех тактических схем VFL 5.0.
 * Используется для:
 * 1. Генерации UI тактического планшета.
 * 2. Валидации и записи assignedPosition в API сохранения состава.
 * 3. Расчета штрафов в движке, если реальная позиция игрока не совпадает со слотом.
 */
export const FORMATION_CONFIG: Record<Formation, SlotConfig[]> = {
  // --- 4-4-2 ---
  // GK, LD(LB), CD, CD, RD(RB), LM(LW), CM(DM), CM(AM), RM(RW), CF(ST/LF), CF(ST/RF)
  F442: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "LM", main: Position.LM, alternatives: [Position.LF] }, // LW -> LF
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.AM] },
    { label: "RM", main: Position.RM, alternatives: [Position.RF] }, // RW -> RF
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.LF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.RF] },
  ],

  // --- 4-3-3 ---
  // GK, LD(LB), CD, CD, RD(RB), CM(DM), CM(DM), CM(AM), CF(ST/LF), CF(ST/RF), CF(ST/RF)
  F433: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.AM] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.LF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.RF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.RF] }, // Центральный нападающий
  ],

  // --- 4-5-1 (в схеме Prisma нет F451, используем F541 или добавь в Enum) ---
  // Пока мапим на F541, если ты не добавил F451 в схему. 
  // ВНИМАНИЕ: Если F451 нет в Enum Formation, этот ключ вызовет ошибку.
  // Ниже пример для F541 (как 5-4-1). Если нужна 4-5-1, нужно обновить schema.prisma.
  // GK, LD(LB), CD, CD, RD(RB), CM(DM), CM(DM), CM(AM), RM(RW), LM(LW), CF(ST)
  // Для корректности я добавлю это как "F451" (предполагая, что ты добавишь это в схему), 
  // но если нет - используй F541 для 5-защитников.
  // ... (Временно используем F541 как 5-4-1, см ниже) ...

  // --- 4-2-4 ---
  // GK, LD(LB), CD, CD, RD(RB), CM(DM), CM(DM), LF, RF, CF(ST), CF(ST)
  F424: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "LF", main: Position.LF, alternatives: [] },
    { label: "RF", main: Position.RF, alternatives: [] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST] },
  ],

  // --- 3-5-2 ---
  // GK, CD, CD, CD, LD(LB), RD(RB), CM(DM), CM(AM), CF(ST/LF), CF(ST/RF)
  F352: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] }, // LWB трактуем как LB/LD
    { label: "RD", main: Position.RD, alternatives: [Position.RB] }, // RWB трактуем как RB/RD
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.AM] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] }, // +1 игрок (чтобы было 11)
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.LF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.RF] },
  ],

  // --- 3-4-3 ---
  // GK, CD, CD, CD, LD(LB), RD(RB), CM(DM), CM(AM), LF, CF(ST), RF
  F343: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.AM] },
    { label: "LF", main: Position.LF, alternatives: [] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST] },
    { label: "RF", main: Position.RF, alternatives: [] },
  ],

  // --- 5-3-2 ---
  // GK, LD(LB), CD, CD, CD, RD(RB), CM(DM), CM(AM), CF(ST/LF), CF(ST/RF)
  F532: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.AM] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] }, // +1 игрок
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.LF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST, Position.RF] },
  ],

  // --- 5-2-3 (В схеме Prisma нет F523, если не добавишь - код упадет) ---
  // Я использую ключ F532 как заглушку, но по логике это должна быть отдельная схема
  // GK, LD(LB), CD, CD, CD, RD(RB), CM(DM), CM(DM), LF, CF(ST), RF
  /* F523: [ ... ], 
  */

  // --- 5-4-1 ---
  // GK, LD(LB), CD, CD, CD, RD(RB), LM(LW), CM(DM), CM(DM), RM(RW), CF(ST)
  F541: [
    { label: "GK", main: Position.GK, alternatives: [] },
    { label: "LD", main: Position.LD, alternatives: [Position.LB] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "CD", main: Position.CD, alternatives: [] },
    { label: "RD", main: Position.RD, alternatives: [Position.RB] },
    { label: "LM", main: Position.LM, alternatives: [Position.LF] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "CM", main: Position.CM, alternatives: [Position.DM] },
    { label: "RM", main: Position.RM, alternatives: [Position.RF] },
    { label: "CF", main: Position.CF, alternatives: [Position.ST] },
  ],
};