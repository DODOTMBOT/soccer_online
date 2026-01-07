import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Типизируем как Promise для Next.js 15
) {
  try {
    // Ожидаем параметры
    const { id } = await params;

    const teams = await prisma.team.findMany({
      where: { countryId: id },
      include: {
        league: true, // ВАЖНО: тянем данные о лиге
        manager: {
          select: {
            id: true,
            login: true,
            name: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const serialize = (obj: any): any => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    return NextResponse.json(serialize(teams));
  } catch (error: any) {
    console.error("Teams API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}