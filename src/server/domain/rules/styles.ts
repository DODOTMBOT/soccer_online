import { VflStyle } from "@prisma/client";

// Типы для удобства
export type StyleCategory = "POSITIONAL" | "POWER"; // Игровая / Силовая
export type StyleDirection = "ATTACK" | "UNIVERSAL" | "DEFENSE";

interface StyleConfig {
  name: string;
  category: StyleCategory;
  direction: StyleDirection;
  beats: VflStyle | null; // Кого побеждает
}

// 1. ПОЛНАЯ КОНФИГУРАЦИЯ СТИЛЕЙ
export const VFL_STYLES: Record<VflStyle, StyleConfig> = {
  NORMAL: { 
    name: "Нормальный", 
    category: "POWER", // Условно
    direction: "UNIVERSAL", 
    beats: null 
  },

  // --- ИГРОВЫЕ (POSITIONAL) ---
  JOGA_BONITO: {
    name: "Джога Бонито",
    category: "POSITIONAL",
    direction: "ATTACK",
    beats: "CHOLO" // -> бьет Чоло
  },
  TIKI_TAKA: {
    name: "Тики-така",
    category: "POSITIONAL",
    direction: "UNIVERSAL",
    beats: "BUS" // -> бьет Автобус
  },
  GEGENPRESS: {
    name: "Гегенпрессинг",
    category: "POSITIONAL",
    direction: "DEFENSE",
    beats: "INTENSIVO" // -> бьет Интенсив
  },

  // --- СИЛОВЫЕ (POWER) ---
  INTENSIVO: {
    name: "Интенсив",
    category: "POWER",
    direction: "ATTACK",
    beats: "TIKI_TAKA" // -> бьет Тики-таку
  },
  CHOLO: {
    name: "Чоло-система",
    category: "POWER",
    direction: "UNIVERSAL",
    beats: "GEGENPRESS" // -> бьет Гегенпрессинг
  },
  BUS: {
    name: "Автобус",
    category: "POWER",
    direction: "DEFENSE",
    beats: "JOGA_BONITO" // -> бьет Джога Бонито
  }
};

// 2. НАСТРОЙКИ БОНУСА
export const COLLISION_CONFIG = {
  // Бонус к Реальной Силе (РС) всей команды за победу в коллизии
  WIN_BONUS_PERCENT: 0.15, // +15% (можешь менять это число здесь)
  
  // Если коллизия проиграна или ничья - бонусов нет (0)
  LOSE_BONUS_PERCENT: 0,
};

/**
 * Проверка коллизии. Возвращает бонус для команды A против команды B.
 */
export function getCollisionBonus(styleA: VflStyle, styleB: VflStyle): number {
  if (styleA === "NORMAL" || styleB === "NORMAL") return 0;

  const configA = VFL_STYLES[styleA];
  
  // Если стиль А бьет стиль Б
  if (configA.beats === styleB) {
    return COLLISION_CONFIG.WIN_BONUS_PERCENT;
  }

  return 0;
}