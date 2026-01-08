// app/api/admin/schedule/init/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { SchedulerService } from "@/src/server/services/scheduler.service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { seasonId } = await req.json();
    if (!seasonId) return NextResponse.json({ error: "ID сезона обязателен" }, { status: 400 });

    await SchedulerService.initSeasonTimeline(seasonId);

    return NextResponse.json({ success: true, message: "Игровые дни и слоты созданы" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}