// app/api/admin/seasons/generate-calendar/route.ts
import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import { SchedulerService } from "@/src/server/services/scheduler.service";

// Алгоритм Бергера (для генерации пар)
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
        if (round % 2 === 0) roundMatches.push({ home, away });
        else roundMatches.push({ home: away, away: home });
      }
    }
    schedule.push(roundMatches);
    currentTeams.splice(1, 0, currentTeams.pop()!);
  }
  return schedule;
}

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();
    if (!seasonId) return NextResponse.json({ error: "ID сезона обязателен" }, { status: 400 });

    console.log("=== START CALENDAR GENERATION ===");

    // 1. Инициализируем таймлайн
    try {
      await SchedulerService.initSeasonTimeline(seasonId);
    } catch (e: any) {
      console.error("Timeline Init Error:", e);
      return NextResponse.json({ error: `Ошибка инициализации дней: ${e.message}` }, { status: 500 });
    }

    const leagues = await prisma.league.findMany({
      where: { seasonId },
      include: { teams: { select: { id: true } } }
    });

    if (leagues.length === 0) {
      return NextResponse.json({ error: "Нет лиг в сезоне" }, { status: 400 });
    }

    const matchesToCreate: any[] = [];
    
    // 2. Создаем структуру матчей в памяти
    for (const league of leagues) {
      const teams = league.teams.map(t => t.id);
      
      // Генерация возможна только для четного кол-ва (обычно 16)
      if (teams.length < 2) continue; 

      const shuffledTeams = teams.sort(() => 0.5 - Math.random());
      const firstLeg = generateSchedule(shuffledTeams);

      // Круг 1
      firstLeg.forEach((roundMatches, roundIndex) => {
        const tour = roundIndex + 1;
        roundMatches.forEach(match => {
          matchesToCreate.push({
            seasonId, leagueId: league.id,
            homeTeamId: match.home, awayTeamId: match.away,
            tour: tour, status: "UPCOMING"
          });
        });
      });

      // Круг 2
      firstLeg.forEach((roundMatches, roundIndex) => {
        const tour = roundIndex + 1 + firstLeg.length; // +15 туров
        roundMatches.forEach(match => {
          matchesToCreate.push({
            seasonId, leagueId: league.id,
            homeTeamId: match.away, awayTeamId: match.home,
            tour: tour, status: "UPCOMING"
          });
        });
      });
    }

    if (matchesToCreate.length === 0) {
      return NextResponse.json({ error: "Матчи не созданы (проверьте количество команд в лигах)" }, { status: 400 });
    }

    console.log(`Deleting old matches for season ${seasonId}...`);
    // Очистка старых матчей
    await prisma.match.deleteMany({ where: { seasonId } });

    console.log(`Creating ${matchesToCreate.length} matches...`);
    // Создание новых матчей
    await prisma.match.createMany({ data: matchesToCreate });

    // 3. Распределяем матчи по дням
    console.log("Scheduling matches to timeline...");
    let scheduledCount = 0;
    for (const league of leagues) {
      if (league.teams.length >= 2) {
        const res = await SchedulerService.scheduleLeagueMatches(league.id, seasonId);
        scheduledCount += res.toursCount;
      }
    }

    console.log("=== CALENDAR GENERATED SUCCESSFULLY ===");
    return NextResponse.json({ 
      success: true, 
      message: `Создано ${matchesToCreate.length} матчей, распределено ${scheduledCount} туров.` 
    });

  } catch (error: any) {
    console.error("CALENDAR_GEN_ERROR:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}