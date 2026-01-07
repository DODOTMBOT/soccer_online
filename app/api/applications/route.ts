import { NextResponse } from "next/server";
import { ApplicationService } from "@/src/server/services/application.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { teamId } = await req.json();
    const app = await ApplicationService.create(session.user.id, teamId);

    return NextResponse.json({ success: true, app });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}