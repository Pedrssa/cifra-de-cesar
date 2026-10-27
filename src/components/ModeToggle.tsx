import type { ReactElement } from 'react';
import type { Mode } from '../lib/caesar';
import { LockIcon, UnlockIcon } from './Icons';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const OPTIONS: { value: Mode; label: string; Icon: () => ReactElement }[] = [
  { value: 'encrypt', label: 'Criptografar', Icon: LockIcon },
  { value: 'decrypt', label: 'Descriptografar', Icon: UnlockIcon },
];

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <fieldset className="mode-toggle" data-mode={mode}>
      <legend className="sr-only">Modo</legend>
      <span className="mode-thumb" aria-hidden="true" />
      {OPTIONS.map(({ value, label, Icon }) => (
        <label key={value} className="mode-option">
          <input
            type="radio"
            name="mode"
            value={value}
            checked={mode === value}
            onChange={() => onChange(value)}
          />
          <Icon />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
