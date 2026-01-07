import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;

    // Prisma Cascade удалит всё связанное: Лиги -> Команды -> Игроков -> Матчи
    await prisma.season.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Сезон и все данные удалены" });
  } catch (error: any) {
    console.error("DELETE_SEASON_ERROR:", error);
    return NextResponse.json({ error: "Ошибка при удалении сезона" }, { status: 500 });
  }
}