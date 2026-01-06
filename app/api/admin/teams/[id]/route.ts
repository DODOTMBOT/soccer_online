import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Функция для безопасной сериализации BigInt
function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const team = await prisma.team.findUnique({ 
      where: { id },
      include: { 
        players: true,
        league: { include: { country: true } },
        manager: true
      } 
    });

    if (!team) {
      return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });
    }

    // Обертываем результат в функцию сериализации
    return NextResponse.json(serializeData(team));
  } catch (error: any) {
    console.error("GET_TEAM_API_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера", details: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ message: "Клуб удален" });
  } catch (error: any) {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}