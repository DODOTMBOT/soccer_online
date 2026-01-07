import { NextResponse } from "next/server";
import { ApplicationService } from "@/src/server/services/application.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";

// GET /api/admin/applications - Список
export async function GET() {
  try {
    const list = await ApplicationService.getAll();
    // Сериализация для BigInt (если есть)
    const data = JSON.parse(JSON.stringify(list));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}

// PATCH /api/admin/applications - Решение (Принять/Отклонить)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status } = await req.json();
    const result = await ApplicationService.resolve(id, status);
    
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}