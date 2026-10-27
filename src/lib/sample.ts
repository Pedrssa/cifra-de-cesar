import { isShiftable } from './caesar.ts';

export interface SampleChar {
  index: number;
  char: string;
  letter: boolean;
}

export interface Sample {
  /** Total de caracteres visíveis (grafemas) do texto. */
  total: number;
  /** Índice do primeiro grafema da página exibida. */
  pageStart: number;
  items: SampleChar[];
}

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' })
    : null;

function* graphemes(text: string): Iterable<string> {
  if (segmenter) {
    for (const s of segmenter.segment(text)) yield s.segment;
  } else {
    yield* text;
  }
}

/**
 * Amostra animável: a última "página" de `pageSize` caracteres. Enquanto a
 * pessoa digita, as letras já exibidas ficam paradas e só a nova anima;
 * o resto do texto é convertido de imediato no resultado.
 */
export function sampleTail(text: string, pageSize: number): Sample {
  const ring: string[] = [];
  let total = 0;
  for (const g of graphemes(text)) {
    ring.push(g);
    if (ring.length > pageSize) ring.shift();
    total++;
  }
  if (total === 0) return { total: 0, pageStart: 0, items: [] };
  const pageStart = Math.floor((total - 1) / pageSize) * pageSize;
  const offset = total - ring.length;
  const items = ring.slice(pageStart - offset).map((char, i) => ({
    index: pageStart + i,
    char,
    letter: isShiftable(char),
  }));
  return { total, pageStart, items };
}
