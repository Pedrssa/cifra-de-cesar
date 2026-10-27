// Junta demo/index.html, o JS e o CSS num único arquivo autocontido,
// para o preview abrir direto do repositório (htmlpreview.github.io).
// O bundle é IIFE (DEMO=1 no vite.config.ts) e entra como script clássico.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const dir = new URL('../demo/', import.meta.url);
const read = (file) => readFileSync(new URL(file, dir), 'utf8');
let html = read('index.html');

const SCRIPT = /<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>\s*/;
const STYLE = /<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/;

const jsFile = html.match(SCRIPT)?.[1];
const cssFile = html.match(STYLE)?.[1];
if (!jsFile) throw new Error('index.html sem o script esperado');

// O script vai para o fim do <body>: o #root já existe quando ele roda.
const js = read(jsFile).replace(/<\/script/gi, '<\\/script');
html = html
  .replace(SCRIPT, '')
  .replace(STYLE, () => (cssFile ? `<style>${read(cssFile)}</style>` : ''))
  .replace('</body>', () => `<script>${js}</script>\n</body>`);

if (html.includes('assets/')) throw new Error('ainda há referências a assets/');
rmSync(new URL('assets/', dir), { recursive: true, force: true });
writeFileSync(new URL('index.html', dir), html);
console.log(`demo/index.html: ${(html.length / 1024).toFixed(0)} KB, autocontido`);
