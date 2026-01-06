import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leagueId } = await params;

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        country: {
          select: { name: true, flag: true, id: true }
        },
        season: true,
        // 1. Текущие команды (для активного сезона)
        teams: {
          orderBy: [
            { points: 'desc' },
            { goalsDiff: 'desc' },
            { goalsScored: 'desc' },
            { power: 'desc' }
          ]
        },
        // 2. Матчи (для истории)
        matches: {
          orderBy: { tour: 'asc' },
          include: { 
            homeTeam: { select: { id: true, name: true, logo: true } }, 
            awayTeam: { select: { id: true, name: true, logo: true } } 
          }
        }
      }
    });

    if (!league) return NextResponse.json({ error: "Лига не найдена" }, { status: 404 });

    // --- ПАРАЛЛЕЛЬНЫЕ ЗАПРОСЫ ДЛЯ НАВИГАЦИИ ---
    const [divisions, seasons] = await Promise.all([
      // A. Список дивизионов в ЭТОМ сезоне (для переключения D1 <-> D2)
      prisma.league.findMany({
        where: { 
          countryId: league.countryId, 
          seasonId: league.seasonId 
        },
        orderBy: { level: 'asc' },
        select: { id: true, name: true, level: true }
      }),

      // B. Список сезонов для ЭТОЙ лиги (для переключения S1 <-> S2)
      prisma.league.findMany({
        where: { 
          countryId: league.countryId, 
          name: league.name // Ищем по имени (например "Premier League")
        },
        orderBy: { season: { year: 'desc' } },
        select: { 
          id: true, 
          season: { select: { year: true, status: true } } 
        }
      })
    ]);

    // --- ЛОГИКА ВОССТАНОВЛЕНИЯ ТАБЛИЦЫ (как и была) ---
    let teamsData = league.teams;

    if (teamsData.length === 0 && league.matches.length > 0) {
      const statsMap = new Map<string, any>();
      const getInitStats = (teamInfo: any) => ({
        id: teamInfo.id,
        name: teamInfo.name,
        logo: teamInfo.logo,
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsScored: 0, goalsConceded: 0, goalsDiff: 0, points: 0,
        power: 0
      });

      league.matches.forEach(m => {
        if (!statsMap.has(m.homeTeamId)) statsMap.set(m.homeTeamId, getInitStats(m.homeTeam));
        if (!statsMap.has(m.awayTeamId)) statsMap.set(m.awayTeamId, getInitStats(m.awayTeam));

        if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null) {
          const home = statsMap.get(m.homeTeamId);
          const away = statsMap.get(m.awayTeamId);

          home.played++; away.played++;
          home.goalsScored += m.homeScore; home.goalsConceded += m.awayScore;
          away.goalsScored += m.awayScore; away.goalsConceded += m.homeScore;
          home.goalsDiff = home.goalsScored - home.goalsConceded;
          away.goalsDiff = away.goalsScored - away.goalsConceded;

          if (m.homeScore > m.awayScore) {
            home.wins++; home.points += 3;
            away.losses++;
          } else if (m.homeScore < m.awayScore) {
            away.wins++; away.points += 3;
            home.losses++;
          } else {
            home.draws++; home.points += 1;
            away.draws++; away.points += 1;
          }
        }
      });

      teamsData = Array.from(statsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalsDiff - a.goalsDiff;
      });
    }

    const responseData = {
      ...league,
      teams: teamsData,
      // Добавляем новые поля для фронтенда
      divisions,
      seasons
    };

    const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (k, v) => 
      typeof v === 'bigint' ? v.toString() : v
    ));

    return NextResponse.json(serialize(responseData));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}