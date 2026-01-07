import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await req.json();
  const userId = session.user.id;

  try {
    // Выполняем в транзакции:
    // 1. Снимаем этого менеджера с любых других команд (освобождаем слот)
    // 2. Назначаем менеджера в новую команду
    await prisma.$transaction([
      // Шаг 1: Найти команду, где этот юзер уже менеджер, и уволить его оттуда
      prisma.team.updateMany({
        where: { managerId: userId },
        data: { managerId: null }
      }),
      
      // Шаг 2: Назначить юзера в новую команду (даже если там кто-то был, мы его перезапишем)
      prisma.team.update({
        where: { id: teamId },
        data: { managerId: userId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Claim Error:", error);
    return NextResponse.json({ error: error.message || "Failed to claim team" }, { status: 400 });
  }
}