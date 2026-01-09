import { NextResponse } from "next/server";
import { createPlayersBulkSchema } from "@/src/server/dto/validation";
import { PlayerService } from "@/src/server/services/player.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = createPlayersBulkSchema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      
      // ИСПРАВЛЕНИЕ: Явное преобразование path[1] в строку, чтобы TS не ругался на symbol
      const fieldName = issue.path[1] ? String(issue.path[1]) : "неизвестно";
      const rowNumber = issue.path[0] ? Number(issue.path[0]) + 1 : 1;

      const errorMsg = `Ошибка в строке ${rowNumber} (поле ${fieldName}): ${issue.message}`;
      
      console.error("❌ BULK VALIDATION ERROR:", errorMsg); 
      console.error("Payload:", JSON.stringify(body, null, 2));

      return NextResponse.json(
        { error: errorMsg }, 
        { status: 400 }
      );
    }

    const created = await PlayerService.createBulk(result.data);

    return NextResponse.json({ success: true, count: created.length });
  } catch (error: any) {
    console.error("BULK_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}