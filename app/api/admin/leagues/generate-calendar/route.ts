import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Тот же алгоритм Бергера, что и в генераторе сезона
function generateSchedule(teams: string[]) {
  const schedule = [];
  const numberOfTeams = teams.length;
  
  if (numberOfTeams % 2 !== 0) teams.push("BYE");

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  
  const currentTeams = [...teams];

  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const home = currentTeams[i];
      const away = currentTeams[n - 1 - i];
      
      if (home !== "BYE" && away !== "BYE") {
        if (round % 2 === 0) {
          roundMatches.push({ home, away });
        } else {
          roundMatches.push({ home: away, away: home });
        }
      }
    }
    schedule.push(roundMatches);
    currentTeams.splice(1, 0, currentTeams.pop()!);
  }
  return schedule;
}

export async function POST(req: Request) {
  try {
    const { leagueId, roundsCount = 2, seasonId } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "Выберите сезон" }, { status: 400 });

    const teams = await prisma.team.findMany({ 
      where: { leagueId },
      select: { id: true } 
    });

    if (teams.length < 2) {
      return NextResponse.json({ error: "В лиге должно быть минимум 2 команды" }, { status: 400 });
    }

    // Удаляем старый календарь ЭТОЙ лиги в ЭТОМ сезоне
    await prisma.match.deleteMany({ 
      where: { leagueId, seasonId } 
    });

    const teamIds = teams.map(t => t.id).sort(() => 0.5 - Math.random());
    // ИСПРАВЛЕНИЕ: Явно указываем тип any[]
    const matchesToCreate: any[] = [];
    
    // Генерируем расписание (1 круг)
    const scheduleBase = generateSchedule(teamIds);
    const totalToursInCircle = scheduleBase.length;

    // Дублируем круги (roundsCount раз)
    for (let circle = 0; circle < roundsCount; circle++) {
      scheduleBase.forEach((roundMatches, roundIndex) => {
        // Сквозной номер тура (1..15, 16..30)
        const tour = (circle * totalToursInCircle) + roundIndex + 1;
        
        roundMatches.forEach(m => {
          // Чередуем хозяев в каждом новом круге
          const isReversed = circle % 2 !== 0;
          
          matchesToCreate.push({
            seasonId,
            leagueId,
            homeTeamId: isReversed ? m.away : m.home,
            awayTeamId: isReversed ? m.home : m.away,
            tour: tour,
            status: "UPCOMING"
          });
        });
      });
    }

    // Сохраняем
    await prisma.match.createMany({ data: matchesToCreate });

    return NextResponse.json({ 
      success: true, 
      message: `Создано ${matchesToCreate.length} матчей (${roundsCount * totalToursInCircle} туров)` 
    });

  } catch (error: any) {
    console.error("LEAGUE_CALENDAR_ERROR:", error);
    return NextResponse.json({ error: "Ошибка генерации календаря" }, { status: 500 });
  }
}