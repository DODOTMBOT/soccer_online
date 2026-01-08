import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/src/server/db";
import { compare } from "bcrypt";
import { Role } from "@prisma/client";

// --- РАСШИРЕНИЕ ТИПОВ NEXT-AUTH ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      teamId?: string | null;
      balance?: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: Role;
    teamId?: string | null;
    balance?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    teamId?: string | null;
    balance?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        // 1. Ищем пользователя
        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: credentials.login },
              { login: credentials.login }
            ]
          },
          include: { managedTeam: true }
        });

        if (!user || !user.password) {
          return null;
        }

        // 2. Проверяем пароль
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // 3. Возвращаем объект (Initial Sign In)
        return {
          id: user.id,
          email: user.email,
          name: user.login,
          role: user.role,
          balance: user.balance.toString(),
          teamId: user.managedTeam?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    // КОЛЛБЭК JWT: Вызывается при создании токена И при обновлении сессии
    async jwt({ token, user, trigger, session }) {
      
      // Сценарий 1: Первичный вход (Sign In)
      // В этот момент аргумент 'user' заполнен данными из authorize
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.teamId = user.teamId;
        token.balance = user.balance;
      } 
      // Сценарий 2: Пользователь уже залогинен (Навигация / F5)
      // Аргумента 'user' нет, но есть 'token.id'. Проверяем актуальные данные в БД.
      else if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: true,
            balance: true,
            managedTeam: {
              select: { id: true }
            }
          }
        });

        if (freshUser) {
          // Обновляем токен свежими данными из базы
          token.teamId = freshUser.managedTeam?.id || null;
          token.balance = freshUser.balance.toString();
          token.role = freshUser.role;
        }
      }

      // Поддержка ручного обновления с клиента (await update({ balance: ... }))
      if (trigger === "update" && session) {
         return { ...token, ...session };
      }

      return token;
    },

    // КОЛЛБЭК SESSION: Передает данные из токена на клиент
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.teamId = token.teamId;
        session.user.balance = token.balance;
        
        if (token.name) {
             session.user.name = token.name;
        }
      }
      return session;
    },
  },
};