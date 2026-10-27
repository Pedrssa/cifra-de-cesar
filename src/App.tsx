import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CipherStage } from './components/CipherStage';
import { CopyButton } from './components/CopyButton';
import { HowItWorks } from './components/HowItWorks';
import { ArrowUpIcon, ClearIcon, SparkIcon } from './components/Icons';
import { ModeToggle } from './components/ModeToggle';
import { ShiftControl } from './components/ShiftControl';
import { caesar, type Mode } from './lib/caesar';
import { loadPythonDecoder, type Decoder } from './lib/python';
import { sampleTail } from './lib/sample';
import { useReducedMotion } from './motion/useReducedMotion';

type PythonState = { status: 'loading' | 'error' } | { status: 'ready'; decode: Decoder };

const MAX_LENGTH = 50_000;
const SAMPLE_SIZE = 24;

const EXAMPLES = [
  { text: 'Veni, vidi, vici.', shift: 3 },
  { text: 'ABC XYZ', shift: 3 },
  { text: 'Olá, Mundo! 123', shift: 3 },
  { text: 'Encontro na praça às 19h 🌙', shift: 7 },
  { text: 'Ave, César! Os que vão cifrar te saúdam.', shift: 13 },
];

export default function App() {
  const reduced = useReducedMotion();
  const ids = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const exampleIndex = useRef(0);

  const [mode, setMode] = useState<Mode>('encrypt');
  const [shift, setShift] = useState(3);
  const [text, setText] = useState('');

  // O resultado é síncrono: nunca fica atrás do texto, do modo ou do slider.
  // Criptografar roda em TypeScript; descriptografar chama decifrar() de python/cifra.py.
  const [python, setPython] = useState<PythonState>({ status: 'loading' });
  const startPython = useCallback(() => {
    setPython({ status: 'loading' });
    loadPythonDecoder().then(
      (decode) => setPython({ status: 'ready', decode }),
      () => setPython({ status: 'error' }),
    );
  }, []);
  useEffect(startPython, [startPython]);

  const result = useMemo(() => {
    if (mode === 'encrypt') return caesar(text, shift, mode);
    return python.status === 'ready' ? python.decode(text, shift) : '';
  }, [text, shift, mode, python]);
  // A visualização pode ficar um quadro atrás sem prejudicar a digitação.
  const deferredText = useDeferredValue(text);
  const sample = useMemo(() => sampleTail(deferredText, SAMPLE_SIZE), [deferredText]);

  const loadExample = () => {
    const ex = EXAMPLES[exampleIndex.current % EXAMPLES.length];
    exampleIndex.current++;
    setShift(ex.shift);
    // No modo descriptografar, o exemplo chega cifrado para o resultado ser legível.
    setText(mode === 'encrypt' ? ex.text : caesar(ex.text, ex.shift, 'encrypt'));
  };

  const clear = () => {
    setText('');
    inputRef.current?.focus();
  };

  const isEncrypt = mode === 'encrypt';
  const atLimit = text.length >= MAX_LENGTH;

  return (
    <>
      <div className="atmosphere" aria-hidden="true">
        <span className="orb orb-blue" />
        <span className="orb orb-violet" />
        <span className="orb orb-magenta" />
      </div>

      <div className="page">
        <header className="hero">
          <h1>Cifra de César</h1>
          <p className="subtitle">Desloque letras. Transforme mensagens.</p>
        </header>

        <main className="card" data-mode={mode} data-python={python.status}>
          <div className="controls">
            <ModeToggle mode={mode} onChange={setMode} />
            <ShiftControl shift={shift} mode={mode} onChange={setShift} />
          </div>

          <div className="panels">
            <section className="panel" aria-labelledby={`${ids}-in-title`}>
              <div className="panel-head">
                <h2 id={`${ids}-in-title`} className="section-title swap-title">
                  <label htmlFor={`${ids}-in`}>
                    <span className={isEncrypt ? 'is-on' : ''}>Mensagem original</span>
                    <span className={isEncrypt ? '' : 'is-on'}>Mensagem cifrada</span>
                  </label>
                </h2>
                <span className={`counter${atLimit ? ' is-limit' : ''}`} id={`${ids}-count`}>
                  {sample.total.toLocaleString('pt-BR')} {sample.total === 1 ? 'caractere' : 'caracteres'}
                  {atLimit && ' · limite atingido'}
                </span>
              </div>
              <textarea
                id={`${ids}-in`}
                ref={inputRef}
                className="text-area"
                value={text}
                maxLength={MAX_LENGTH}
                spellCheck={false}
                placeholder={isEncrypt ? 'Digite ou cole sua mensagem…' : 'Cole a mensagem cifrada…'}
                aria-describedby={`${ids}-count ${ids}-note`}
                onChange={(e) => setText(e.currentTarget.value)}
              />
              <p className="note" id={`${ids}-note`}>
                Apenas letras de A a Z são deslocadas; acentos e outros caracteres são preservados.
              </p>
              <div className="actions">
                <button type="button" className="btn" onClick={loadExample}>
                  <SparkIcon />
                  Experimentar exemplo
                </button>
                <button type="button" className="btn btn-quiet" onClick={clear} disabled={text === ''}>
                  <ClearIcon />
                  Limpar
                </button>
              </div>
            </section>

            <span className="flow-badge" aria-hidden="true">
              <ArrowUpIcon />
            </span>

            <section className="panel panel-result" aria-labelledby={`${ids}-out-title`}>
              <div className="panel-head">
                <h2 id={`${ids}-out-title`} className="section-title swap-title">
                  <label htmlFor={`${ids}-out`}>
                    <span className={isEncrypt ? 'is-on' : ''}>Resultado cifrado</span>
                    <span className={isEncrypt ? '' : 'is-on'}>Resultado decifrado</span>
                  </label>
                </h2>
              </div>
              <textarea
                id={`${ids}-out`}
                className="text-area text-result"
                value={result}
                readOnly
                spellCheck={false}
                placeholder={
                  isEncrypt || python.status === 'ready'
                    ? 'O resultado aparece aqui, automaticamente.'
                    : python.status === 'loading'
                      ? 'Carregando o Python para descriptografar…'
                      : 'O Python não carregou.'
                }
              />
              {isEncrypt ? (
                <p className="note">Atualizado automaticamente, só no seu navegador.</p>
              ) : python.status === 'error' ? (
                <p className="note is-error" role="alert">
                  Não foi possível carregar o Python. Verifique a conexão.{' '}
                  <button type="button" className="link-btn" onClick={startPython}>
                    Tentar de novo
                  </button>
                </p>
              ) : (
                <p className="note">
                  <span className={`py-dot is-${python.status}`} aria-hidden="true" />
                  {python.status === 'ready'
                    ? 'Decodificado em Python (cifra.py), no seu navegador.'
                    : 'Carregando Python (só na primeira vez)…'}
                </p>
              )}
              <div className="actions">
                <CopyButton text={result} />
                <button
                  type="button"
                  className="btn"
                  onClick={() => setText(result)}
                  disabled={result === '' || result === text}
                >
                  <ArrowUpIcon />
                  Usar como entrada
                </button>
              </div>
            </section>
          </div>

          <CipherStage sample={sample} shift={shift} mode={mode} reduced={reduced} />
        </main>

        <footer className="footer">
          <HowItWorks />
          <p className="disclaimer">A cifra de César é um recurso educativo e não protege informações sensíveis.</p>
          <p className="privacy">Nenhuma mensagem sai do seu navegador.</p>
        </footer>
      </div>
    </>
  );
}
