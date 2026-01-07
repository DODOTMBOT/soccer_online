import { describe, expect, it } from 'vitest';
import { playMatch, EngineTeam, MatchResult } from './match-engine'; // Проверь путь импорта

// Хелпер для создания мок-команды
const mockTeam = (name: string, power: number): EngineTeam => ({
  teamId: name,
  name: name,
  isHome: true,
  tactic: 'NORMAL',
  defenseSetup: 'ZONAL',
  players: Array(11).fill(null).map((_, i) => ({
    id: `${name}-${i}`,
    name: `${name} Player ${i}`,
    power: power,
    assignedPosition: i === 0 ? 'GK' : 'CM',
    // Минимальные спецухи для запуска
    specKr: 0, specKt: 0, specRv: 0, specVp: 0, specIbm: 0, specKp: 0,
    specZv: 0, specLong: 0, specInt: 0, specAnt: 0, specSpd: 0,
    specGkRea: 0, specGkPos: 0, specPhys: 0, specL: 0, specKi: 0, specSt: 0
  }))
});

describe('Match Engine Smoke Test', () => {
  it('should return valid match result', () => {
    const home = mockTeam('Home', 50);
    const away = mockTeam('Away', 50);
    away.isHome = false; // Гости

    const result: MatchResult = playMatch(home, away);

    expect(result).toBeDefined();
    // Счет не может быть отрицательным
    expect(result.homeScore).toBeGreaterThanOrEqual(0);
    expect(result.awayScore).toBeGreaterThanOrEqual(0);
    
    // xG должно быть числом
    expect(result.homeXG).toBeTypeOf('number');
    expect(result.awayXG).toBeTypeOf('number');
    
    // Должны быть события
    expect(result.events).toBeInstanceOf(Array);
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('strong team should win more often', () => {
    const strong = mockTeam('Strong', 90);
    const weak = mockTeam('Weak', 10);
    weak.isHome = false;

    let strongWins = 0;
    const games = 10;

    for(let i=0; i<games; i++) {
      const res = playMatch(strong, weak);
      if (res.homeScore > res.awayScore) strongWins++;
    }

    // Сильная команда должна выиграть хотя бы половину матчей
    // (на практике 90 vs 10 должно быть 100% побед, но поставим >5 для надежности)
    expect(strongWins).toBeGreaterThan(5);
  });
});