import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { MarketService } from "@/src/server/services/market.service";
import { prisma } from "@/src/server/db"; // <--- Добавили импорт

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Проверяем авторизацию
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Вы не авторизованы" }, { status: 401 });
    }

    // 2. ИСПРАВЛЕНИЕ: Достаем свежий teamId прямо из базы
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });

    const teamId = user?.managedTeam?.id;

    if (!teamId) {
      return NextResponse.json({ error: "У вас нет команды" }, { status: 403 });
    }

    const { id } = await params;
    const { isOnTransfer, price } = await req.json();

    // 3. Вызываем сервис с актуальным teamId
    const updatedPlayer = await MarketService.setTransferStatus(
      id, 
      teamId, 
      isOnTransfer, 
      price
    );

    // Сериализуем BigInt перед отправкой
    const result = JSON.parse(JSON.stringify(updatedPlayer, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({ success: true, player: result });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Ошибка сервера" }, { status: 400 });
  }
}