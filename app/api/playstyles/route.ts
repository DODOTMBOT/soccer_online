import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";

// GET: Получение списка (уже было)
export async function GET() {
  try {
    const definitions = await prisma.playStyleDefinition.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return NextResponse.json(definitions);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка загрузки справочника" }, { status: 500 });
  }
}

// PATCH: Сохранение описания (НОВОЕ)
export async function PATCH(req: Request) {
  try {
    // Проверка прав админа
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
    }

    const updated = await prisma.playStyleDefinition.update({
      where: { id },
      data: { description }
    });

    return NextResponse.json({ success: true, updated });
  } catch (e) {
    console.error("PlayStyle Update Error:", e);
    return NextResponse.json({ error: "Ошибка при сохранении" }, { status: 500 });
  }
}