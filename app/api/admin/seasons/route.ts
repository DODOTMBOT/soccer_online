import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const seasons = await prisma.season.findMany({ 
      orderBy: { year: 'desc' } 
    });
    return NextResponse.json(seasons);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { year } = body;

    // Если год/номер не пришел, пробуем посчитать автоматически
    if (!year) {
      const lastSeason = await prisma.season.findFirst({
        orderBy: { year: 'desc' }
      });
      year = lastSeason ? lastSeason.year + 1 : 1;
    }

    // Проверяем, не существует ли уже такой сезон
    const existing = await prisma.season.findUnique({
      where: { year: year }
    });

    if (existing) {
      return NextResponse.json({ error: `Сезон ${year} уже существует!` }, { status: 400 });
    }

    // Используем транзакцию, чтобы гарантированно сначала закрыть старые, а потом открыть новый
    const result = await prisma.$transaction(async (tx) => {
      
      // Завершаем ВСЕ предыдущие сезоны, которые имели статус ACTIVE
      await tx.season.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "FINISHED" }
      });

      // Создаем новый сезон с указанным номером и статусом ACTIVE
      const newSeason = await tx.season.create({
        data: { 
          year: year, 
          status: "ACTIVE" 
        }
      });

      return newSeason;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SEASON_POST_ERROR:", error);
    return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
  }
}