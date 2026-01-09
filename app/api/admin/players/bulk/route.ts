import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db";
import { PlayStyleLevel, Position } from "@prisma/client"; // Added Position import

// 1. Validation Schema
const bulkPlayerSchema = z.array(
  z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    age: z.number().min(15).max(50),
    power: z.number().min(1).max(99),
    potential: z.number().min(1).max(99).optional().default(70),
    injuryProne: z.number().min(0).max(99).optional().default(10),
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

    // 2. Validation
    const result = bulkPlayerSchema.safeParse(body);
    
    if (!result.success) {
      const issue = result.error.issues[0];
      const rowPath = issue.path[0];
      const fieldPath = issue.path[1];
      const rowNumber = typeof rowPath === 'number' ? rowPath + 1 : 1;
      const fieldName = fieldPath ? String(fieldPath) : "unknown";

      const errorMsg = `Error in row ${rowNumber} (field ${fieldName}): ${issue.message}`;
      console.error("❌ BULK VALIDATION ERROR:", errorMsg); 

      return NextResponse.json(
        { error: errorMsg }, 
        { status: 400 }
      );
    }

    const playersData = result.data;

    // 3. Saving to Database
    const createdPlayers = await prisma.$transaction(
      playersData.map((player) => {
        const { playStyles, ...baseData } = player;

        return prisma.player.create({
          data: {
            ...baseData,
            // Cast string to the specific Position enum
            mainPosition: baseData.mainPosition as Position, 
            // Handle sidePosition: if null/empty, pass null, otherwise cast to Position
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
    console.error("BULK_ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}