export class SeededRNG {
  private m_w: number;
  private m_z: number;
  private mask: number;

  constructor(seed: number) {
    this.m_w = (123456789 + seed) & 0xffffffff;
    this.m_z = (987654321 - seed) & 0xffffffff;
    this.mask = 0xffffffff;
  }

  // Возвращает число от 0 до 1
  next() {
    this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
    this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
    let result = ((this.m_z << 16) + this.m_w) & this.mask;
    result /= 4294967296;
    return result + 0.5;
  }

  // Возвращает true/false
  bool(chance: number = 0.5) {
    return this.next() < chance;
  }

  // Возвращает целое число min-max
  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}