import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Исправлено: Promise
) {
  try {
    // В Next.js 15 params нужно обязательно "дождаться" (await)
    const { id } = await params;

    const countryData = await prisma.country.findUnique({
      where: { id: id },
      include: {
        leagues: {
          include: {
            teams: true,
          },
          orderBy: { level: 'asc' },
        },
      },
    });

    if (!countryData) {
      return NextResponse.json({ error: "Страна не найдена" }, { status: 404 });
    }

    // Рекурсивная функция для превращения всех BigInt в String
    const serialize = (obj: any): any => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    return NextResponse.json(serialize(countryData));
  } catch (error: any) {
    console.error("🔥 FULL API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}