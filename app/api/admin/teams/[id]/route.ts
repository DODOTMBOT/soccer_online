import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

// Функция для безопасной сериализации только BigInt полей
function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
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
    manager: true,
    league: { 
      include: { 
        country: true,
        // Загружаем команды лиги с той же сортировкой, что и в таблице
        teams: {
          orderBy: [
            { points: 'desc' },
            { goalsDiff: 'desc' },
            { name: 'asc' } // Если очки равны, сортируем по алфавиту (как в вашей таблице)
          ],
          select: { id: true } // Нам нужны только ID для определения индекса
        }
      } 
    },
  } 
});

    if (!team) {
      return NextResponse.json({ error: "Клуб не найден" }, { status: 404 });
    }

    return NextResponse.json(serializeData(team));
  } catch (error: any) {
    console.error("GET_TEAM_API_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера", details: error.message }, { status: 500 });
  }
}

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