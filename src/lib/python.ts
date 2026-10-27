import source from '../../python/cifra.py?raw';

// Pyodide: Python compilado para WebAssembly. O código roda no próprio
// navegador; só o interpretador é baixado do CDN, nunca a mensagem enviada.
const PYODIDE_VERSION = '0.27.2';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type Decoder = (text: string, shift: number) => string;

interface PyProxyFn {
  (...args: unknown[]): unknown;
}

interface Pyodide {
  FS: { writeFile(path: string, data: string): void };
  pyimport(name: string): { decifrar: PyProxyFn };
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<Pyodide>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('pyodide-script'));
    };
    document.head.appendChild(script);
  });
}

let pending: Promise<Decoder> | null = null;

/** Carrega o Python uma única vez e devolve a função `decifrar` de cifra.py. */
export function loadPythonDecoder(): Promise<Decoder> {
  pending ??= (async () => {
    if (!window.loadPyodide) await loadScript(`${INDEX_URL}pyodide.js`);
    const pyodide = await window.loadPyodide!({ indexURL: INDEX_URL });
    // Importa como módulo (não executa como script): o bloco __main__ fica de fora.
    pyodide.FS.writeFile('/home/pyodide/cifra.py', source);
    const decifrar = pyodide.pyimport('cifra').decifrar;
    return (text: string, shift: number) => decifrar(text, shift) as string;
  })().catch((error) => {
    pending = null; // permite tentar de novo
    throw error;
  });
  return pending;
}
