import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { prisma } from "@/src/server/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Узнаем команду покупателя (свежие данные из БД)
    const buyerUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });
    const buyerTeam = buyerUser?.managedTeam;

    if (!buyerTeam) return NextResponse.json({ error: "У вас нет команды" }, { status: 403 });

    const { playerId, price } = await req.json();
    const offerPrice = BigInt(price);

    // 2. Проверки
    if (offerPrice <= 0) return NextResponse.json({ error: "Цена должна быть больше нуля" }, { status: 400 });
    
    // Проверка баланса
    if (buyerTeam.finances < offerPrice) {
      return NextResponse.json({ error: "Недостаточно средств в бюджете клуба" }, { status: 400 });
    }

    // Проверка игрока
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return NextResponse.json({ error: "Игрок не найден" }, { status: 404 });
    if (player.teamId === buyerTeam.id) return NextResponse.json({ error: "Нельзя купить своего игрока" }, { status: 400 });

    // 3. Создаем оффер
    // Проверяем, нет ли уже активного оффера от этого клуба
    const existingOffer = await prisma.transferOffer.findFirst({
      where: { playerId, buyerTeamId: buyerTeam.id, status: "PENDING" }
    });

    if (existingOffer) {
      return NextResponse.json({ error: "Вы уже сделали предложение по этому игроку" }, { status: 400 });
    }

    await prisma.transferOffer.create({
      data: {
        playerId,
        buyerTeamId: buyerTeam.id,
        type: "TRANSFER",
        price: offerPrice,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}