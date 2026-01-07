import { prisma } from "@/src/server/db";

export class SeasonService {

  // Инициализация лиг (копирование из прошлого сезона или создание с нуля)
  static async initLeagues(seasonId: string) {
    // 1. Проверка на дубли
    const currentLeagues = await prisma.league.findMany({ where: { seasonId } });
    if (currentLeagues.length > 0) return { message: "Лиги уже существуют." };

    // 2. Поиск "шаблона" (предыдущего сезона)
    const lastLeague = await prisma.league.findFirst({
      where: { seasonId: { not: seasonId } },
      orderBy: { createdAt: 'desc' }
    });

    // ВАРИАНТ А: Первый запуск
    if (!lastLeague) {
      let country = await prisma.country.findUnique({ where: { name: "Англия" } });
      if (!country) {
        country = await prisma.country.create({
          data: { name: "Англия", confederation: "UEFA", flag: "https://flagcdn.com/w320/gb-eng.png" }
        });
      }
      await prisma.league.create({
        data: { name: "Premier League", level: 1, teamsCount: 16, countryId: country.id, seasonId }
      });
      return { message: "Базовая лига создана." };
    }

    // ВАРИАНТ Б: Ротация
    const prevLeagues = await prisma.league.findMany({
      where: { seasonId: lastLeague.seasonId },
      orderBy: { level: 'asc' },
      include: { teams: true }
    });

    // Транзакция создания новых лиг и переноса команд
    await prisma.$transaction(async (tx) => {
      const newLevelMap = new Map<number, string>();

      // Создаем новые лиги
      for (const prevL of prevLeagues) {
        const newL = await tx.league.create({
          data: {
            name: prevL.name,
            level: prevL.level,
            teamsCount: prevL.teamsCount,
            countryId: prevL.countryId,
            seasonId
          }
        });
        newLevelMap.set(newL.level, newL.id);
      }

      // Переносим команды (Ротация)
      const maxLevel = Math.max(...prevLeagues.map(l => l.level));

      for (const prevL of prevLeagues) {
        // Сортировка таблицы прошлого сезона
        const sortedTeams = [...prevL.teams].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalsDiff - a.goalsDiff;
        });

        for (let i = 0; i < sortedTeams.length; i++) {
          const team = sortedTeams[i];
          let targetLevel = prevL.level;

          // Повышение (кроме 1 уровня)
          if (prevL.level > 1 && i < 2) targetLevel--;
          // Понижение (кроме последнего)
          else if (prevL.level < maxLevel && i >= sortedTeams.length - 2) targetLevel++;

          const targetLeagueId = newLevelMap.get(targetLevel);
          if (targetLeagueId) {
            await tx.team.update({
              where: { id: team.id },
              data: {
                leagueId: targetLeagueId,
                points: 0, played: 0, wins: 0, draws: 0, losses: 0,
                goalsScored: 0, goalsConceded: 0, goalsDiff: 0
              }
            });
          }
        }
      }
    });

    return { message: "Сезон инициализирован с ротацией." };
  }
}