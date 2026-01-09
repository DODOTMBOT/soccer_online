import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { NextResponse } from "next/server";

// --- ПОЛУЧЕНИЕ СПИСКА СТРАН ---
export async function GET(req: Request) {
  try {
    // Получаем параметры из URL
    const { searchParams } = new URL(req.url);
    const includeEmpty = searchParams.get("includeEmpty") === "true";

    // Если includeEmpty=true, фильтр пустой (берем все страны).
    // Иначе берем только те, где есть команды (старое поведение для списков).
    const whereClause = includeEmpty ? {} : {
      teams: {
        some: {} 
      }
    };

    const countries = await prisma.country.findMany({
      where: whereClause,
      include: { 
        _count: { 
          select: { 
            leagues: true, 
            teams: true 
          } 
        } 
      },
      orderBy: { 
        name: 'asc' 
      }
    });

    return NextResponse.json(countries);
  } catch (error) {
    console.error("ОШИБКА ПОЛУЧЕНИЯ СПИСКА СТРАН:", error);
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}

// --- СОЗДАНИЕ НОВОЙ СТРАНЫ (Оставляем без изменений) ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен. Нужна роль ADMIN." }, { status: 403 });
    }

    const body = await req.json();
    const { name, flag, confederation } = body;

    if (!name || !confederation) {
      return NextResponse.json({ error: "Название и конфедерация обязательны" }, { status: 400 });
    }

    const newCountry = await prisma.country.create({
      data: {
        name: name.trim(),
        flag: flag || null,
        confederation,
      },
    });

    return NextResponse.json(newCountry, { status: 201 });
  } catch (error: any) {
    console.error("ОШИБКА СОЗДАНИЯ СТРАНЫ:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Такая страна уже существует" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}