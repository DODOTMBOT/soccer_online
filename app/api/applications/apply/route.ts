import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка сессии и наличия ID пользователя
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { teamId } = body;

    // 1. Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.managedTeam) return NextResponse.json({ error: "У вас уже есть клуб" }, { status: 400 });

    // 2. Проверяем клуб
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });
    if (team.managerId) return NextResponse.json({ error: "Клуб уже занят" }, { status: 400 });

    // 3. Создаем заявку (ИСПРАВЛЕНО: prisma.teamApplication)
    // Проверяем существующие заявки
    const existingApp = await prisma.teamApplication.findFirst({
      where: { userId: user.id, status: "PENDING" }
    });

    if (existingApp) return NextResponse.json({ error: "У вас уже есть активная заявка" }, { status: 400 });

    // Создаем новую заявку (ИСПРАВЛЕНО: prisma.teamApplication)
    const application = await prisma.teamApplication.create({
      data: {
        userId: user.id,
        teamId: team.id,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, application });

  } catch (error: any) {
    console.error("APPLY_ERROR:", error);
    // Обработка уникального констрейнта (на всякий случай)
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Заявка уже существует" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка при подаче заявки" }, { status: 500 });
  }
}