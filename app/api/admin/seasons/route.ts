import { prisma } from "@/lib/prisma";
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

export async function POST() {
  try {
    // 1. Находим последний номер сезона
    const lastSeason = await prisma.season.findFirst({
      orderBy: { year: 'desc' }
    });

    const nextYear = lastSeason ? lastSeason.year + 1 : 1;

    // 2. Используем транзакцию, чтобы гарантированно сначала закрыть старые, а потом открыть новый
    const result = await prisma.$transaction(async (tx) => {
      
      // Завершаем ВСЕ предыдущие сезоны, которые имели статус ACTIVE
      await tx.season.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "FINISHED" }
      });

      // Создаем новый сезон со статусом ACTIVE
      const newSeason = await tx.season.create({
        data: { 
          year: nextYear, 
          status: "ACTIVE" 
        }
      });

      return newSeason;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("SEASON_POST_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}