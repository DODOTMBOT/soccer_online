import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const apps = await prisma.teamApplication.findMany({
    where: { status: "PENDING" },
    include: { user: true, team: true },
    orderBy: { createdAt: "desc" }
  });
  // Сериализация BigInt если нужно
  const safeApps = JSON.parse(JSON.stringify(apps, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
  return NextResponse.json(safeApps);
}