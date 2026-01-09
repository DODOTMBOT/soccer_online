import { prisma } from "@/src/server/db";
import { getPriceFromPlayerObject } from "@/src/shared/utils/economy";
import { createPlayerSchema } from "@/src/server/dto/validation"; 
import { z } from "zod";
import { PlayStyleLevel } from "@prisma/client"; // Импортируем Enum

// Тип входных данных из Zod
type CreatePlayerData = z.infer<typeof createPlayerSchema>;

export class PlayerService {
  
  // 1. Создание игрока (Admin/System)
  static async create(data: CreatePlayerData) {
    const price = getPriceFromPlayerObject(data);
    
    // Сначала создаем игрока
    const player = await prisma.player.create({
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
        
        // Скрытые параметры
        potential: 70, 
        injuryProne: 10,
      }
    });

    // Привязываем плейстайлы (если есть)
    if (data.playStyles && data.playStyles.length > 0) {
      const definitions = await prisma.playStyleDefinition.findMany({
        where: { code: { in: data.playStyles } }
      });

      if (definitions.length > 0) {
        await prisma.playerPlayStyle.createMany({
          data: definitions.map((def) => ({
            playerId: player.id,
            definitionId: def.id,
            level: PlayStyleLevel.BRONZE // Используем Enum
          }))
        });
      }
    }

    return player;
  }

  // 2. Массовое создание (через цикл для сохранения связей)
  static async createBulk(playersData: CreatePlayerData[]) {
    const createdPlayers = [];
    // Используем цикл, так как createMany не поддерживает вложенные связи (playStyles)
    for (const p of playersData) {
       createdPlayers.push(await PlayerService.create(p));
    }
    return createdPlayers;
  }

  // 3. Получение профиля игрока
  static async getProfile(playerId: string, viewerTeamId?: string | null, isAdmin = false) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: { select: { id: true, name: true, logo: true, league: true } },
        country: { select: { id: true, name: true, flag: true } },
        playStyles: {
          include: {
            definition: true
          }
        }
      }
    });

    if (!player) return null;

    const isOwner = !!(viewerTeamId && player.teamId === viewerTeamId);
    const canSeeHidden = isAdmin || isOwner;

    return {
      ...player,
      price: player.price ? player.price.toString() : "0",
      transferPrice: player.transferPrice ? player.transferPrice.toString() : null,
      
      potential: canSeeHidden ? player.potential : null,
      injuryProne: canSeeHidden ? player.injuryProne : null,
      
      isOwner,
      displayPrice: player.price ? Number(player.price).toLocaleString('ru-RU') + " $" : "Не оценен",
      
      market: {
        isOnTransfer: player.isOnTransferList,
        isOnLoan: player.isOnLoanList
      }
    };
  }
}