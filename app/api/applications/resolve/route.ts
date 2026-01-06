import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { applicationId, decision } = await req.json(); // decision: 'APPROVE' | 'REJECT'

    const application = await prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: { team: true, user: true } // Подгружаем, чтобы проверить связи
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // ЛОГИКА ОТКЛОНЕНИЯ
    if (decision === 'REJECT') {
      await prisma.teamApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ message: "Заявка отклонена" });
    }

    // ЛОГИКА ОДОБРЕНИЯ (ТРАНЗАКЦИЯ)
    if (decision === 'APPROVE') {
      // Проверка на случай, если команду заняли, пока админ думал
      if (application.team.managerId) {
        return NextResponse.json({ error: "Команда уже занята другим менеджером" }, { status: 400 });
      }

      await prisma.$transaction([
        // 1. Ставим юзера менеджером команды
        prisma.team.update({
          where: { id: application.teamId },
          data: { managerId: application.userId }
        }),
        // 2. Ставим статус заявке APPROVED
        prisma.teamApplication.update({
          where: { id: applicationId },
          data: { status: 'APPROVED' }
        }),
        // 3. Отклоняем ВСЕ остальные заявки на ЭТУ команду
        prisma.teamApplication.updateMany({
          where: { 
            teamId: application.teamId,
            id: { not: applicationId },
            status: 'PENDING'
          },
          data: { status: 'REJECTED' }
        }),
        // 4. Отклоняем ВСЕ остальные заявки ЭТОГО юзера в другие команды
        prisma.teamApplication.updateMany({
          where: {
            userId: application.userId,
            id: { not: applicationId },
            status: 'PENDING'
          },
          data: { status: 'REJECTED' }
        })
      ]);

      return NextResponse.json({ message: "Менеджер назначен успешно" });
    }

    return NextResponse.json({ error: "Неверное действие" }, { status: 400 });

  } catch (error) {
    console.error("RESOLVE ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}