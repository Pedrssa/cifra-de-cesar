import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { ALPHABET, mod, shiftLetter, type Mode } from '../lib/caesar';
import type { Sample } from '../lib/sample';
import { durationForSteps, glide } from '../motion/glide';
import { ArrowUpIcon } from './Icons';

interface Props {
  sample: Sample;
  shift: number;
  mode: Mode;
  reduced: boolean;
}

// Três cópias do alfabeto: a partir da cópia do meio qualquer deslocamento
// de -25 a +25 cabe na faixa, e a volta Z → A aparece de forma contínua.
const COPIES = 3;
const CELLS = ALPHABET.length * COPIES;
const STRIP = ALPHABET.repeat(COPIES).split('');
const REEL_UPPER = STRIP.join('\n');
const REEL_LOWER = REEL_UPPER.toLowerCase();

const reelY = (cell: number) => `translateY(${(-cell / CELLS) * 100}%)`;

/** Uma letra da amostra: um rolo vertical que percorre o deslocamento. */
function LetterTile({ char, shift, mode, reduced }: { char: string; shift: number; mode: Mode; reduced: boolean }) {
  const reel = useRef<HTMLSpanElement>(null);
  const prev = useRef<{ char: string; target: number } | null>(null);
  const start = ALPHABET.length + char.toUpperCase().charCodeAt(0) - 65;
  const target = start + (mode === 'encrypt' ? shift : -shift);

  useLayoutEffect(() => {
    const el = reel.current;
    if (!el) return;
    const last = prev.current;
    prev.current = { char, target };
    if (!last || last.char !== char) {
      // Letra nova: parte da origem e percorre todo o deslocamento.
      glide(el, reelY(target), { from: reelY(start), duration: durationForSteps(target - start), reduced });
    } else if (last.target !== target) {
      // Mudou deslocamento ou modo: redireciona a partir de onde está.
      glide(el, reelY(target), { duration: durationForSteps(target - last.target), reduced });
    }
  }, [char, start, target, reduced]);

  const isLower = char !== char.toUpperCase();
  return (
    <span className="tile is-letter">
      <span className="tile-src">{char}</span>
      <span className="tile-window">
        <span ref={reel} className="tile-reel" style={{ transform: reelY(target) }}>
          {isLower ? REEL_LOWER : REEL_UPPER}
        </span>
      </span>
    </span>
  );
}

function KeptTile({ char }: { char: string }) {
  const isSpace = /^\s$/u.test(char);
  return (
    <span className={`tile is-kept${isSpace ? ' is-space' : ''}`}>
      <span className="tile-src">{isSpace ? '␣' : char}</span>
      <span className="tile-window">
        <span className="tile-static">{isSpace ? '␣' : char}</span>
      </span>
    </span>
  );
}

export function CipherStage({ sample, shift, mode, reduced }: Props) {
  const letters = sample.items.filter((i) => i.letter);
  // Coluna = posição da letra no alfabeto original (faixa de cima).
  const columnOf = (ch: string) => {
    const i = ch.toUpperCase().charCodeAt(0) - 65;
    return mode === 'encrypt' ? i : mod(i - shift, 26);
  };
  const used = new Set(letters.map((l) => columnOf(l.char)));
  const lastLetter = letters.at(-1);
  const active = lastLetter ? columnOf(lastLetter.char) : 0;
  const stripX = `translateX(${(-(ALPHABET.length + shift) / CELLS) * 100}%)`;
  const signed = mode === 'encrypt' ? `+${shift}` : `−${shift}`;

  const exampleFrom = ALPHABET[active];
  const exampleTo = shiftLetter(exampleFrom, shift);
  const srFrom = mode === 'encrypt' ? exampleFrom : exampleTo;
  const srTo = mode === 'encrypt' ? exampleTo : exampleFrom;

  return (
    <section className="stage" data-mode={mode} aria-labelledby="stage-title">
      <div className="stage-head">
        <h2 id="stage-title" className="section-title">
          Visualização
        </h2>
        <p className="stage-legend">
          <span className="legend-dir" aria-hidden="true">
            <ArrowUpIcon />
          </span>
          {mode === 'encrypt' ? 'Original → deslocado' : 'Deslocado → original'}
        </p>
      </div>

      <p className="sr-only">
        {`Com deslocamento ${shift}, no modo ${mode === 'encrypt' ? 'criptografar' : 'descriptografar'}, ${srFrom} vira ${srTo}.`}
      </p>

      <div className="strips" aria-hidden="true" style={{ '--col': active } as CSSProperties}>
        <div className="strip-label strip-label-top">
          <span>Original</span>
          <span className="strip-role">{mode === 'encrypt' ? 'entrada' : 'saída'}</span>
        </div>
        <div className="strip-body">
          <div className="lens">
            <span className="lens-arrow">
              <ArrowUpIcon />
            </span>
          </div>
          <div className="strip strip-plain">
            {STRIP.slice(0, 26).map((ch, i) => (
              <span key={ch} className={`cell${used.has(i) ? ' is-used' : ''}${i === active ? ' is-active' : ''}`}>
                {ch}
              </span>
            ))}
          </div>
          <div className="connectors">
            {STRIP.slice(0, 26).map((ch, i) => (
              <span key={ch} className={i === active ? 'is-active' : ''} />
            ))}
          </div>
          <div className="strip strip-shifted">
            <div className="strip-track" style={{ transform: stripX }}>
              {STRIP.map((ch, i) => (
                <span key={i} className={`cell${i % 26 === 0 ? ' is-wrap' : ''}`}>
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-label strip-label-bottom">
          <span>
            Deslocado <span className="strip-shift">{signed}</span>
          </span>
          <span className="strip-role">{mode === 'encrypt' ? 'saída' : 'entrada'}</span>
        </div>
      </div>

      <div className="transform-area" aria-hidden="true">
        {sample.total === 0 ? (
          <p className="stage-empty">Digite uma mensagem para ver cada letra percorrer o deslocamento.</p>
        ) : (
          <>
            <div className="tiles" key={sample.pageStart}>
              {sample.items.map((item) =>
                item.letter ? (
                  <LetterTile key={item.index} char={item.char} shift={shift} mode={mode} reduced={reduced} />
                ) : (
                  <KeptTile key={item.index} char={item.char} />
                ),
              )}
            </div>
            {sample.total > sample.items.length && (
              <p className="stage-note">
                Animando os caracteres {(sample.pageStart + 1).toLocaleString('pt-BR')}–
                {sample.total.toLocaleString('pt-BR')}; os anteriores já estão convertidos no resultado.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
