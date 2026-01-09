import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";

// GET: Получить плейстайлы игрока
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const styles = await prisma.playerPlayStyle.findMany({
    where: { playerId: id },
    include: { definition: true }
  });
  return NextResponse.json(styles);
}

// POST: Добавить новый плейстайл (всегда BRONZE)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { definitionId } = await req.json();

  try {
    const count = await prisma.playerPlayStyle.count({ where: { playerId: id } });
    if (count >= 5) return NextResponse.json({ error: "Все 5 слотов заняты" }, { status: 400 });

    const newStyle = await prisma.playerPlayStyle.create({
      data: {
        playerId: id,
        definitionId,
        level: "BRONZE"
      },
      include: { definition: true }
    });
    return NextResponse.json(newStyle);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка (возможно дубликат)" }, { status: 400 });
  }
}

// PATCH: Апгрейд уровня
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { playerPlayStyleId } = await req.json();

  const current = await prisma.playerPlayStyle.findUnique({ where: { id: playerPlayStyleId } });
  if (!current) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  let nextLevel = current.level;
  if (current.level === "BRONZE") nextLevel = "SILVER";
  else if (current.level === "SILVER") nextLevel = "GOLD";
  else return NextResponse.json({ error: "Максимальный уровень" }, { status: 400 });

  const updated = await prisma.playerPlayStyle.update({
    where: { id: playerPlayStyleId },
    data: { level: nextLevel },
    include: { definition: true }
  });

  return NextResponse.json(updated);
}