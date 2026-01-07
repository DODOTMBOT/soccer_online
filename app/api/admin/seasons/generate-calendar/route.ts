import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

// Алгоритм Бергера для круговой системы
function generateSchedule(teams: string[]) {
  const schedule = [];
  const numberOfTeams = teams.length;
  
  // Если команд нечетное количество, добавляем виртуального соперника
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
        // Чередуем хозяев, чтобы у команд не было длинных серий "дома" или "в гостях"
        if (round % 2 === 0) {
          roundMatches.push({ home, away });
        } else {
          roundMatches.push({ home: away, away: home });
        }
      }
    }
    schedule.push(roundMatches);
    
    // Вращение массива: фиксируем первый элемент [0], остальные сдвигаем
    currentTeams.splice(1, 0, currentTeams.pop()!);
  }
  return schedule;
}

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();

    if (!seasonId) return NextResponse.json({ error: "ID сезона обязателен" }, { status: 400 });

    // 1. Получаем все лиги, привязанные к этому сезону
    const leagues = await prisma.league.findMany({
      where: { seasonId },
      include: { teams: { select: { id: true } } }
    });

    if (leagues.length === 0) {
      return NextResponse.json({ error: "В сезоне нет лиг. Сначала выполните 'Шаг 1: Создать Дивизионы'." }, { status: 400 });
    }

    // ИСПРАВЛЕНИЕ: Явно указываем тип any[]
    const matchesToCreate: any[] = [];
    let leaguesProcessed = 0;

    for (const league of leagues) {
      const teams = league.teams.map(t => t.id);

      // Строгая проверка регламента (16 команд)
      if (teams.length !== 16) {
        console.warn(`⚠️ Лига ${league.name} (ID: ${league.id}) пропущена: ${teams.length} команд вместо 16.`);
        continue;
      }

      // Перемешиваем команды перед жеребьевкой, чтобы календарь не был одинаковым каждый сезон
      const shuffledTeams = teams.sort(() => 0.5 - Math.random());

      // Генерируем сетку 1-го круга (15 туров)
      const firstLeg = generateSchedule(shuffledTeams);

      // --- КРУГ 1 ---
      firstLeg.forEach((roundMatches, roundIndex) => {
        const tour = roundIndex + 1;
        roundMatches.forEach(match => {
          matchesToCreate.push({
            seasonId,
            leagueId: league.id,
            homeTeamId: match.home,
            awayTeamId: match.away,
            tour: tour,
            status: "UPCOMING"
          });
        });
      });

      // --- КРУГ 2 (Ответные матчи) ---
      firstLeg.forEach((roundMatches, roundIndex) => {
        const tour = roundIndex + 1 + 15; // Туры с 16 по 30
        roundMatches.forEach(match => {
          matchesToCreate.push({
            seasonId,
            leagueId: league.id,
            homeTeamId: match.away, // Меняем стороны: Гости становятся Хозяевами
            awayTeamId: match.home,
            tour: tour,
            status: "UPCOMING"
          });
        });
      });

      leaguesProcessed++;
    }

    if (matchesToCreate.length === 0) {
      return NextResponse.json({ error: "Не удалось создать матчи. Убедитесь, что в лигах ровно по 16 команд." }, { status: 400 });
    }

    // Очищаем старые матчи этого сезона (если перегенерируем)
    await prisma.match.deleteMany({ where: { seasonId } });

    // Массовое сохранение (оптимизировано)
    await prisma.match.createMany({ data: matchesToCreate });

    return NextResponse.json({ 
      success: true, 
      message: `Календарь успешно создан!\nЛиг: ${leaguesProcessed}\nМатчей: ${matchesToCreate.length}` 
    });

  } catch (error: any) {
    console.error("CALENDAR_GEN_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}