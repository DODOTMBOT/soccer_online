import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/src/server/db";
import { compare } from "bcrypt";
import { Role } from "@prisma/client";

// --- РАСШИРЕНИЕ ТИПОВ NEXT-AUTH ---
// Это нужно, чтобы TypeScript знал о наших кастомных полях (role, teamId, balance)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      teamId?: string | null;
      balance?: string; // Важно: строка, так как BigInt не передается в JSON
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
    signIn: "/auth/signin", // Убедись, что этот путь существует
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

        // Ищем пользователя по Email ИЛИ по Логину
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

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Возвращаем объект пользователя для JWT
        // ВАЖНО: balance преобразуем в строку здесь
        return {
          id: user.id,
          email: user.email,
          name: user.login,
          role: user.role,
          balance: user.balance.toString(), // BigInt -> String (Fix 500 error)
          teamId: user.managedTeam?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    // 1. При создании токена копируем данные из User
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.teamId = user.teamId;
        token.balance = user.balance;
      }
      return token;
    },
    // 2. При создании сессии копируем данные из токена в session.user
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