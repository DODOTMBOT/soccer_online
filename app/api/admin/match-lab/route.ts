import { NextResponse } from "next/server";
import { playMatch, EngineTeam } from "@/src/server/domain/engine/match-engine";

export async function POST(req: Request) {
  try {
    const { homeTeam, awayTeam, seed, config } = await req.json();

    // Здесь можно было бы достать реальные данные из БД, если переданы только ID
    // Но для гибкости предполагаем, что клиент присылает полный слепок (snapshot) EngineTeam
    
    // Подготовка команд (упрощенная)
    const hTeam: EngineTeam = { ...homeTeam, isHome: true };
    const aTeam: EngineTeam = { ...awayTeam, isHome: false };

    // Запуск в режиме DEBUG
    const result = playMatch(hTeam, aTeam, seed, true);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}