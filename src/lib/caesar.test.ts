import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { caesar, parseShiftInput } from './caesar.ts';
import { sampleTail } from './sample.ts';

describe('caesar', () => {
  it('desloca e faz a volta circular do alfabeto', () => {
    assert.equal(caesar('ABC XYZ', 3, 'encrypt'), 'DEF ABC');
    assert.equal(caesar('xyz', 3, 'encrypt'), 'abc');
  });

  it('preserva acentos, pontuação e números', () => {
    assert.equal(caesar('Olá, Mundo! 123', 3, 'encrypt'), 'Roá, Pxqgr! 123');
  });

  it('preserva letras acentuadas decompostas (NFD)', () => {
    assert.equal(caesar('Olá', 3, 'encrypt'), 'Roá');
  });

  it('deslocamento 0 preserva o texto', () => {
    assert.equal(caesar('Qualquer Coisa!', 0, 'encrypt'), 'Qualquer Coisa!');
    assert.equal(caesar('Qualquer Coisa!', 0, 'decrypt'), 'Qualquer Coisa!');
  });

  it('descriptografar aplica o inverso', () => {
    assert.equal(caesar('DEF ABC', 3, 'decrypt'), 'ABC XYZ');
  });

  it('ida e volta recupera o original para todos os deslocamentos', () => {
    const original = 'Ave, César! 🌅 Os que vão cifrar te saúdam — 2026 👨‍👩‍👧 zZ';
    for (let s = 0; s <= 25; s++) {
      assert.equal(caesar(caesar(original, s, 'encrypt'), s, 'decrypt'), original);
    }
  });

  it('não altera emojis nem quebra pares substitutos', () => {
    assert.equal(caesar('🙂a😀', 1, 'encrypt'), '🙂b😀');
  });

  it('lida com vazio e textos longos', () => {
    assert.equal(caesar('', 5, 'encrypt'), '');
    const long = 'Lorem ipsum dolor sit amet. '.repeat(4000);
    const enc = caesar(long, 11, 'encrypt');
    assert.equal(enc.length, long.length);
    assert.equal(caesar(enc, 11, 'decrypt'), long);
  });
});

describe('parseShiftInput', () => {
  const cases: [string, unknown][] = [
    ['3', { ok: true, value: 3 }],
    [' 25 ', { ok: true, value: 25 }],
    ['0', { ok: true, value: 0 }],
    ['007', { ok: true, value: 7 }],
    ['', { ok: false, error: 'empty' }],
    ['   ', { ok: false, error: 'empty' }],
    ['3.5', { ok: false, error: 'decimal' }],
    ['3,5', { ok: false, error: 'decimal' }],
    ['26', { ok: false, error: 'out-of-range' }],
    ['-1', { ok: false, error: 'out-of-range' }],
    ['abc', { ok: false, error: 'not-number' }],
    ['1e1', { ok: false, error: 'not-number' }],
  ];
  for (const [raw, expected] of cases) {
    it(JSON.stringify(raw), () => assert.deepEqual(parseShiftInput(raw), expected));
  }
});

describe('sampleTail', () => {
  it('pagina pelo fim e conta grafemas', () => {
    const s = sampleTail('abcdefghij', 4);
    assert.equal(s.total, 10);
    assert.equal(s.pageStart, 8);
    assert.equal(s.items.map((i) => i.char).join(''), 'ij');
  });

  it('trata emoji composto como um caractere preservado', () => {
    const s = sampleTail('a👨‍👩‍👧', 8);
    assert.equal(s.total, 2);
    assert.equal(s.items[1].letter, false);
  });
});
