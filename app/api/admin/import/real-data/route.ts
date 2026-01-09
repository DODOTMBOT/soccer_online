import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import { generateHiddenStats, mapPosition } from "@/src/server/utils/import-helpers";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.data || body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Неверный формат JSON" }, { status: 400 });
    }

    const logs: string[] = [];
    let createdTeams = 0;
    let createdPlayers = 0;

    for (const teamData of data) {
      // 1. Ищем или создаем страну КЛУБА
      let country = await prisma.country.findFirst({ where: { name: teamData.country } });
      if (!country) {
        country = await prisma.country.create({
            data: { name: teamData.country, confederation: "UEFA", flag: null }
        });
        logs.push(`Создана страна клуба: ${teamData.country}`);
      }

      // 2. Ищем лигу
      const league = await prisma.league.findFirst({ 
        where: { name: teamData.league, countryId: country.id } 
      });

      // 3. Создаем/обновляем команду
      // Внимание: поля 'city' нет в базе, поэтому мы его игнорируем или пишем в стадион
      const teamPayload = {
        name: teamData.name,
        logo: teamData.logo || null,
        stadium: teamData.stadium || "Generic Stadium",
        finances: BigInt(teamData.finances || 10000000),
        countryId: country.id,
        leagueId: league?.id || null,
        baseLevel: 1,
      };

      const team = await prisma.team.upsert({
        where: teamData.externalId ? { externalId: teamData.externalId } : { name: teamData.name },
        update: teamPayload,
        create: { ...teamPayload, externalId: teamData.externalId }
      });
      createdTeams++;

      // 4. Обработка игроков
      if (teamData.players && Array.isArray(teamData.players)) {
        for (const p of teamData.players) {
          // --- ЛОГИКА НАЦИОНАЛЬНОСТИ ИГРОКА ---
          let playerCountryId = country.id; // По умолчанию - страна клуба

          if (p.nationality) {
            // Пытаемся найти страну игрока
            let natCountry = await prisma.country.findFirst({ where: { name: p.nationality } });
            
            // Если такой страны нет - создаем её (опционально, чтобы не терять данные)
            if (!natCountry) {
               natCountry = await prisma.country.create({
                 data: { name: p.nationality, confederation: "FIFA", flag: null }
               });
               logs.push(`Авто-создана страна игрока: ${p.nationality}`);
            }
            playerCountryId = natCountry.id;
          }
          // -------------------------------------

          const seedKey = p.externalId || `${p.firstName}_${p.lastName}_${p.age}`;
          const hidden = generateHiddenStats(seedKey, p.power);
          const mainPos = mapPosition(p.position);
          const sidePos = p.sidePosition ? mapPosition(p.sidePosition) : null;

          // Расчет цены
          let finalPrice = 0;
          if (p.price) {
             finalPrice = p.price;
          } else {
             finalPrice = getPriceFromPlayerObject({
                power: p.power,
                age: p.age,
                sidePosition: sidePos,
                playStyles: [] 
             });
          }

          const playerPayload = {
            firstName: p.firstName,
            lastName: p.lastName,
            age: p.age,
            mainPosition: mainPos, 
            sidePosition: sidePos,
            power: p.power,
            price: BigInt(finalPrice),
            teamId: team.id,
            countryId: playerCountryId, // Используем найденную ID страны игрока
            potential: hidden.potential,
            injuryProne: hidden.injuryProne,
            formIndex: hidden.formIndex,
          };

          if (p.externalId) {
            await prisma.player.upsert({
              where: { externalId: p.externalId },
              update: playerPayload,
              create: { ...playerPayload, externalId: p.externalId }
            });
          } else {
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