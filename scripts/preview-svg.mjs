// Gera docs/preview.svg: o app em movimento para o README (SMIL, sem JavaScript).
// Uso: node scripts/preview-svg.mjs
import { writeFileSync } from 'node:fs';
import { caesar, shiftLetter } from '../src/lib/caesar.ts';

const MESSAGE = 'Veni, vidi, vici.';
const SHIFT = 3;
const CIPHER = caesar(MESSAGE, SHIFT, 'encrypt');
const DUR = '12s';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const C = {
  bg: '#06060d',
  card: '#11101f',
  sunken: '#0a0915',
  line: '#26243b',
  text: '#f3f2fa',
  muted: '#aeaacb',
  faint: '#8c88ad',
  blue: '#5b8cff',
  violet: '#9b7bff',
  magenta: '#ec5fb4',
  green: '#7ee2b8',
};

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";
const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Linha do tempo (fração do ciclo):
// 0–.07 parado · .07–.22 desloca +3 e as letras rolam · .48–.53 troca para descriptografar
// .53–.70 as letras voltam · .92–1 a faixa retorna ao zero e o ciclo recomeça.
const EASE = '0.22 1 0.36 1';
const splines = (n) => Array(n).fill(EASE).join(';');

function anim(attr, values, keyTimes, extra = '') {
  return `<animate attributeName="${attr}" values="${values.join(';')}" keyTimes="${keyTimes.join(';')}" dur="${DUR}" repeatCount="indefinite"${extra}/>`;
}

function move(values, keyTimes, begin = '0s') {
  return `<animateTransform attributeName="transform" type="translate" values="${values.join(';')}" keyTimes="${keyTimes.join(';')}" calcMode="spline" keySplines="${splines(values.length - 1)}" dur="${DUR}" begin="${begin}" repeatCount="indefinite"/>`;
}

// Visível só na fase de criptografar / descriptografar.
const ENC = (attr = 'opacity') => anim(attr, [1, 1, 0, 0, 1], [0, 0.48, 0.53, 0.96, 1]);
const DEC = (attr = 'opacity') => anim(attr, [0, 0, 1, 1, 0], [0, 0.48, 0.53, 0.96, 1]);

const W = 860;
const H = 560;
const parts = [];

parts.push(`<defs>
  <radialGradient id="g1" cx="15%" cy="0%" r="70%"><stop offset="0" stop-color="${C.blue}" stop-opacity=".32"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="95%" cy="20%" r="60%"><stop offset="0" stop-color="${C.violet}" stop-opacity=".26"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g3" cx="40%" cy="110%" r="60%"><stop offset="0" stop-color="${C.magenta}" stop-opacity=".18"/><stop offset="1" stop-color="${C.magenta}" stop-opacity="0"/></radialGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".7"/><stop offset=".45" stop-color="${C.violet}" stop-opacity=".35"/><stop offset=".8" stop-color="${C.magenta}" stop-opacity=".1"/></linearGradient>
  <linearGradient id="thumb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".07"/></linearGradient>
  <linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".3"/><stop offset=".5" stop-color="${C.violet}" stop-opacity=".16"/><stop offset="1" stop-color="${C.magenta}" stop-opacity=".28"/></linearGradient>
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".14"/><stop offset="1" stop-color="${C.violet}" stop-opacity=".1"/></linearGradient>
  <linearGradient id="fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff"/><stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="reelMask" maskUnits="userSpaceOnUse" x="0" y="0" width="38" height="46"><rect width="38" height="46" fill="url(#fadeV)"/></mask>
  <clipPath id="stripClip"><rect x="66" y="300" width="728" height="34"/></clipPath>
</defs>`);

// Fundo com iluminação lenta
parts.push(`<rect width="${W}" height="${H}" rx="18" fill="${C.bg}"/>
<g><rect width="${W}" height="${H}" rx="18" fill="url(#g1)"/>${anim('opacity', [0.7, 1, 0.7], [0, 0.5, 1])}</g>
<rect width="${W}" height="${H}" rx="18" fill="url(#g2)"/>
<rect width="${W}" height="${H}" rx="18" fill="url(#g3)"/>`);

// Cartão
parts.push(`<rect x="20" y="20" width="820" height="520" rx="22" fill="${C.card}" fill-opacity=".9" stroke="${C.line}"/>
<rect x="20" y="20" width="820" height="520" rx="22" fill="none" stroke="url(#edge)"/>`);

// Cabeçalho
parts.push(`<text x="48" y="68" fill="${C.text}" font-family="${SANS}" font-size="28" font-weight="700" letter-spacing="-0.8">Cifra de César</text>
<text x="48" y="94" fill="${C.muted}" font-family="${SANS}" font-size="14">Desloque letras. Transforme mensagens.</text>`);

