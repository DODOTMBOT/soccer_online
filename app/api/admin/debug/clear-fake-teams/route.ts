import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Сначала удаляем ВСЕ матчи (иначе базу заклинит из-за связей)
    const deletedMatches = await prisma.match.deleteMany({});

    // 2. Удаляем только авто-сгенерированные команды (где в имени есть "Team")
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        name: {
          contains: "Team" // Удалит "Premier League Team 1", "Team 2" и т.д.
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Удалено матчей: ${deletedMatches.count}, Удалено фейковых команд: ${deletedTeams.count}` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}