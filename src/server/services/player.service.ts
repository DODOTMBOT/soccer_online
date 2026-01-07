import { prisma } from "@/src/server/db";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";
import { createPlayerSchema } from "@/src/server/dto/validation"; 
import { z } from "zod";

// Тип входных данных из Zod
type CreatePlayerData = z.infer<typeof createPlayerSchema>;

export class PlayerService {
  
  // 1. Создание игрока (Admin/System)
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
        
        // Новые скрытые параметры (дефолтные значения, если их нет в DTO)
        potential: 70, 
        injuryProne: 10,

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

  // 2. Массовое создание (для генератора)
  static async createBulk(playersData: CreatePlayerData[]) {
    // Подготовка данных для createMany
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
      
      // Дефолтные скрытые параметры для Bulk (можно будет уточнить в генераторе)
      potential: 70, 
      injuryProne: 10,

      // Спецухи
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

  // 3. Получение профиля игрока (Feature B)
  static async getProfile(playerId: string, viewerTeamId?: string | null, isAdmin = false) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: { select: { id: true, name: true, logo: true, league: true } },
        country: { select: { id: true, name: true, flag: true } }
      }
    });

    if (!player) return null;

    // Права доступа: Админ или Владелец игрока видят скрытые статы
    const isOwner = !!(viewerTeamId && player.teamId === viewerTeamId);
    const canSeeHidden = isAdmin || isOwner;

    return {
      ...player,
      // Преобразуем BigInt в строку для JSON
      price: player.price ? player.price.toString() : "0",
      transferPrice: player.transferPrice ? player.transferPrice.toString() : null,
      
      // Маскируем (скрываем) секретные поля для чужих глаз
      potential: canSeeHidden ? player.potential : null,
      injuryProne: canSeeHidden ? player.injuryProne : null,
      
      // Флаги для UI
      isOwner,
      displayPrice: player.price ? Number(player.price).toLocaleString('ru-RU') + " $" : "Не оценен",
      
      // Данные для рынка (Feature C)
      market: {
        isOnTransfer: player.isOnTransferList,
        isOnLoan: player.isOnLoanList
      }
    };
  }
}