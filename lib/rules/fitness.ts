// lib/rules/fitness.ts

// Твоя синусоида: 75 -> 80 -> 90 -> 100 -> 105 -> 115 -> 125
// И затем обратно: 115 -> 105 -> 100 -> 90 -> 80
export const FORM_CURVE = [75, 80, 90, 100, 105, 115, 125, 115, 105, 100, 90, 80];

export const FITNESS_RULES = {
  // Получить текущий процент формы по индексу
  getFormPercentage: (index: number): number => {
    // Защита от выхода за пределы массива
    const safeIndex = Math.abs(index) % FORM_CURVE.length;
    return FORM_CURVE[safeIndex];
  },

  // Рассчитать эффективную силу игрока для движка и сайта
  calculateEffectivePower: (basePower: number, formIndex: number) => {
    const modifier = FITNESS_RULES.getFormPercentage(formIndex) / 100;
    return Math.round(basePower * modifier);
  },

  // Логика сдвига по синусоиде (вызывается после каждого игрового дня/тура)
  getNextFormIndex: (currentIndex: number): number => {
    return (currentIndex + 1) % FORM_CURVE.length;
  }
};