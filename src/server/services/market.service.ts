import { prisma } from "@/src/server/db";

export class MarketService {
  
  // Выставить или снять с трансфера
  static async setTransferStatus(playerId: string, teamId: string, isOnTransfer: boolean, price?: number) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error("Игрок не найден");
    if (player.teamId !== teamId) throw new Error("Это не ваш игрок");

    return prisma.player.update({
      where: { id: playerId },
      data: {
        isOnTransferList: isOnTransfer,
        transferPrice: price ? BigInt(price) : null
      }
    });
  }

  // Получить всех игроков на рынке
  static async getTransferList() {
    const players = await prisma.player.findMany({
      where: { isOnTransferList: true },
      include: {
        team: { select: { id: true, name: true, logo: true } },
        country: { select: { id: true, name: true, flag: true } }
      },
      orderBy: { power: 'desc' }
    });

    return players.map(p => ({
      ...p,
      price: p.price ? p.price.toString() : "0",
      transferPrice: p.transferPrice ? p.transferPrice.toString() : null
    }));
  }

  // Входящие предложения (нам предлагают деньги)
  static async getIncomingOffers(teamId: string) {
    console.log(`[MarketService] Fetching INCOMING offers for team: ${teamId}`);
    
    const offers = await prisma.transferOffer.findMany({
      where: {
        player: { teamId }, // Игрок принадлежит нам
        status: "PENDING"
      },
      include: {
        player: true,
        buyerTeam: { select: { id: true, name: true, logo: true } }
      },
      orderBy: { price: 'desc' }
    });
    
    console.log(`[MarketService] Found ${offers.length} incoming offers.`);

    // Сериализация BigInt
    return offers.map(o => ({
      ...o,
      price: o.price.toString(),
      player: {
        ...o.player,
        price: o.player.price ? o.player.price.toString() : "0"
      }
    }));
  }

  // Исходящие предложения (мы предлагаем деньги)
  static async getOutgoingOffers(teamId: string) {
    console.log(`[MarketService] Fetching OUTGOING offers for team: ${teamId}`);

    const offers = await prisma.transferOffer.findMany({
      where: {
        buyerTeamId: teamId, // Мы покупатели
        status: "PENDING"
      },
      include: {
        player: { include: { team: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[MarketService] Found ${offers.length} outgoing offers.`);

    return offers.map(o => ({
      ...o,
      price: o.price.toString(),
      player: {
        ...o.player,
        price: o.player.price ? o.player.price.toString() : "0"
      }
    }));
  }
}