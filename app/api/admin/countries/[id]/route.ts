import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Указываем, что params это Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // РАСКРЫВАЕМ params перед использованием (решение вашей ошибки)
    const { id } = await params;

    await prisma.country.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Удалено" });
  } catch (error: any) {
    console.error("DELETE_ERROR:", error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Нельзя удалить: к этой стране привязаны другие данные (лиги/команды)" }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}