import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import { REAL_CLUBS_DB } from "@/src/server/data/real-clubs";
import { REAL_PLAYERS_DB } from "@/src/server/data/real-players"; // База реальных игроков
import { FORM_CURVE } from "@/src/server/domain/rules/fitness"; // Синусоида формы
import { Position, VflStyle } from "@prisma/client";

// --- Функция генерации ботов (если клуба нет в REAL_PLAYERS_DB) ---

function generateRandomBot(countryId: string, pos: Position) {
  const SURNAMES = ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Thomas", "Johnson", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Wood", "Harris"];
  const NAMES = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Paul", "Steven", "Kenneth", "George", "Joshua"];

  const styles = Object.values(VflStyle);
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];

  return {
    firstName: NAMES[Math.floor(Math.random() * NAMES.length)],
    lastName: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
    age: Math.floor(Math.random() * (34 - 17 + 1)) + 17,
    mainPosition: pos,
    power: Math.floor(Math.random() * (75 - 55 + 1)) + 55,
    favoriteStyle: randomStyle,
    styleKnowledge: Math.floor(Math.random() * 100),
    countryId: countryId,
    // Пришиваем форму
    formIndex: Math.floor(Math.random() * FORM_CURVE.length),
    fitness: 100,
    fatigue: 0,
    currentForm: 100,
  };
}

const BASE_ROSTER = [
  Position.GK, Position.GK,
  Position.LD, Position.RD, Position.CD, Position.CD, Position.CD, Position.CD,
  Position.LM, Position.RM, Position.CM, Position.CM, Position.CM, Position.DM,
  Position.LF, Position.RF, Position.CF, Position.ST
];

// --- Основной обработчик API ---

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();

    let activeCountries = await prisma.country.findMany({
      include: { 
        leagues: { 
          where: { seasonId },
          orderBy: { level: 'asc' } 
        } 
      }
    });

    let totalCreated = 0;
    let totalAssigned = 0;

    for (const country of activeCountries) {
      const countryClubsMap = REAL_CLUBS_DB[country.name] || {};
      const allRealClubs = Object.values(countryClubsMap).flat();

      if (allRealClubs.length === 0) continue;

      // Создаем/проверяем лиги
      const teamsPerLeague = 16;
      const neededLeaguesCount = Math.ceil(allRealClubs.length / teamsPerLeague);
      const leagueIds: string[] = [];

      for (let level = 1; level <= neededLeaguesCount; level++) {
        let league = country.leagues.find(l => l.level === level);
        if (!league) {
          const leagueName = level === 1 ? "Premier League" : (level === 2 ? "Championship" : `Division ${level}`);
          league = await prisma.league.create({
            data: { name: leagueName, level: level, teamsCount: 16, countryId: country.id, seasonId: seasonId }
          });
        }
        leagueIds.push(league.id);
      }

      // Собираем уже распределенные команды
      const assignedTeams = await prisma.team.findMany({
        where: { leagueId: { in: leagueIds } },
        select: { name: true }
      });
      const assignedNames = new Set(assignedTeams.map(t => t.name));

      for (const clubDef of allRealClubs) {
        if (assignedNames.has(clubDef.name)) continue;

        let targetLeagueId = null;
        for (const lid of leagueIds) {
          const count = await prisma.team.count({ where: { leagueId: lid } });
          if (count < 16) {
            targetLeagueId = lid;
            break;
          }
        }

        if (!targetLeagueId) continue;

        const globalTeam = await prisma.team.findUnique({ where: { name: clubDef.name } });

        if (globalTeam) {
          await prisma.team.update({
            where: { id: globalTeam.id },
            data: { leagueId: targetLeagueId }
          });
          totalAssigned++;
        } else {
          // --- ЛОГИКА СОЗДАНИЯ ИГРОКОВ (РЕАЛЬНЫЕ ИЛИ БОТЫ) ---
          const realPlayersData = REAL_PLAYERS_DB[clubDef.name];
          let finalPlayersPayload = [];

          if (realPlayersData && realPlayersData.length > 0) {
            // Загружаем реальных звезд
            for (const p of realPlayersData) {
              // Ищем страну игрока для получения флага (по названию из nationality)
              const playerCountry = await prisma.country.findFirst({
                where: { name: { contains: p.nationality, mode: 'insensitive' } }
              });

              finalPlayersPayload.push({
                firstName: p.firstName,
                lastName: p.lastName,
                age: p.age,
                mainPosition: p.mainPosition,
                power: p.power,
                countryId: playerCountry?.id || country.id,
                formIndex: Math.floor(Math.random() * FORM_CURVE.length),
                fitness: 100,
                fatigue: 0,
                currentForm: 100
              });
            }
          } else {
            // Если клуба нет в базе игроков — генерируем стандартный ростер ботов
            finalPlayersPayload = BASE_ROSTER.map(pos => generateRandomBot(country.id, pos));
          }

          await prisma.team.create({
            data: {
              name: clubDef.name,
              stadium: clubDef.stadium,
              logo: clubDef.logo,
              capacity: clubDef.capacity || 40000,
              finances: BigInt(10000000),
              countryId: country.id,
              leagueId: targetLeagueId,
              power: 0, // Сила пересчитается движком
              players: { create: finalPlayersPayload }
            }
          });
          totalCreated++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Готово. Создано клубов: ${totalCreated}, распределено: ${totalAssigned}` 
    });

  } catch (error: any) {
    console.error("GENERATE_TEAMS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}