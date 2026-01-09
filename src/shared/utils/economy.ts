import { PlayStyleLevel } from "@prisma/client";

/**
 * Коэффициенты возраста на основе данных VFL/VSOL.
 * 18 лет берем за базу (1.0).
 * 16 лет - "золотой актив" (x3.7).
 * После 30 лет цена падает до 5-10% от базы.
 */
const AGE_MULTIPLIERS: Record<number, number> = {
  15: 4.5,
  16: 3.75, // 23.3м / 6.2м ~ 3.75
  17: 1.9,  // 11.8м / 6.2м ~ 1.9
  18: 1.0,  // База (6.2м)
  19: 0.61, // 3.8м / 6.2м
  20: 0.40,
  21: 0.32,
  22: 0.28,
  23: 0.24,
  24: 0.21,
  25: 0.19,
  26: 0.17,
  27: 0.13,
  28: 0.12,
  29: 0.10,
  30: 0.08,
  31: 0.06,
  32: 0.05,
  33: 0.04,
  34: 0.03,
  35: 0.02,
};

// Бонусы за уровни PlayStyles (в процентах к цене)
const PLAYSTYLE_BONUS = {
  BRONZE: 0.20, // +20%
  SILVER: 0.35, // +35%
  GOLD:   0.50, // +50%
};

// Бонус за вторую позицию
const SIDE_POSITION_BONUS = 0.10; // +10%

export function getPriceFromPlayerObject(player: any): number {
  // 1. Базовая цена по силе
  // Формула подобрана так, чтобы 18-летний с силой 53 стоил ~4.3м (без спецух)
  // Base = 0.55 * Power^4
  // Пример: 53^4 = 7,890,481. * 0.55 ≈ 4,339,764
  const power = Number(player.power);
  const basePrice = 0.55 * Math.pow(power, 4);

  // 2. Множитель возраста
  // Если возраст больше 35, берем минимальный кэф 0.01
  const ageMult = AGE_MULTIPLIERS[player.age] || (player.age < 15 ? 5.0 : 0.01);

  let finalPrice = basePrice * ageMult;

  // 3. Бонус за PlayStyles
  // Считаем каждый стиль как множитель
  const ps = player.playStyles || [];
  let styleMultiplier = 1;
  
  ps.forEach((p: any) => {
    // Если p - это объект связи (PlayerPlayStyle), у него есть поле level
    // Если p - просто строка (при создании), считаем как BRONZE или пропускаем
    const level = p.level as PlayStyleLevel;
    if (level === 'GOLD') styleMultiplier += PLAYSTYLE_BONUS.GOLD;
    else if (level === 'SILVER') styleMultiplier += PLAYSTYLE_BONUS.SILVER;
    else styleMultiplier += PLAYSTYLE_BONUS.BRONZE; // Bronze или дефолт
  });

  finalPrice *= styleMultiplier;

  // 4. Бонус за совмещение
  if (player.sidePosition) {
    finalPrice *= (1 + SIDE_POSITION_BONUS);
  }

  // Округляем до тысяч (как в примере "4 277к")
  return Math.round(finalPrice / 1000) * 1000;
}