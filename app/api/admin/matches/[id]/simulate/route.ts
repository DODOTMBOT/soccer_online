import { NextResponse } from "next/server";
import { MatchService } from "@/src/server/services/match.service"; // Импорт нового сервиса
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Исправлено под Next.js 15
) {
  try {
    const resolvedParams = await params; 
    const matchId = resolvedParams.id;

    // Вся сложная логика теперь в сервисе
    const result = await MatchService.simulateMatch(matchId);

    // Сброс кэша
    revalidatePath(`/admin/matches/${matchId}`);
    
    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("SIMULATION_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при симуляции" }, 
      { status: 500 }
    );
  }
}