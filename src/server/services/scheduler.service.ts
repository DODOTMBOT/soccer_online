// src/server/services/scheduler.service.ts
import { prisma } from "@/src/server/db";

export class SchedulerService {
  
  // 1. Инициализация временной шкалы сезона (быстрая версия)
  static async initSeasonTimeline(seasonId: string, daysCount = 100) {
    // Проверка, есть ли уже дни
    const existing = await prisma.gameDay.count({ where: { seasonId } });
    if (existing > 0) {
      console.log("Таймлайн уже существует, пропускаем создание.");
      return; 
    }

    console.log(`Создание таймлайна для сезона ${seasonId} (${daysCount} дней)...`);

    // 1. Создаем дни массово (одним запросом)
    const daysData = Array.from({ length: daysCount }, (_, i) => ({
      seasonId,
      number: i + 1,
      label: `Игровой день ${i + 1}`,
      isCurrent: i === 0, // Первый день активный
      isFinished: false
    }));

    await prisma.gameDay.createMany({
      data: daysData
    });

    // 2. Получаем ID созданных дней, чтобы привязать слоты
    const createdDays = await prisma.gameDay.findMany({
      where: { seasonId },
      select: { id: true, number: true },
      orderBy: { number: 'asc' }
    });

    // 3. Подготавливаем слоты
    const slotsData = createdDays.flatMap(day => [
      { gameDayId: day.id, order: 1, label: "15:00 (Дневная сессия)" },
      { gameDayId: day.id, order: 2, label: "20:00 (Вечерняя сессия)" }
    ]);

    // 4. Создаем слоты массово
    await prisma.gameTimeSlot.createMany({
      data: slotsData
    });

    console.log(`Таймлайн создан: ${createdDays.length} дней, ${slotsData.length} слотов.`);
  }

  // 2. Распределение матчей лиги по дням
  static async scheduleLeagueMatches(leagueId: string, seasonId: string) {
    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) throw new Error("Лига не найдена");

    // Загружаем дни с их слотами
    const gameDays = await prisma.gameDay.findMany({
      where: { seasonId },
      include: { timeSlots: true },
      orderBy: { number: 'asc' }
    });

    if (gameDays.length === 0) {
      throw new Error(`CRITICAL: В базе нет игровых дней для сезона ${seasonId}. Инициализация не сработала.`);
    }

    // Загружаем матчи
    const matches = await prisma.match.findMany({
      where: { leagueId },
      orderBy: { tour: 'asc' }
    });

    // Настройки расписания
    const MATCH_INTERVAL = 3; // Тур каждые 3 дня
    const START_OFFSET = 1;   // Начинаем со 2-го дня (индекс 1)
    const PREFERRED_SLOT_ORDER = league.level === 1 ? 2 : 1; // Элита вечером

    const updates = [];

    // Группируем матчи по турам
    const matchesByTour: Record<number, string[]> = {};
    matches.forEach(m => {
      if (!matchesByTour[m.tour]) matchesByTour[m.tour] = [];
      matchesByTour[m.tour].push(m.id);
    });

    // Раскидываем по слотам
    for (const [tourStr, matchIds] of Object.entries(matchesByTour)) {
      const tour = parseInt(tourStr);
      
      // Формула: День = Смещение + (Тур-1) * Интервал
      const dayIndex = START_OFFSET + (tour - 1) * MATCH_INTERVAL;
      
      // Ищем этот день в массиве
      if (dayIndex < gameDays.length) {
        const targetDay = gameDays[dayIndex];
        
        const targetSlot = targetDay.timeSlots.find(s => s.order === PREFERRED_SLOT_ORDER) 
                           || targetDay.timeSlots[0];

        if (targetSlot) {
          updates.push(
            prisma.match.updateMany({
              where: { id: { in: matchIds } },
              data: { gameTimeSlotId: targetSlot.id }
            })
          );
        }
      }
    }

    // Выполняем обновления параллельно
    await prisma.$transaction(updates);
    return { toursCount: Object.keys(matchesByTour).length };
  }
}