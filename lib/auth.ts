import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// Расширяем типы
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      teamId: string | null;
      balance: string;
    } & DefaultSession["user"]
  }
  interface User {
    role: Role;
    balance: bigint;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    teamId: string | null;
    balance: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ login: credentials.login }, { email: credentials.login }] },
          include: { managedTeam: true }
        });

        if (user && user.password) {
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) {
            return { 
              id: user.id, 
              name: user.name || user.login, 
              email: user.email, 
              role: user.role,
              balance: user.balance,
              teamId: user.managedTeam?.id || null 
            } as any;
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Этот колбэк срабатывает при логине и при обновлении токена
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.balance = (user as any).balance.toString();
        // При логине запишем то, что было, но это значение может устареть
        token.teamId = (user as any).teamId; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.balance = token.balance;

        // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        // Мы делаем легкий запрос в БД при каждом обращении к сессии,
        // чтобы получить АКТУАЛЬНЫЙ статус команды.
        // Это позволяет кнопке стать "зеленой" без перелогина.
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { managedTeam: { select: { id: true } } } // Берем только ID команды
        });

        // Если в БД есть команда — пишем её в сессию. Если нет — null.
        session.user.teamId = freshUser?.managedTeam?.id || null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" }
};