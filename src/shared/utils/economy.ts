// lib/economy.ts

/**
 * Вспомогательная функция для подсчета суммы уровней всех спецух игрока
 */
export function getTotalSpecLevels(player: any): number {
  const specKeys = [
    'specKr', 'specKt', 'specRv', 'specVp', 'specIbm', 'specKp',
    'specZv', 'specSt', 'specL', 'specKi', 'specPhys', 'specLong',
    'specInt', 'specAnt', 'specSpd', 'specGkRea', 'specGkPos'
  ];
  return specKeys.reduce((sum, key) => sum + (Number(player[key]) || 0), 0);
}

/**
 * Расчет рыночной стоимости игрока (базовая логика)
 */
export function calculateRealPrice(params: {
  age: number;
  power: number;
  hasSidePosition: boolean;
  totalSpecLevels: number;
}) {
  const { age, power, hasSidePosition, totalSpecLevels } = params;

  // 1. БАЗОВАЯ ЦЕНА ОТ СИЛЫ
  let basePrice = Math.pow(power, 2.75) * 12;

  // 2. ВОЗРАСТНОЙ МНОЖИТЕЛЬ
  const getAgeMultiplier = (a: number) => {
    if (a <= 16) return 4.5;    
    if (a === 17) return 2.2;   
    if (a === 18) return 1.0;   
    if (a === 19) return 0.75;  
    if (a <= 21) return 0.45;   
    if (a <= 25) return 0.15;   
    if (a <= 29) return 0.06;   
    if (a <= 33) return 0.02;   
    return Math.max(0.005, 0.015 / (a - 32)); 
  };

  let currentPrice = basePrice * getAgeMultiplier(age);

  // 3. МНОЖИТЕЛЬ СОВМЕЩЕНИЯ (+25%)
  if (hasSidePosition) {
    currentPrice *= 1.25;
  }

  // 4. ОГРОМНЫЙ ВЕС СПЕЦВОЗМОЖНОСТЕЙ (+25% за уровень)
  const specBonus = 1 + (totalSpecLevels * 0.25);
  currentPrice *= specBonus;

  return Math.round(currentPrice / 1000) * 1000;
}

/**
 * ТА САМАЯ ФУНКЦИЯ ДЛЯ API, КОТОРОЙ НЕ ХВАТАЛО
 * Принимает объект игрока и возвращает число-цену
 */
export function getPriceFromPlayerObject(player: any): number {
  return calculateRealPrice({
    age: Number(player.age),
    power: Number(player.power),
    hasSidePosition: !!player.sidePosition,
    totalSpecLevels: getTotalSpecLevels(player)
  });
}

/**
 * Определение визуальной категории игрока по силе
 */
export function getPlayerCategory(power: number) {
  if (power >= 161) return { label: "Феномен", color: "text-purple-600 bg-purple-50 border-purple-200" };
  if (power >= 131) return { label: "Мировой топ", color: "text-red-600 bg-red-50 border-red-200" };
  if (power >= 91) return { label: "Звезда", color: "text-orange-600 bg-orange-50 border-orange-200" };
  if (power >= 61) return { label: "Основа", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  return { label: "Резерв", color: "text-gray-500 bg-gray-50 border-gray-200" };
}