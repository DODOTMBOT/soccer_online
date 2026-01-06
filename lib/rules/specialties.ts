// lib/rules/specialties.ts

import { VflStyle } from "@prisma/client";

export type SpecialtyKey = "specKr" | "specKt" | "specRv" | "specVp" | "specIbm" | "specKp";

interface SpecialtyBonus {
  main: number;      // Бонус при родном стиле
  secondary: number; // Бонус при смежном стиле (модель игры)
  normal: number;    // Бонус при нормальном стиле
  related: number;   // Бонус при третьем стиле модели
  other: number;     // Бонус при всех остальных стилях
}

// Базовые коэффициенты для 1-го уровня спецухи
const BASE_BONUSES: Record<SpecialtyKey, Record<VflStyle, number>> = {
  // Креатив (Joga Bonito)
  specKr: {
    JOGA_BONITO: 0.10,
    GEGENPRESS: 0.06,
    NORMAL: 0.05,
    TIKI_TAKA: 0.04,
    INTENSIVO: 0.02, CHOLO: 0.02, BUS: 0.02
  },
  // Контроль темпа (Тики-така)
  specKt: {
    TIKI_TAKA: 0.10,
    JOGA_BONITO: 0.06,
    NORMAL: 0.05,
    GEGENPRESS: 0.04,
    INTENSIVO: 0.02, CHOLO: 0.02, BUS: 0.02
  },
  // Рывки (Гегенпрессинг)
  specRv: {
    GEGENPRESS: 0.10,
    TIKI_TAKA: 0.06,
    NORMAL: 0.05,
    JOGA_BONITO: 0.04,
    INTENSIVO: 0.02, CHOLO: 0.02, BUS: 0.02
  },
  // Вертикальные передачи (Интенсив)
  specVp: {
    INTENSIVO: 0.10,
    BUS: 0.06,
    NORMAL: 0.05,
    CHOLO: 0.04,
    JOGA_BONITO: 0.02, TIKI_TAKA: 0.02, GEGENPRESS: 0.02
  },
  // Игра без мяча (Чоло)
  specIbm: {
    CHOLO: 0.10,
    INTENSIVO: 0.06,
    NORMAL: 0.05,
    BUS: 0.04,
    JOGA_BONITO: 0.02, TIKI_TAKA: 0.02, GEGENPRESS: 0.02
  },
  // Компактность (Автобус)
  specKp: {
    BUS: 0.10,
    CHOLO: 0.06,
    NORMAL: 0.05,
    INTENSIVO: 0.04,
    JOGA_BONITO: 0.02, TIKI_TAKA: 0.02, GEGENPRESS: 0.02
  }
};

/**
 * Рассчитывает суммарный бонус от спецух для игрока.
 * @param player Объект игрока со значениями specKr, specKt и т.д.
 * @param currentStyle Текущий стиль игры команды.
 * @returns Множитель силы (например, 1.15 для +15%)
 */
export function calculateSpecialtyMultiplier(player: any, currentStyle: VflStyle): number {
  let totalBonus = 0;

  const keys: SpecialtyKey[] = ["specKr", "specKt", "specRv", "specVp", "specIbm", "specKp"];

  keys.forEach(key => {
    const level = parseInt(player[key] || "0");
    if (level > 0) {
      // Берем базовый бонус для 1-го уровня и умножаем на уровень (1-4)
      const baseBonus = BASE_BONUSES[key][currentStyle] || 0.02;
      totalBonus += baseBonus * level;
    }
  });

  return 1 + totalBonus;
}