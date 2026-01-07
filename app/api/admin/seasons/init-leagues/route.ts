import { NextResponse } from "next/server";
import { SeasonService } from "@/src/server/services/season.service";

export async function POST(req: Request) {
  try {
    const { seasonId } = await req.json();
    if (!seasonId) return NextResponse.json({ error: "Нет ID сезона" }, { status: 400 });

    const result = await SeasonService.initLeagues(seasonId);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("INIT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}