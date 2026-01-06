import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Функция алгоритма Бергера
function generateSchedule(teams: string[]) {
  const schedule = [];
  const numberOfTeams = teams.length;
  if (numberOfTeams % 2 !== 0) teams.push("BYE");

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  let currentTeams = [...teams];

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

    // --- БЛОК 1: ИЩЕМ ЛИГИ ТЕКУЩЕГО СЕЗОНА ---
    let leagues = await prisma.league.findMany({
      where: { seasonId },
      include: { teams: { select: { id: true } } }
    });

    if (leagues.length === 0) return NextResponse.json({ error: "В сезоне нет лиг" }, { status: 400 });

    const logs: string[] = [];
    const allMatchesToCreate: any[] = [];

    // --- БЛОК 2: ПРОХОДИМ ПО ЛИГАМ ---
    for (const league of leagues) {
      let teamIds = league.teams.map(t => t.id);

      // === ВСТАВКА: АВТО-ПЕРЕНОС КОМАНД ===
      // Если в лиге пусто, пробуем украсть команды из старой лиги (ID со скрина)
      if (teamIds.length === 0) {
        const OLD_LEAGUE_ID = "cmk2mlmk5006j59njn0lmmnui"; // Твой ID со скрина
        
        logs.push(`⚠️ В лиге "${league.name}" пусто. Ищу команды в старой лиге (${OLD_LEAGUE_ID})...`);

        // Переносим команды
        const transfer = await prisma.team.updateMany({
          where: { leagueId: OLD_LEAGUE_ID },
          data: { leagueId: league.id } // Привязываем к новой лиге
        });

        if (transfer.count > 0) {
          logs.push(`✅ Перенесено ${transfer.count} команд! Теперь они в текущем сезоне.`);
          
          // Обновляем список ID для генерации
          const updatedTeams = await prisma.team.findMany({
            where: { leagueId: league.id },
            select: { id: true }
          });
          teamIds = updatedTeams.map(t => t.id);
        } else {
          logs.push(`❌ Не нашел команд даже в старой лиге.`);
        }
      }
      // =====================================

      // Проверка на количество (строго 16)
      if (teamIds.length !== 16) {
        logs.push(`⛔️ Лига "${league.id}" пропущена: сейчас в ней ${teamIds.length} команд (надо 16).`);
        continue;
      }

      // Генерация календаря
      const shuffled = teamIds.sort(() => Math.random() - 0.5);
      const firstLeg = generateSchedule(shuffled);

      // 1 круг
      firstLeg.forEach((roundMatches, idx) => {
        const tour = idx + 1;
        roundMatches.forEach(m => {
          allMatchesToCreate.push({
            seasonId, leagueId: league.id, status: "UPCOMING",
            homeTeamId: m.home, awayTeamId: m.away, tour, round: tour
          });
        });
      });

      // 2 круг
      firstLeg.forEach((roundMatches, idx) => {
        const tour = idx + 1 + firstLeg.length;
        roundMatches.forEach(m => {
          allMatchesToCreate.push({
            seasonId, leagueId: league.id, status: "UPCOMING",
            homeTeamId: m.away, awayTeamId: m.home, tour, round: tour
          });
        });
      });

      logs.push(`✅ Лига "${league.name || league.id}": Календарь создан (240 матчей).`);
    }

    // Сохранение
    if (allMatchesToCreate.length > 0) {
      await prisma.match.createMany({ data: allMatchesToCreate });
      return NextResponse.json({ success: true, message: logs.join("\n") });
    } else {
      return NextResponse.json({ error: "Ничего не создано.\n" + logs.join("\n") }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}