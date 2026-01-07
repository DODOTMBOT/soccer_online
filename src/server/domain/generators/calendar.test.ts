import { describe, expect, it } from 'vitest';
import { generateBergerSchedule } from './calendar';

describe('Berger Generator', () => {
  it('should generate correct schedule for 4 teams', () => {
    const teams = ['1', '2', '3', '4'];
    const schedule = generateBergerSchedule(teams);
    
    // Для 4 команд: 3 тура (N-1)
    expect(schedule.length).toBe(3);
    // В каждом туре 2 матча
    expect(schedule[0].length).toBe(2);
  });

  it('should handle odd number of teams (5 teams)', () => {
    const teams = ['1', '2', '3', '4', '5'];
    const schedule = generateBergerSchedule(teams);
    
    // Для 5 команд (+1 BYE) = 6 участников -> 5 туров
    expect(schedule.length).toBe(5);
    // В каждом туре 2 матча (один отдыхает)
    expect(schedule[0].length).toBe(2);
  });
});