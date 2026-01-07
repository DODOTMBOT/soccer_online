import { NextResponse } from "next/server";
import { LeagueService } from "@/src/server/services/league.service";

export async function POST(req: Request) {
  try {
    const { leagueId, roundsCount, seasonId } = await req.json();
    
    if (!seasonId || !leagueId) {
      return NextResponse.json({ error: "Неверные параметры" }, { status: 400 });
    }

    const count = await LeagueService.generateCalendar(leagueId, seasonId, roundsCount);

    return NextResponse.json({ success: true, message: `Создано ${count} матчей` });
  } catch (error: any) {
    console.error("CALENDAR_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}