import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// --- ПОЛУЧЕНИЕ СПИСКА СТРАН (ТОЛЬКО С КОМАНДАМИ) ---
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: {
        // Фильтр: возвращаем страну только если в ней есть хотя бы одна команда
        teams: {
          some: {} 
        }
      },
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

// --- СОЗДАНИЕ НОВОЙ СТРАНЫ ---
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