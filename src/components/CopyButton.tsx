import { useEffect, useRef, useState, type ReactElement } from 'react';
import { copyText } from '../lib/clipboard';
import { AlertIcon, CheckIcon, CopyIcon } from './Icons';

type Status = 'idle' | 'copied' | 'error';

const FEEDBACK_MS = 1800;

const STATES: { key: Status; label: string; Icon: () => ReactElement }[] = [
  { key: 'idle', label: 'Copiar resultado', Icon: CopyIcon },
  { key: 'copied', label: 'Copiado', Icon: CheckIcon },
  { key: 'error', label: 'Não foi possível copiar', Icon: AlertIcon },
];

export function CopyButton({ text }: { text: string }) {
  // A confirmação pertence ao texto copiado: se o resultado mudar, ela deixa de valer.
  const [feedback, setFeedback] = useState<{ status: Status; text: string } | null>(null);
  const status: Status = feedback && feedback.text === text ? feedback.status : 'idle';
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    window.clearTimeout(timer.current);
    let next: Status;
    try {
      await copyText(text);
      next = 'copied';
    } catch {
      next = 'error';
    }
    setFeedback({ status: next, text });
    timer.current = window.setTimeout(() => setFeedback(null), next === 'error' ? 3200 : FEEDBACK_MS);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary copy-btn"
        data-status={status}
        onClick={onClick}
        disabled={text === ''}
      >
        {/* Os três rótulos ocupam a mesma célula: a largura nunca muda. */}
        {STATES.map(({ key, label, Icon }) => (
          <span key={key} className="copy-face" data-face={key} aria-hidden={status !== key}>
            <Icon />
            {label}
          </span>
        ))}
      </button>
      <span className="sr-only" role="status">
        {status === 'copied' ? 'Resultado copiado.' : status === 'error' ? 'Não foi possível copiar. Selecione o resultado e copie manualmente.' : ''}
      </span>
    </>
  );
}
