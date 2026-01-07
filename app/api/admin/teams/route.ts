import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth"; // Пока старый путь, если auth.ts не переносили
import { createTeamSchema } from "@/src/server/dto/validation";
import { TeamService } from "@/src/server/services/team.service";

// Хелпер для BigInt
const serialize = (data: any) => JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));

export async function GET() {
  try {
    const teams = await TeamService.getAll();
    return NextResponse.json(serialize(teams));
  } catch (error) {
    return NextResponse.json({ error: "Ошибка БД" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    const result = createTeamSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const newTeam = await TeamService.create({
      ...result.data,
      finances: BigInt(result.data.finances)
    });

    return NextResponse.json(serialize(newTeam), { status: 201 });
  } catch (error: any) {
    console.error("CREATE_TEAM_ERROR:", error);
    if (error.code === 'P2002') return NextResponse.json({ error: "Название занято" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}