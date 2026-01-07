import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { prisma } from "@/src/server/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { offerId } = await req.json();

    // ЗАПУСКАЕМ ТРАНЗАКЦИЮ
    await prisma.$transaction(async (tx) => {
      // 1. Получаем оффер
      const offer = await tx.transferOffer.findUnique({
        where: { id: offerId },
        include: { player: true }
      });

      if (!offer || offer.status !== "PENDING") {
        throw new Error("Оффер не актуален");
      }

      // 2. Проверяем права (текущий юзер должен быть менеджером ПРОДАВЦА)
      const sellerTeam = await tx.team.findUnique({
        where: { id: offer.player.teamId },
        include: { manager: true }
      });

      if (sellerTeam?.managerId !== session.user.id) {
        throw new Error("Вы не владелец этого игрока");
      }

      // 3. Получаем покупателя
      const buyerTeam = await tx.team.findUnique({ where: { id: offer.buyerTeamId } });
      if (!buyerTeam) throw new Error("Команда покупателя не найдена");

      // 4. Проверяем деньги (еще раз, на всякий случай)
      if (buyerTeam.finances < offer.price) {
        throw new Error("У покупателя больше нет денег");
      }

      // === ИСПОЛНЕНИЕ СДЕЛКИ ===

      // А. Деньги
      await tx.team.update({
        where: { id: buyerTeam.id },
        data: { finances: { decrement: offer.price } }
      });
      
      await tx.team.update({
        where: { id: sellerTeam.id },
        data: { finances: { increment: offer.price } }
      });

      // Б. Игрок
      await tx.player.update({
        where: { id: offer.playerId },
        data: {
          teamId: buyerTeam.id,       // Переход
          isOnTransferList: false,    // Снимаем с рынка
          transferPrice: null
        }
      });

      // В. Закрываем этот оффер
      await tx.transferOffer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" }
      });

      // Г. Отклоняем все остальные офферы по этому игроку
      await tx.transferOffer.updateMany({
        where: { playerId: offer.playerId, status: "PENDING" },
        data: { status: "REJECTED" }
      });
      
      // Д. Пишем в историю (опционально, но полезно)
      // (пока пропустим для скорости, или добавь модель History если есть)
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Deal Error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}