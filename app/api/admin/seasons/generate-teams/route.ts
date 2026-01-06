import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { REAL_CLUBS_DB } from "@/lib/data/real-clubs";
import { Position, VflStyle } from "@prisma/client";

// --- Вспомогательные функции (НУЖНЫ ДЛЯ РАБОТЫ) ---

function generateRandomPlayer(countryId: string, pos: Position) {
  const SURNAMES = ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Thomas", "Johnson", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Wood", "Harris", "Garcia", "Martinez", "Rodriguez", "Lopez", "Hernandez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres"];
  const NAMES = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "George", "Joshua", "Kevin", "Brian", "Edward"];

  const styles = Object.values(VflStyle);
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];

  return {
    firstName: NAMES[Math.floor(Math.random() * NAMES.length)],
    lastName: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
    age: Math.floor(Math.random() * (34 - 17 + 1)) + 17,
    mainPosition: pos,
    power: Math.floor(Math.random() * (80 - 50 + 1)) + 50,
    favoriteStyle: randomStyle,
    styleKnowledge: Math.floor(Math.random() * 100),
    countryId: countryId,
    specSpeed: 0, specHeading: 0, specLongPass: 0, specShortPass: 0, specDribbling: 0, specCombination: 0, specTackling: 0, specMarking: 0, specShooting: 0, specFreeKicks: 0, specCorners: 0, specPenalty: 0, specCaptain: 0, specLeader: 0, specAthleticism: 0, specSimulation: 0, specGkReflexes: 0, specGkOut: 0
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
          // Здесь ошибки "Cannot find name" исчезнут, так как функции определены выше
          const playersData = BASE_ROSTER.map((pos: Position) => generateRandomPlayer(country.id, pos));
          await prisma.team.create({
            data: {
              name: clubDef.name,
              stadium: clubDef.stadium,
              logo: clubDef.logo,
              capacity: clubDef.capacity || 40000,
              finances: BigInt(10000000),
              countryId: country.id,
              leagueId: targetLeagueId,
              power: Math.floor(Math.random() * 30) + 50,
              players: { create: playersData }
            }
          });
          totalCreated++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Готово. Создано: ${totalCreated}, распределено: ${totalAssigned}` 
    });

  } catch (error: any) {
    console.error("GENERATE_TEAMS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}