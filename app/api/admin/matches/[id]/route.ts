import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        season: true,
        setups: {
          include: {
            lineupSlots: {
              include: { player: true }
            }
          }
        }
      }
    });

    if (!match) return NextResponse.json({ error: "Матч не найден" }, { status: 404 });

    return NextResponse.json(serializeData(match));
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}