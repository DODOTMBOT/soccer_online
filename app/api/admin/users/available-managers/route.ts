import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // Ищем пользователей, которые НЕ являются менеджерами ни одного клуба
    const availableManagers = await prisma.user.findMany({
      where: {
        managedTeam: null, // У кого нет привязанного клуба
        role: "USER"       // Обычно менеджерами назначают обычных юзеров
      },
      select: {
        id: true,
        login: true,
        name: true,
        surname: true
      }
    });

    return NextResponse.json(availableManagers);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}