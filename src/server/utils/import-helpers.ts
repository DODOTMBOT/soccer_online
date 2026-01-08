import { Position } from "@prisma/client";

function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860281);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export function generateHiddenStats(seedString: string, basePower: number) {
  const seed = cyrb128(seedString);
  const rand = mulberry32(seed);

  const minPot = Math.min(99, basePower);
  const potential = Math.floor(rand() * (99 - minPot + 1)) + minPot;
  const injuryProne = Math.floor(rand() * 20) + 1;
  const formIndex = Math.floor(rand() * 12);

  return { potential, injuryProne, formIndex };
}

export function mapPosition(pos: string): Position {
  if (!pos) return "CM";
  const p = pos.toUpperCase().trim();

  if (p === 'GK' || p === 'GOALKEEPER') return 'GK';
  if (['LB', 'LWB', 'LEFT BACK', 'LD'].includes(p)) return 'LD'; 
  if (['RB', 'RWB', 'RIGHT BACK', 'RD'].includes(p)) return 'RD'; 
  if (['CB', 'SW', 'CENTER BACK', 'CD', 'LIBERO'].includes(p)) return 'CD';

  if (['CDM', 'DM', 'CM', 'CAM', 'AM', 'MIDFIELDER'].includes(p)) return 'CM';
  if (['LM', 'LW', 'LEFT WINGER', 'AML', 'LEFT MIDFIELD'].includes(p)) return 'LM'; 
  if (['RM', 'RW', 'RIGHT WINGER', 'AMR', 'RIGHT MIDFIELD'].includes(p)) return 'RM';

  if (['SS', 'CF', 'CENTER FORWARD', 'SECOND STRIKER'].includes(p)) return 'CF';
  if (['ST', 'STRIKER', 'FORWARD'].includes(p)) return 'ST';
  if (['LF'].includes(p)) return 'LF';
  if (['RF'].includes(p)) return 'RF';
  
  return 'CM';
}