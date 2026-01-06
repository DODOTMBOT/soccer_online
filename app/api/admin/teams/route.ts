import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Функция для обработки BigInt (JSON.stringify не умеет работать с BigInt напрямую)
function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// ПОЛУЧЕНИЕ ВСЕХ КЛУБОВ
export async function GET() {
  try {
    // ВАЖНО: Проверь, что в базе нет битых связей после изменения схемы
    const teams = await prisma.team.findMany({
      include: {
        league: { select: { name: true } },
        country: { select: { name: true, flag: true } }, // Добавили флаг для красоты
        manager: { select: { login: true, name: true } },
        _count: { select: { players: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Если команд нет, возвращаем пустой массив, а не ошибку
    if (!teams) return NextResponse.json([]);

    return NextResponse.json(serializeBigInt(teams));
  } catch (error: any) {
    // Выводим детальную ошибку в консоль сервера (терминал), чтобы понять почему 500
    console.error("TEAMS_GET_ERROR_DETAIL:", error.message);
    return NextResponse.json(
      { error: "Ошибка при получении списка команд", details: error.message }, 
      { status: 500 }
    );
  }
}

// СОЗДАНИЕ КЛУБА
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Проверка прав доступа
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Недостаточно прав для создания клуба" }, { status: 403 });
    }

    const body = await req.json();
    const { name, logo, countryId, leagueId, stadium, finances, capacity } = body;

    // Валидация
    if (!name || !countryId || !leagueId || !stadium) {
      return NextResponse.json({ error: "Название, страна, лига и стадион обязательны" }, { status: 400 });
    }

    const newTeam = await prisma.team.create({
      data: {
        name,
        logo: logo || null,
        stadium,
        capacity: parseInt(capacity) || 60,
        // Безопасная конвертация в BigInt
        finances: finances ? BigInt(Math.floor(Number(finances))) : BigInt(0), 
        country: { connect: { id: countryId } },
        league: { connect: { id: leagueId } }
      },
    });

    return NextResponse.json(serializeBigInt(newTeam), { status: 201 });
  } catch (error: any) {
    console.error("TEAM_CREATE_ERROR:", error);
    
    // Ошибка уникальности названия (P2002 в Prisma)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Клуб с таким названием уже существует" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}