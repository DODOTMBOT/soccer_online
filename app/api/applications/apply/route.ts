import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });

    const { teamId } = await req.json();

    // 1. Проверяем, есть ли уже команда у юзера
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { managedTeam: true }
    });

    if (user?.managedTeam) {
      return NextResponse.json({ error: "У вас уже есть клуб!" }, { status: 400 });
    }

    // 2. Проверяем, не занята ли команда
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (team?.managerId) {
      return NextResponse.json({ error: "Этот клуб уже занят" }, { status: 400 });
    }

    // 3. Создаем заявку
    const application = await prisma.teamApplication.create({
      data: {
        userId: session.user.id,
        teamId: teamId,
        status: "PENDING"
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Вы уже подали заявку в этот клуб" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}