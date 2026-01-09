import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/auth";
import { prisma } from "@/src/server/db";
import { Position, PlayStyleLevel } from "@prisma/client";

// PATCH: Обновление игрока
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    // Транзакционное обновление
    const updatedPlayer = await prisma.$transaction(async (tx) => {
      // 1. Обновляем основные поля
      const { playStyles, teamId, ...scalarData } = body;
      
      const player = await tx.player.update({
        where: { id },
        data: {
          ...scalarData,
          teamId: teamId, // Перенос в другой клуб
          // Валидация типов полей (например power) должна быть на клиенте или zod перед этим
        }
      });

      // 2. Обновляем PlayStyles (если переданы)
      if (playStyles && Array.isArray(playStyles)) {
        // Удаляем старые
        await tx.playerPlayStyle.deleteMany({ where: { playerId: id } });
        
        // Добавляем новые
        if (playStyles.length > 0) {
          await tx.playerPlayStyle.createMany({
            data: playStyles.map((ps: any) => ({
              playerId: id,
              definitionId: ps.definitionId,
              level: ps.level as PlayStyleLevel
            }))
          });
        }
      }

      // 3. Аудит (Опционально, если модель создана)
      /* await tx.auditLog.create({
        data: {
          entityType: "PLAYER",
          entityId: id,
          action: "ADMIN_UPDATE",
          actorId: session.user.id,
          changes: body
        }
      }); 
      */

      return player;
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: Получение полных данных для формы
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      team: { select: { id: true, name: true } },
      playStyles: { include: { definition: true } }
    }
  });
  
  if(!player) return NextResponse.json({error: "Not found"}, {status: 404});
  
  // Сериализация BigInt
  return NextResponse.json(JSON.parse(JSON.stringify(player, (_, v) => typeof v === 'bigint' ? v.toString() : v)));
}