// Alternância de modo
const TX = 560;
parts.push(`<rect x="${TX}" y="46" width="252" height="40" rx="12" fill="${C.sunken}" stroke="${C.line}"/>
<g><rect x="${TX + 4}" y="50" width="122" height="32" rx="9" fill="url(#thumb)" stroke="#fff" stroke-opacity=".08"/>
${move(['0 0', '0 0', '122 0', '122 0', '0 0'], [0, 0.48, 0.53, 0.96, 1])}</g>
<g font-family="${SANS}" font-size="13" font-weight="600" text-anchor="middle">
  <text x="${TX + 65}" y="71" fill="${C.text}">Criptografar${anim('fill', [C.text, C.text, C.faint, C.faint, C.text], [0, 0.48, 0.53, 0.96, 1])}</text>
  <text x="${TX + 187}" y="71" fill="${C.faint}">Descriptografar${anim('fill', [C.faint, C.faint, C.text, C.text, C.faint], [0, 0.48, 0.53, 0.96, 1])}</text>
</g>`);

// Painéis de entrada e resultado
function panel(x, labels, texts, note) {
  return `<rect x="${x}" y="116" width="372" height="96" rx="14" fill="${C.sunken}" stroke="${C.line}"/>
<g font-family="${SANS}">
  <g>${ENC()}<text x="${x + 18}" y="142" fill="${C.muted}" font-size="12" font-weight="600">${labels[0]}</text></g>
  <g opacity="0">${DEC()}<text x="${x + 18}" y="142" fill="${C.muted}" font-size="12" font-weight="600">${labels[1]}</text></g>
  ${texts}
  ${note}
</g>`;
}

const txt = (x, s, color = C.text) =>
  `<text x="${x + 18}" y="180" fill="${color}" font-size="19" font-family="${SANS}">${esc(s)}</text>`;

parts.push(
  panel(
    48,
    ['Mensagem original', 'Mensagem cifrada'],
    `<g>${ENC()}${txt(48, MESSAGE)}</g><g opacity="0">${DEC()}${txt(48, CIPHER)}</g>`,
    '',
  ),
);
parts.push(
  panel(
    440,
    ['Resultado cifrado', 'Resultado decifrado'],
    // Com deslocamento 0 o resultado é o próprio texto; ao chegar em 3, vira a cifra.
    `<g>${anim('opacity', [1, 1, 0, 0, 1], [0, 0.08, 0.16, 0.99, 1])}${txt(440, MESSAGE, C.muted)}</g>
     <g opacity="0">${anim('opacity', [0, 0, 1, 1, 0, 0], [0, 0.1, 0.18, 0.48, 0.53, 1])}${txt(440, CIPHER)}</g>
     <g opacity="0">${DEC()}${txt(440, MESSAGE)}</g>`,
    `<g opacity="0">${DEC()}<circle cx="${440 + 22}" cy="199" r="3" fill="${C.green}"/><text x="${440 + 31}" y="203" fill="${C.faint}" font-size="11">decodificado em Python (cifra.py)</text></g>`,
  ),
);

// Faixas de alfabeto
const SX = 66;
const CW = 28;
parts.push(`<rect x="48" y="232" width="764" height="128" rx="14" fill="${C.sunken}" stroke="${C.line}"/>
<text x="66" y="252" fill="${C.faint}" font-family="${SANS}" font-size="11">Original</text>
<g font-family="${SANS}" font-size="11" text-anchor="end">
  <text x="794" y="252" fill="${C.faint}">deslocamento</text>
</g>
<g font-family="${SANS}" font-size="20" font-weight="700" text-anchor="end">
  <g>${anim('opacity', [1, 1, 0, 0, 1], [0, 0.08, 0.14, 0.95, 1])}<text x="702" y="255" fill="${C.violet}">+0</text></g>
  <g opacity="0">${anim('opacity', [0, 0, 1, 1, 0, 0], [0, 0.08, 0.14, 0.48, 0.53, 1])}<text x="702" y="255" fill="${C.violet}">+3</text></g>
  <g opacity="0">${anim('opacity', [0, 0, 1, 1, 0], [0, 0.48, 0.53, 0.95, 1])}<text x="702" y="255" fill="${C.magenta}">−3</text></g>
</g>`);

// Lente na coluna da letra V
const LENS_COL = ALPHA.indexOf('V');
parts.push(`<rect x="${SX + LENS_COL * CW + 1}" y="262" width="${CW - 2}" height="74" rx="7" fill="url(#lens)" stroke="#a9bcff" stroke-opacity=".5"/>`);

parts.push(
  `<g font-family="${MONO}" font-size="15" font-weight="500" text-anchor="middle">` +
    [...ALPHA]
      .map(
        (ch, i) =>
          `<text x="${SX + i * CW + CW / 2}" y="286" fill="${i === LENS_COL ? '#fff' : C.muted}"${i === LENS_COL ? ' font-weight="700"' : ''}>${ch}</text>`,
      )
      .join('') +
    '</g>',
);

