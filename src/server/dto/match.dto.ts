import { z } from "zod";
import { VflStyle, DefenseType, Formation, Mentality, TeamSpirit } from "@prisma/client";

// Схема для состава на матч
export const MatchLineupSchema = z.object({
  matchId: z.string().min(1),
  teamId: z.string().min(1),
  playerIds: z.array(z.string()).length(11, "Должно быть ровно 11 игроков основы"),
  subIds: z.array(z.string()).optional().default([]),
  
  tactic: z.nativeEnum(VflStyle).default("NORMAL"),
  defenseSetup: z.nativeEnum(DefenseType).default("ZONAL"),
  formation: z.nativeEnum(Formation).default("F442"),
  mentality: z.nativeEnum(Mentality).default("NORMAL"),
  spirit: z.nativeEnum(TeamSpirit).default("NORMAL"),
});

export type MatchLineupDTO = z.infer<typeof MatchLineupSchema>;