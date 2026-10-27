export type Mode = 'encrypt' | 'decrypt';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const ALPHABET_SIZE = 26;
export const MIN_SHIFT = 0;
export const MAX_SHIFT = 25;

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Deslocamento efetivo para o modo: descriptografar aplica o inverso. */
export function directedShift(shift: number, mode: Mode): number {
  const s = mod(Math.trunc(shift), ALPHABET_SIZE);
  return mode === 'encrypt' ? s : mod(-s, ALPHABET_SIZE);
}

/** Desloca um único caractere A–Z/a–z; qualquer outro volta inalterado. */
export function shiftLetter(ch: string, shift: number): string {
  if (ch.length !== 1) return ch;
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(65 + mod(code - 65 + shift, 26));
  if (code >= 97 && code <= 122) return String.fromCharCode(97 + mod(code - 97 + shift, 26));
  return ch;
}

// Uma letra seguida de marca combinante (ex.: "á", um "á" decomposto)
// é uma letra acentuada e, como "á" pré-composto, é preservada.
const SHIFTABLE = /[A-Za-z](?!\p{M})/gu;

export function caesar(text: string, shift: number, mode: Mode): string {
  const s = directedShift(shift, mode);
  if (s === 0 || text === '') return text;
  return text.replace(SHIFTABLE, (ch) => shiftLetter(ch, s));
}

/** Um grafema é deslocável se for exatamente uma letra A–Z ou a–z. */
export function isShiftable(grapheme: string): boolean {
  return grapheme.length === 1 && /[A-Za-z]/.test(grapheme);
}

export type ShiftParseError = 'empty' | 'decimal' | 'not-number' | 'out-of-range';
export type ShiftParse = { ok: true; value: number } | { ok: false; error: ShiftParseError };

export function parseShiftInput(raw: string): ShiftParse {
  const t = raw.trim();
  if (t === '') return { ok: false, error: 'empty' };
  if (/^[+-]?\d+$/.test(t)) {
    const n = Number(t);
    return n < MIN_SHIFT || n > MAX_SHIFT ? { ok: false, error: 'out-of-range' } : { ok: true, value: n };
  }
  if (/^[+-]?(\d+[.,]\d*|[.,]\d+)$/.test(t)) return { ok: false, error: 'decimal' };
  return { ok: false, error: 'not-number' };
}

export const SHIFT_ERRORS: Record<ShiftParseError, string> = {
  empty: 'Informe um número de 0 a 25.',
  decimal: 'Use um número inteiro, sem casas decimais.',
  'not-number': 'Digite apenas números.',
  'out-of-range': 'O deslocamento vai de 0 a 25.',
};