// Conectores; a seta da lente inverte com o modo
parts.push(
  '<g stroke="#fff" stroke-opacity=".1">' +
    [...ALPHA]
      .map((_, i) => (i === LENS_COL ? '' : `<line x1="${SX + i * CW + CW / 2}" y1="294" x2="${SX + i * CW + CW / 2}" y2="304"/>`))
      .join('') +
    '</g>',
);
const ax = SX + LENS_COL * CW + CW / 2;
parts.push(`<g>
  <path d="M${ax} 293 v11 M${ax - 4} 300 l4 4 l4 -4" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <animateTransform attributeName="transform" type="rotate" values="0 ${ax} 298.5;0 ${ax} 298.5;180 ${ax} 298.5;180 ${ax} 298.5;0 ${ax} 298.5" keyTimes="0;0.48;0.53;0.96;1" calcMode="spline" keySplines="${splines(4)}" dur="${DUR}" repeatCount="indefinite"/>
</g>`);

// Faixa deslocada: três cópias do alfabeto deslizando
const strip = ALPHA.repeat(3);
const base = -26 * CW;
parts.push(
  `<g clip-path="url(#stripClip)"><g font-family="${MONO}" font-size="15" font-weight="500" text-anchor="middle">` +
    `<g>${move([`${base} 0`, `${base} 0`, `${base - SHIFT * CW} 0`, `${base - SHIFT * CW} 0`, `${base} 0`], [0, 0.07, 0.22, 0.92, 1])}` +
    [...strip]
      .map(
        (ch, i) =>
          `<text x="${SX + i * CW + CW / 2}" y="324" fill="#cfcaf0">${ch}</text>` +
          (i % 26 === 0 ? `<line x1="${SX + i * CW}" y1="308" x2="${SX + i * CW}" y2="330" stroke="${C.magenta}" stroke-opacity=".5"/>` : ''),
      )
      .join('') +
    '</g></g></g>',
);
parts.push(`<text x="66" y="350" fill="${C.faint}" font-family="${SANS}" font-size="11">Deslocado</text>`);

// Letras em transformação
const TW = 38;
const GAP = 6;
const TH = 46;
const chars = [...MESSAGE];
const tx0 = (W - (chars.length * (TW + GAP) - GAP)) / 2;
chars.forEach((ch, i) => {
  const x = tx0 + i * (TW + GAP);
  const letter = /[A-Za-z]/.test(ch);
  const cipher = shiftLetter(ch, SHIFT);
  const label = ch === ' ' ? '␣' : esc(ch);
  parts.push(`<g font-family="${MONO}" text-anchor="middle">
  <g>${ENC()}<text x="${x + TW / 2}" y="394" fill="${C.faint}" font-size="12">${label}</text></g>
  <g opacity="0">${DEC()}<text x="${x + TW / 2}" y="394" fill="${C.faint}" font-size="12">${letter ? cipher : label}</text></g>
  <rect x="${x}" y="402" width="${TW}" height="${TH}" rx="10" fill="${letter ? 'url(#tile)' : '#fff'}" fill-opacity="${letter ? 1 : 0.04}" stroke="${letter ? C.violet : '#fff'}" stroke-opacity="${letter ? 0.3 : 0.08}"/>`);
  if (letter) {
    // Rolo com a letra e as próximas SHIFT posições; recortado pela janela do bloco.
    const reel = Array.from({ length: SHIFT + 1 }, (_, k) => shiftLetter(ch, k));
    const delay = (i * 0.045).toFixed(3);
    parts.push(`<svg x="${x}" y="402" width="${TW}" height="${TH}" overflow="hidden"><g mask="url(#reelMask)"><g>
    ${move(['0 0', '0 0', `0 ${-SHIFT * TH}`, `0 ${-SHIFT * TH}`, '0 0', '0 0'], [0, 0.07, 0.22, 0.53, 0.7, 1], `${delay}s`)}
    ${reel.map((r, k) => `<text x="${TW / 2}" y="${31 + k * TH}" fill="#fff" font-size="22" font-weight="600">${r}</text>`).join('')}
  </g></g></svg>`);
  } else {
    parts.push(
      `<text x="${x + TW / 2}" y="433" fill="${ch === ' ' ? '#ffffff30' : C.muted}" font-size="20" font-weight="600">${label}</text>`,
    );
  }
  parts.push('</g>');
});

// Rodapé
parts.push(`<text x="${W / 2}" y="494" fill="${C.faint}" font-family="${SANS}" font-size="12" text-anchor="middle">Apenas letras de A a Z são deslocadas; acentos e outros caracteres são preservados.</text>
<text x="${W / 2}" y="516" fill="${C.faint}" fill-opacity=".8" font-family="${SANS}" font-size="11" text-anchor="middle">React + TypeScript · descriptografia em Python via Pyodide · tudo no navegador</text>`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Prévia animada da Cifra de César: ${esc(MESSAGE)} vira ${esc(CIPHER)} com deslocamento ${SHIFT} e volta ao descriptografar">
${parts.join('\n')}
</svg>
`;

writeFileSync(new URL('../docs/preview.svg', import.meta.url), svg);
console.log(`docs/preview.svg: ${(svg.length / 1024).toFixed(1)} KB · ${MESSAGE} → ${CIPHER}`);
