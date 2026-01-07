import { prisma } from "@/src/server/db";
import { playMatch, EngineTeam, EnginePlayer } from "@/src/server/domain/engine/core";
import { Prisma } from "@prisma/client";

export class MatchService {
  
  // Маппер: Превращает игрока БД (Prisma) в игрока Движка
  private static mapPlayer(player: any, assignedPosition: string): EnginePlayer {
    return {
      id: player.id,
      name: `${player.lastName} ${player.firstName}`,
      power: player.power,
      assignedPosition: assignedPosition,
      // Привязка спецух из БД к движку
      specKr: player.specCombination || 0,
      specKt: player.specDribbling || 0,
      specRv: player.specSpeed || 0,
      specVp: player.specLongPass || 0,
      specZv: player.specShooting || 0,
      specGkRea: player.specGkReflexes || 0,
      specGkPos: player.specGkOut || 0,
    };
  }

  // Основной метод симуляции
  static async simulateMatch(matchId: string) {
    // 1. Загрузка данных
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        setups: { include: { lineupSlots: { include: { player: true } } } }
      }
    });

    if (!match) throw new Error("Матч не найден");
    if (match.status === "FINISHED") throw new Error("Матч уже сыгран");

    // 2. Подготовка команд для движка
    const homeSetup = match.setups.find(s => s.teamId === match.homeTeamId);
    const awaySetup = match.setups.find(s => s.teamId === match.awayTeamId);

    const createEngineTeam = (team: any, setup: any, isHome: boolean): EngineTeam => {
      // Собираем игроков из расстановки
      const players = setup?.lineupSlots.map((slot: any) => 
        this.mapPlayer(slot.player, slot.assignedPosition)
      ) || [];

      return {
        teamId: team.id,
        name: team.name,
        isHome,
        tactic: setup?.tactic || "NORMAL",
        defenseSetup: setup?.defenseSetup || "ZONAL",
        players
      };
    };

    const homeEngine = createEngineTeam(match.homeTeam, homeSetup, true);
    const awayEngine = createEngineTeam(match.awayTeam, awaySetup, false);

    // 3. Запуск симуляции (Чистая функция)
    const result = playMatch(homeEngine, awayEngine);

    // 4. Сохранение результата (Транзакция)
    const hScore = result.homeScore;
    const aScore = result.awayScore;
    
    // Очки
    const hPoints = hScore > aScore ? 3 : (hScore === aScore ? 1 : 0);
    const aPoints = aScore > hScore ? 3 : (aScore === hScore ? 1 : 0);

    const reportJson = JSON.parse(JSON.stringify(result)); // Сериализация для БД

    await prisma.$transaction([
      // Обновляем матч
      prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: hScore,
          awayScore: aScore,
          status: "FINISHED",
          report: reportJson
        }
      }),
      // Обновляем хозяев
      prisma.team.update({
        where: { id: match.homeTeamId },
        data: {
          played: { increment: 1 },
          wins: { increment: hScore > aScore ? 1 : 0 },
          draws: { increment: hScore === aScore ? 1 : 0 },
          losses: { increment: hScore < aScore ? 1 : 0 },
          goalsScored: { increment: hScore },
          goalsConceded: { increment: aScore },
          goalsDiff: { increment: hScore - aScore },
          points: { increment: hPoints }
        }
      }),
      // Обновляем гостей
      prisma.team.update({
        where: { id: match.awayTeamId },
        data: {
          played: { increment: 1 },
          wins: { increment: aScore > hScore ? 1 : 0 },
          draws: { increment: aScore === hScore ? 1 : 0 },
          losses: { increment: aScore < hScore ? 1 : 0 },
          goalsScored: { increment: aScore },
          goalsConceded: { increment: hScore },
          goalsDiff: { increment: aScore - hScore },
          points: { increment: aPoints }
        }
      })
    ]);

    return result;
  }
}