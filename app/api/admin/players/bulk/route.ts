import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db";
import { PlayStyleLevel, Position } from "@prisma/client";

const bulkPlayerSchema = z.array(
  z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    age: z.number().min(15).max(50),
    power: z.number().min(1).max(250), // Увеличено со 100 до 250
    potential: z.number().min(1).max(250).optional().default(70),
    injuryProne: z.number().min(0).max(100).optional().default(10),
    mainPosition: z.string(), 
    sidePosition: z.string().nullable().optional(),
    teamId: z.string().min(1),
    countryId: z.string().min(1),
    formIndex: z.number().default(0),
    playStyles: z.array(
      z.object({
        definitionId: z.string(),
        level: z.enum(["BRONZE", "SILVER", "GOLD"]),
      })
    ).optional().default([]),
  })
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = bulkPlayerSchema.safeParse(body);
    
    if (!result.success) {
      const issue = result.error.issues[0];
      const rowPath = issue.path[0];
      const fieldPath = issue.path[1];
      const rowNumber = typeof rowPath === 'number' ? rowPath + 1 : 1;
      const fieldName = fieldPath ? String(fieldPath) : "unknown";
      const errorMsg = `Error in row ${rowNumber} (field ${fieldName}): ${issue.message}`;
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const playersData = result.data;

    const createdPlayers = await prisma.$transaction(
      playersData.map((player) => {
        const { playStyles, ...baseData } = player;
        return prisma.player.create({
          data: {
            ...baseData,
            mainPosition: baseData.mainPosition as Position, 
            sidePosition: baseData.sidePosition ? (baseData.sidePosition as Position) : null,
            playStyles: {
              create: playStyles.map((style) => ({
                definitionId: style.definitionId,
                level: style.level as PlayStyleLevel
              }))
            }
          },
        });
      })
    );

    return NextResponse.json({ success: true, count: createdPlayers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}