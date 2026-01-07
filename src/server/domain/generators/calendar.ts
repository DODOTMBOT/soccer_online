// Алгоритм Бергера для круговой системы
export function generateBergerSchedule(teams: string[]): { home: string, away: string }[][] {
  const schedule: { home: string, away: string }[][] = [];
  const numberOfTeams = teams.length;
  
  // Если команд нечетное количество, добавляем виртуального соперника
  const currentTeams = [...teams];
  if (numberOfTeams % 2 !== 0) currentTeams.push("BYE");

  const n = currentTeams.length;
  const rounds = n - 1;
  const half = n / 2;

  for (let round = 0; round < rounds; round++) {
    const roundMatches: { home: string, away: string }[] = [];
    for (let i = 0; i < half; i++) {
      const home = currentTeams[i];
      const away = currentTeams[n - 1 - i];
      
      if (home !== "BYE" && away !== "BYE") {
        // Чередуем хозяев
        if (round % 2 === 0) {
          roundMatches.push({ home, away });
        } else {
          roundMatches.push({ home: away, away: home });
        }
      }
    }
    schedule.push(roundMatches);
    
    // Вращение массива (фиксируем [0], сдвигаем остальные)
    currentTeams.splice(1, 0, currentTeams.pop()!);
  }
  return schedule;
}