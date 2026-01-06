import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // Проверка метода (на всякий случай)
    if (req.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await req.json();
    const { login, name, surname, email, password } = body;

    if (!login || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { login }] }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        login,
        name,
        surname,
        email,
        password: hashedPassword,
        role: "USER"
      }
    });

    return NextResponse.json(
      { success: true, message: "User registered" }, 
      { 
        status: 201,
        headers: { "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("API_REGISTER_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}