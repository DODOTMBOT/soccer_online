import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Указываем, что params это Promise
) {
  try {
    const { teamIds } = await req.json();
    
    // ВАЖНО: Разворачиваем параметры через await
    const resolvedParams = await params;
    const leagueId = resolvedParams.id; 

    if (!teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json({ error: "Массив ID обязателен" }, { status: 400 });
    }

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { leagueId: leagueId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}