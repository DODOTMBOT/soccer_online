import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { prisma } from "@/src/server/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { offerId } = await req.json();

    const offer = await prisma.transferOffer.findUnique({
      where: { id: offerId },
      include: { player: true, buyerTeam: true }
    });

    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    // Кто может отклонить?
    // 1. Продавец (владелец игрока)
    // 2. Покупатель (автор оффера, если передумал)
    const sellerTeam = await prisma.team.findUnique({ where: { id: offer.player.teamId } });
    
    const isSeller = sellerTeam?.managerId === session.user.id;
    const isBuyer = prisma.team.findFirst({ where: { id: offer.buyerTeamId, managerId: session.user.id } }); // Проверка может быть сложнее, но для MVP:
    
    // Упрощенная проверка: отклонить может владелец игрока или создатель оффера (тут проверим через user.teamId из сессии, если он совпадает)
    // Но для надежности лучше так:
    const currentUserTeam = await prisma.team.findUnique({ where: { managerId: session.user.id } });
    
    if (currentUserTeam?.id !== sellerTeam?.id && currentUserTeam?.id !== offer.buyerTeamId) {
       return NextResponse.json({ error: "Нет прав на отклонение" }, { status: 403 });
    }

    await prisma.transferOffer.update({
      where: { id: offerId },
      data: { status: "REJECTED" }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}