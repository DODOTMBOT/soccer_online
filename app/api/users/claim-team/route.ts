import { prisma } from "@/src/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await req.json();

  try {
    // Атомарная операция привязки
    await prisma.$transaction([
      prisma.team.update({
        where: { id: teamId },
        data: { managerId: session.user.id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Team already taken or error" }, { status: 400 });
  }
}