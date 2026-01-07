import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FORMATION_CONFIG } from "@/lib/rules/formations";
import { matchLineupSchema } from "@/src/lib/validation"; 
import { Position, Formation } from "@prisma/client";

function getAssignedPosition(index: number, formation: Formation): Position {
  const config = FORMATION_CONFIG[formation];
  if (config && config[index]) return config[index].main;
  return Position.CM;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = matchLineupSchema.safeParse(body);
    if (!result.success) {
      // ИСПРАВЛЕНО: .issues вместо .errors
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { 
      matchId, teamId, playerIds, subIds, 
      tactic, defenseSetup, formation, mentality, spirit 
    } = result.data;

    const allSlotsData = [
      ...playerIds.map((id, index) => ({
        playerId: id,
        slotIndex: index,
        assignedPosition: getAssignedPosition(index, formation)
      })),
      ...subIds.map((id, index) => ({
        playerId: id,
        slotIndex: index + 11,
        assignedPosition: Position.CM 
      }))
    ];

    await prisma.$transaction(async (tx) => {
      const existing = await tx.matchTeamSetup.findUnique({
        where: { matchId_teamId: { matchId, teamId } }
      });

      if (existing) {
        await tx.matchLineupSlot.deleteMany({ where: { matchTeamSetupId: existing.id } });
        await tx.matchTeamSetup.update({
          where: { id: existing.id },
          data: { tactic, defenseSetup, formation, mentality, spirit, isSubmitted: true }
        });
        await tx.matchLineupSlot.createMany({
          data: allSlotsData.map(s => ({ ...s, matchTeamSetupId: existing.id }))
        });
      } else {
        await tx.matchTeamSetup.create({
          data: {
            matchId, teamId, tactic, defenseSetup, formation, mentality, spirit, isSubmitted: true,
            lineupSlots: { create: allSlotsData }
          }
        });
      }
    });

    revalidatePath(`/admin/teams/${teamId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("LINEUP_ERROR:", error);
    return NextResponse.json({ error: "Ошибка сохранения состава" }, { status: 500 });
  }
}