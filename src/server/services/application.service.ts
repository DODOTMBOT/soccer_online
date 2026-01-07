import { prisma } from "@/src/server/db";

export class ApplicationService {
  
  // 1. Получить список всех заявок (для админа)
  static async getAll() {
    return prisma.teamApplication.findMany({
      include: {
        user: { select: { login: true, email: true } },
        team: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 2. Создать заявку (для юзера)
  static async create(userId: string, teamId: string) {
    // Проверки
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new Error("Клуб не найден");
    if (team.managerId) throw new Error("Клуб уже занят");

    const existingApp = await prisma.teamApplication.findFirst({
      where: { userId, status: "PENDING" }
    });
    if (existingApp) throw new Error("У вас уже есть активная заявка");

    return prisma.teamApplication.create({
      data: { userId, teamId, status: "PENDING" }
    });
  }

  // 3. Решить судьбу заявки (для админа)
  static async resolve(applicationId: string, status: "APPROVED" | "REJECTED") {
    const app = await prisma.teamApplication.findUnique({ 
      where: { id: applicationId },
      include: { team: true } 
    });

    if (!app) throw new Error("Заявка не найдена");
    if (app.status !== "PENDING") throw new Error("Заявка уже обработана");

    // Если отклоняем - просто меняем статус
    if (status === "REJECTED") {
      return prisma.teamApplication.update({
        where: { id: applicationId },
        data: { status: "REJECTED" }
      });
    }

    // Если принимаем - нужна транзакция (назначить тренера + закрыть заявку)
    return prisma.$transaction(async (tx) => {
      // 1. Назначаем менеджера команде
      await tx.team.update({
        where: { id: app.teamId },
        data: { managerId: app.userId }
      });

      // 2. Обновляем статус заявки
      const updatedApp = await tx.teamApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED" }
      });

      // 3. Отклоняем все остальные заявки на этот клуб
      await tx.teamApplication.updateMany({
        where: { teamId: app.teamId, status: "PENDING", id: { not: applicationId } },
        data: { status: "REJECTED" }
      });

      // 4. Отклоняем все другие заявки этого юзера
      await tx.teamApplication.updateMany({
        where: { userId: app.userId, status: "PENDING", id: { not: applicationId } },
        data: { status: "REJECTED" }
      });

      return updatedApp;
    });
  }
}