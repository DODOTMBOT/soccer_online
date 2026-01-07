import { NextResponse } from "next/server";
import { createPlayersBulkSchema } from "@/src/server/dto/validation";
import { PlayerService } from "@/src/server/services/player.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = createPlayersBulkSchema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return NextResponse.json(
        { error: `Ошибка в строке ${Number(issue.path[0]) + 1}: ${issue.message}` }, 
        { status: 400 }
      );
    }

    const created = await PlayerService.createBulk(result.data);

    return NextResponse.json({ success: true, count: created.count });
  } catch (error: any) {
    console.error("BULK_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}