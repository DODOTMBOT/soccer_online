import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { teamId } = await req.json();
    
    if (!teamId) {
      return NextResponse.json({ error: "ID команды обязателен" }, { status: 400 });
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { leagueId: null } // Отвязываем команду от лиги
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("UNASSIGN ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}