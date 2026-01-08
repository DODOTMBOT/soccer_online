import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
// Убедись, что этот файл (import-helpers) тоже создан (см. шаг 2)
import { generateHiddenStats, mapPosition } from "@/src/server/utils/import-helpers"; 

// Увеличиваем лимит времени выполнения для Vercel/Node (если поддерживается)
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Поддержка и { data: [...] } и просто [...]
    const data = body.data || body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Неверный формат JSON (ожидается массив команд)" }, { status: 400 });
    }

    const logs: string[] = [];
    let createdTeams = 0;
    let createdPlayers = 0;

    for (const teamData of data) {
      // 1. Страна
      let country = await prisma.country.findFirst({ where: { name: teamData.country } });
      if (!country) {
        country = await prisma.country.create({
            data: { 
              name: teamData.country, 
              confederation: "UEFA", 
              flag: null 
            }
        });
        logs.push(`Создана страна: ${teamData.country}`);
      }

      // 2. Лига
      const league = await prisma.league.findFirst({ 
        where: { name: teamData.league, countryId: country.id } 
      });

      // 3. Команда (Upsert)
      const teamPayload = {
        name: teamData.name,
        logo: teamData.logo || null,
        stadium: teamData.stadium || "Generic Stadium",
        finances: BigInt(teamData.finances || 10000000),
        countryId: country.id,
        leagueId: league?.id || null,
        baseLevel: 1,
      };

      // Ищем по externalId (если есть) или по имени
      const teamWhere = teamData.externalId 
        ? { externalId: teamData.externalId } 
        : { name: teamData.name };

      const team = await prisma.team.upsert({
        where: teamWhere as any, 
        update: teamPayload,
        create: {
          ...teamPayload,
          externalId: teamData.externalId,
        }
      });
      createdTeams++;

      // 4. Игроки
      if (teamData.players && Array.isArray(teamData.players)) {
        for (const p of teamData.players) {
          const seedKey = p.externalId || `${p.firstName}_${p.lastName}_${p.age}`;
          const hidden = generateHiddenStats(seedKey, p.power);
          const mainPos = mapPosition(p.position);
          const sidePos = p.sidePosition ? mapPosition(p.sidePosition) : null;

          const playerPayload = {
            firstName: p.firstName,
            lastName: p.lastName,
            age: p.age,
            mainPosition: mainPos, 
            sidePosition: sidePos,
            power: p.power,
            price: BigInt(p.price || 0),
            teamId: team.id,
            countryId: country.id,
            potential: hidden.potential,
            injuryProne: hidden.injuryProne,
            formIndex: hidden.formIndex,
            // Спецухи
            specSpeed: p.specs?.specSpd || 0,
            specHeading: p.specs?.specHeading || 0,
            specLongPass: p.specs?.specLong || 0,
            specShortPass: p.specs?.specShortPass || 0,
            specDribbling: p.specs?.specKt || 0,
            specCombination: p.specs?.specKr || 0,
            specTackling: p.specs?.specTackling || 0,
            specMarking: p.specs?.specMarking || 0,
            specShooting: p.specs?.specZv || 0,
            specFreeKicks: p.specs?.specSt || 0,
            specCorners: p.specs?.specCorners || 0,
            specPenalty: p.specs?.specPenalty || 0,
            specCaptain: p.specs?.specL || 0,
            specLeader: p.specs?.specKi || 0,
            specAthleticism: p.specs?.specPhys || 0,
            specSimulation: p.specs?.specSimulation || 0,
            specGkReflexes: p.specs?.specGkRea || 0,
            specGkOut: p.specs?.specGkPos || 0,
          };

          if (p.externalId) {
            await prisma.player.upsert({
              where: { externalId: p.externalId },
              update: playerPayload,
              create: { ...playerPayload, externalId: p.externalId }
            });
          } else {
            // Без externalId просто создаем (осторожно с дублями)
            await prisma.player.create({
               data: { ...playerPayload, externalId: null }
            });
          }
          createdPlayers++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      stats: { teams: createdTeams, players: createdPlayers },
      logs 
    });

  } catch (error: any) {
    console.error("IMPORT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}