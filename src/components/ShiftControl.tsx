import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { MAX_SHIFT, MIN_SHIFT, SHIFT_ERRORS, parseShiftInput, type Mode } from '../lib/caesar';

interface Props {
  shift: number;
  mode: Mode;
  onChange: (shift: number) => void;
}

const DIGITS = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9';
const TICKS = Array.from({ length: MAX_SHIFT + 1 }, (_, i) => i);

function Digit({ value, dim }: { value: number; dim?: boolean }) {
  return (
    <span className={`odo-digit${dim ? ' is-dim' : ''}`}>
      <span className="odo-reel" style={{ transform: `translateY(${-value * 10}%)` }}>
        {DIGITS}
      </span>
    </span>
  );
}

/** Indicador numérico com dígitos que rolam; o sinal mostra a direção do modo. */
function Odometer({ value, mode }: { value: number; mode: Mode }) {
  const tens = Math.floor(value / 10);
  return (
    <span className="odometer" aria-hidden="true" data-single={tens === 0 || undefined}>
      <span className="odo-sign">
        <span className={mode === 'encrypt' ? 'is-on' : ''}>+</span>
        <span className={mode === 'decrypt' ? 'is-on' : ''}>−</span>
      </span>
      <Digit value={tens} dim={tens === 0} />
      <Digit value={value % 10} />
    </span>
  );
}

export function ShiftControl({ shift, mode, onChange }: Props) {
  const id = useId();
  // O rascunho só vale enquanto o deslocamento for aquele em que foi digitado;
  // se o slider ou um exemplo mudar o valor, o campo volta a mostrar o número.
  const [draft, setDraft] = useState<{ text: string; base: number } | null>(null);
  const value = draft && draft.base === shift ? draft.text : String(shift);
  const parsed = parseShiftInput(value);
  const error = parsed.ok ? null : SHIFT_ERRORS[parsed.error];

  const commitDraft = (raw: string) => {
    const p = parseShiftInput(raw);
    setDraft({ text: raw, base: p.ok ? p.value : shift });
    if (p.ok) onChange(p.value);
  };

  const onFieldKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const next = Math.min(MAX_SHIFT, Math.max(MIN_SHIFT, shift + (e.key === 'ArrowUp' ? 1 : -1)));
    setDraft(null);
    onChange(next);
  };

  const fill = { '--p': shift / MAX_SHIFT } as CSSProperties;

  return (
    <div className="shift" style={fill}>
      <div className="shift-head">
        <label className="field-label" htmlFor={`${id}-range`}>
          Deslocamento
        </label>
        <Odometer value={shift} mode={mode} />
      </div>
      <div className="shift-row">
        <div className="range-wrap">
          <input
            id={`${id}-range`}
            className="range"
            type="range"
            min={MIN_SHIFT}
            max={MAX_SHIFT}
            step={1}
            value={shift}
            aria-valuetext={`${shift} ${shift === 1 ? 'posição' : 'posições'}`}
            onChange={(e) => onChange(Number(e.currentTarget.value))}
          />
          <div className="ticks" aria-hidden="true">
            {TICKS.map((t) => (
              <span
                key={t}
                className={`tick${t === shift ? ' is-active' : ''}${t % 5 === 0 ? ' is-major' : ''}`}
                style={{ '--i': t } as CSSProperties}
              />
            ))}
          </div>
        </div>
        <input
          id={`${id}-num`}
          className="num-field"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Deslocamento (número de 0 a 25)"
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint`}
          value={value}
          onChange={(e) => commitDraft(e.currentTarget.value)}
          onKeyDown={onFieldKey}
          onBlur={() => {
            if (!parsed.ok) setDraft(null);
          }}
        />
      </div>
      <p id={`${id}-hint`} className={`hint${error ? ' is-error' : ''}`} aria-live="polite">
        {error ? `${error} Mantendo ${shift}.` : 'Número inteiro de 0 a 25.'}
      </p>
    </div>
  );
}
