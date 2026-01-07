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
      balance?: string; // ИСПРАВЛЕНО: string вместо number
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: Role;
    teamId?: string | null;
    balance?: string; // ИСПРАВЛЕНО: string вместо number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    teamId?: string | null;
    balance?: string; // ИСПРАВЛЕНО: string вместо number
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

        return {
          id: user.id,
          email: user.email,
          name: user.login,
          role: user.role,
          balance: user.balance.toString(), // ИСПРАВЛЕНО: toString() для сохранения BigInt
          teamId: user.managedTeam?.id || null,
        };
      },
    }),
  ],
  callbacks: {
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