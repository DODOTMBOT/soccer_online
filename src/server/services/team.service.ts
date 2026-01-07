import { prisma } from "@/src/server/db";
import { Position } from "@prisma/client";

export class TeamService {
  
  static async getAll() {
    return prisma.team.findMany({
      include: {
        league: { select: { name: true } },
        country: { select: { name: true, flag: true } },
        manager: { select: { login: true, name: true } },
        _count: { select: { players: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async create(data: {
    name: string;
    logo?: string | null;
    stadium: string;
    capacity: number;
    finances: bigint;
    baseLevel: number;
    managerId?: string | null;
    countryId: string;
    leagueId: string;
  }) {
    return prisma.team.create({
      data: {
        name: data.name,
        logo: data.logo,
        stadium: data.stadium,
        capacity: data.capacity,
        finances: data.finances,
        baseLevel: data.baseLevel,
        managerId: data.managerId,
        countryId: data.countryId,
        leagueId: data.leagueId
      }
    });
  }

  // Генерация фейковых игроков для команды
  static async generatePlayers(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { countryId: true }
    });

    if (!team) throw new Error("Клуб не найден");

    const SURNAMES = ["Ivanov", "Smith", "Garcia", "Muller", "Rossi", "Dubois", "Silva", "Novak", "Kovacs", "Yilmaz"];
    const NAMES = ["Alex", "Max", "John", "David", "Luis", "Sam", "Karl", "Paul", "Rolf", "Felix"];

    // Схема 4-4-2 (примерно)
    const positions: Position[] = [
      Position.GK, Position.GK,
      Position.CD, Position.CD, Position.CD, Position.CD, Position.LB, Position.RB,
      Position.CM, Position.CM, Position.DM, Position.AM, Position.LM, Position.RM,
      Position.ST, Position.ST, Position.CF, Position.LF
    ];

    const playersData = positions.map((pos) => ({
      firstName: NAMES[Math.floor(Math.random() * NAMES.length)],
      lastName: SURNAMES[Math.floor(Math.random() * SURNAMES.length)],
      age: Math.floor(Math.random() * (35 - 17 + 1)) + 17,
      mainPosition: pos,
      power: Math.floor(Math.random() * (85 - 45 + 1)) + 45,
      potential: Math.floor(Math.random() * 100),
      injuryProne: Math.floor(Math.random() * 100),
      teamId: teamId,
      countryId: team.countryId,
      fatigue: 0,
      fitness: 100,
      currentForm: 100,
      // Дефолтные спецухи
      specKr: 0, specKt: 0, specRv: 0, specVp: 0, specIbm: 0, specKp: 0,
      specZv: 0, specSt: 0, specL: 0, specKi: 0, specPhys: 0, specLong: 0,
      specInt: 0, specAnt: 0, specSpd: 0, specGkRea: 0, specGkPos: 0
    }));

    return prisma.player.createMany({ data: playersData });
  }
}