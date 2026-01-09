import { PlayStyleLevel } from "@prisma/client";

// Вспомогательный тип для объекта игрока с плейстайлами
type PlayerWithStyles = {
  age: number;
  power: number;
  sidePosition?: string | null;
  playStyles?: { level: PlayStyleLevel }[];
};

export function getPriceFromPlayerObject(player: any): number {
  const ps = player.playStyles || [];
  
  // Веса уровней
  let styleBonus = 0;
  ps.forEach((p: any) => {
    if (p.level === 'GOLD') styleBonus += 0.15;   // +15% за золото
    else if (p.level === 'SILVER') styleBonus += 0.10; // +10% за серебро
    else styleBonus += 0.05;                      // +5% за бронзу
  });

  const basePrice = Math.pow(Number(player.power), 2.75) * 12;
  
  // Упрощенный множитель возраста
  let ageMult = 1.0;
  if (player.age <= 21) ageMult = 2.0;
  else if (player.age >= 30) ageMult = 0.5;

  let finalPrice = basePrice * ageMult;
  
  // Применяем бонус плейстайлов
  finalPrice *= (1 + styleBonus);

  return Math.round(finalPrice / 1000) * 1000;
}