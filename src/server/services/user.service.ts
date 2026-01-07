import { prisma } from "@/src/server/db";
import { hash } from "bcrypt";

export class UserService {
  static async register(data: { login: string; email: string; password: string }) {
    const { login, email, password } = data;

    // Проверка уникальности
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { login }] }
    });

    if (existingUser) {
      throw new Error("Пользователь с таким email или логином уже существует");
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        login,
        email,
        password: hashedPassword,
        role: "USER"
      }
    });

    // Возвращаем без пароля
    const { password: _, ...result } = user;
    return result;
  }
}