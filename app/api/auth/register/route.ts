import { prisma } from "@/src/server/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, login, password } = await req.json();

    if (!email || !login || !password) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    // 1. Проверяем, есть ли уже такой пользователь
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { login }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким Email или Логином уже существует" }, { status: 409 });
    }

    // 2. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        login,
        password: hashedPassword,
        balance: 1000000,
        role: "USER"
      },
    });

    // 4. Возвращаем ответ (превращая BigInt в строку вручную для надежности)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        balance: user.balance.toString()
      }
    });

  } catch (e: any) {
    console.error("Registration error:", e);
    return NextResponse.json({ error: "Ошибка сервера при регистрации" }, { status: 500 });
  }
}