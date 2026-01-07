import { NextResponse } from "next/server";
import { TeamService } from "@/src/server/services/team.service";

export async function POST(req: Request) {
  try {
    const { teamId } = await req.json();
    if (!teamId) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

    await TeamService.generatePlayers(teamId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("GEN_PLAYERS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}