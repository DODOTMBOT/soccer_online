import { prisma } from "@/src/server/db";
import { generateBergerSchedule } from "@/src/server/domain/generators/calendar";

export class LeagueService {
  
  // Генерация календаря для одной лиги
  static async generateCalendar(leagueId: string, seasonId: string, roundsCount = 2) {
    // 1. Получаем команды
    const teams = await prisma.team.findMany({ 
      where: { leagueId },
      select: { id: true } 
    });

    if (teams.length < 2) {
      throw new Error("В лиге должно быть минимум 2 команды");
    }

    // 2. Очистка старого календаря и создание нового (Транзакция)
    return await prisma.$transaction(async (tx) => {
      await tx.match.deleteMany({ 
        where: { leagueId, seasonId } 
      });

      const teamIds = teams.map(t => t.id).sort(() => 0.5 - Math.random());
      
      // 3. Генерация сетки (1 круг)
      const scheduleBase = generateBergerSchedule(teamIds);
      const totalToursInCircle = scheduleBase.length;
      
      const matchesToCreate: { 
        seasonId: string; 
        leagueId: string; 
        homeTeamId: string; 
        awayTeamId: string; 
        tour: number; 
        status: "UPCOMING" 
      }[] = [];

      // 4. Дублирование кругов
      for (let circle = 0; circle < roundsCount; circle++) {
        scheduleBase.forEach((roundMatches, roundIndex) => {
          const tour = (circle * totalToursInCircle) + roundIndex + 1;
          
          roundMatches.forEach(m => {
            const isReversed = circle % 2 !== 0;
            matchesToCreate.push({
              seasonId,
              leagueId,
              homeTeamId: isReversed ? m.away : m.home,
              awayTeamId: isReversed ? m.home : m.away,
              tour,
              status: "UPCOMING"
            });
          });
        });
      }

      // 5. Сохранение
      const result = await tx.match.createMany({ data: matchesToCreate });
      return result.count;
    });
  }
}