import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ЛОГ ДЛЯ ТЕБЯ: Посмотри в терминал VS Code после нажатия кнопки
    console.log("--- ПОПЫТКА СОЗДАНИЯ СТРАНЫ ---");
    console.log("Сессия:", session ? "ЕСТЬ" : "НЕТ");
    console.log("Роль из сессии:", (session?.user as any)?.role);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен. Нужна роль ADMIN. Перелогиньтесь!" }, { status: 403 });
    }

    const body = await req.json();
    console.log("Данные формы:", body);

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
    console.error("ОШИБКА API:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Такая страна уже существует" }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// Обязательно добавь GET, чтобы список не выдавал 404
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      include: { _count: { select: { leagues: true, teams: true } } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(countries);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}