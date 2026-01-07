import { prisma } from "@/src/server/db";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";
import { createPlayerSchema } from "@/src/server/dto/validation"; // Импорт схемы
import { z } from "zod";

// Выводим TS тип из Zod схемы
type CreatePlayerData = z.infer<typeof createPlayerSchema>;

export class PlayerService {
  
  // Строгая типизация входных данных
  static async create(data: CreatePlayerData) {
    const price = getPriceFromPlayerObject(data);
    
    return prisma.player.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        power: data.power,
        mainPosition: data.mainPosition,
        sidePosition: data.sidePosition || null,
        teamId: data.teamId,
        countryId: data.countryId,
        formIndex: data.formIndex,
        price: BigInt(price),
        
        // Спецухи
        specSpeed: data.specSpd,
        specHeading: data.specHeading,
        specLongPass: data.specLong,
        specShortPass: data.specShortPass,
        specDribbling: data.specKt,
        specCombination: data.specCombination,
        specTackling: data.specTackling,
        specMarking: data.specMarking,
        specShooting: data.specZv,
        specFreeKicks: data.specSt,
        specCorners: data.specCorners,
        specPenalty: data.specPenalty,
        specCaptain: data.specL,
        specLeader: data.specKi,
        specAthleticism: data.specPhys,
        specSimulation: data.specSimulation,
        specGkReflexes: data.specGkRea,
        specGkOut: data.specGkPos,
      }
    });
  }

  static async createBulk(playersData: CreatePlayerData[]) {
    const dataToInsert = playersData.map(p => ({
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      mainPosition: p.mainPosition,
      sidePosition: p.sidePosition || null,
      teamId: p.teamId,
      countryId: p.countryId,
      power: p.power,
      price: BigInt(getPriceFromPlayerObject(p)),
      
      formIndex: p.formIndex || 0,
      fatigue: 0,
      fitness: 100,
      currentForm: 100,

      // Спецухи (с фоллбеком на 0, если вдруг undefined, хотя Zod это ловит)
      specSpeed: p.specSpd || 0,
      specHeading: p.specHeading || 0,
      specLongPass: p.specLong || 0,
      specShortPass: p.specShortPass || 0,
      specDribbling: p.specKt || 0,
      specCombination: p.specCombination || 0,
      specTackling: p.specTackling || 0,
      specMarking: p.specMarking || 0,
      specShooting: p.specZv || 0,
      specFreeKicks: p.specSt || 0,
      specCorners: p.specCorners || 0,
      specPenalty: p.specPenalty || 0,
      specCaptain: p.specL || 0,
      specLeader: p.specKi || 0,
      specAthleticism: p.specPhys || 0,
      specSimulation: p.specSimulation || 0,
      specGkReflexes: p.specGkRea || 0,
      specGkOut: p.specGkPos || 0,
    }));

    return prisma.player.createMany({
      data: dataToInsert,
      skipDuplicates: true
    });
  }
}