import { prisma } from "@/src/server/db";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy"; // Убедись, что economy там лежит

export class PlayerService {
  
  static async create(data: any) {
    const price = getPriceFromPlayerObject(data);
    
    // Zod данные уже проверены, но для createMany нужны чистые данные
    // Здесь упрощенно передаем data, предполагая, что маппинг идет в контроллере или data совпадает с БД
    return prisma.player.create({
      data: {
        ...data,
        price: BigInt(price),
        sidePosition: data.sidePosition || null,
        // Маппинг полей спецух из DTO (camelCase) в БД (если они отличаются)
        // В данном случае, если DTO совпадает с названиями в Prisma, можно оставить так
        // Но лучше явно перечислить, если есть расхождения (как мы делали в validation.ts)
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

  static async createBulk(playersData: any[]) {
    // Подготовка данных для insert
    const dataToInsert = playersData.map(p => ({
      firstName: p.firstName,
      lastName: p.lastName,
      age: p.age,
      mainPosition: p.mainPosition,
      sidePosition: p.sidePosition || null,
      teamId: p.teamId,
      countryId: p.countryId,
      power: p.power,
      price: BigInt(getPriceFromPlayerObject(p)), // Считаем цену
      
      formIndex: p.formIndex || 0,
      fatigue: 0,
      fitness: 100,
      currentForm: 100,

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
}