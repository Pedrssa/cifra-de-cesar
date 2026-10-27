// Verificação de ponta a ponta no navegador (Edge via playwright-core).
// Uso: npm run build && npm run test:e2e   [SHOTS=pasta para capturas]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
import { caesar } from '../src/lib/caesar.ts';

const pythonReady = (p) => p.locator('[data-python="ready"]').waitFor({ timeout: 90000 });
// Saída do mesmo cifra.py executado pelo CPython da máquina, para comparar com o navegador.
const cpython = (text, shift) =>
  spawnSync('python', ['python/cifra.py', text, String(shift)], { encoding: 'utf8' }).stdout.trimEnd();

const PORT = 4317;
const URL = `http://127.0.0.1:${PORT}/`;
const EDGE =
  process.env.CHROMIUM_EXECUTABLE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SHOTS = process.env.SHOTS;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push([true, name]);
  } catch (e) {
    results.push([false, name, e.message.split('\n')[0]]);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(process.env.E2E_DEV ? [] : ['preview']), '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  stdio: 'pipe',
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview não subiu')), 15000);
  server.stdout.on('data', (d) => d.toString().includes(String(PORT)) && (clearTimeout(t), resolve()));
});

const browser = await chromium.launch({ executablePath: EDGE });
const consoleErrors = [];

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: URL });
  const page = await context.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message + (process.env.E2E_STACK ? ' @ ' + e.stack : '')));
  await page.goto(URL);
  return page;
}

const input = (p) => p.getByRole('textbox', { name: /Mensagem original|Mensagem cifrada/ });
const output = (p) => p.getByRole('textbox', { name: /Resultado/ });
const field = (p) => p.getByRole('textbox', { name: /Deslocamento/ });
const slider = (p) => p.getByRole('slider', { name: 'Deslocamento' });
const setShift = async (p, n) => {
  await field(p).fill(String(n));
};

try {
  const page = await open();

  await check('título e subtítulo', async () => {
    expect((await page.locator('h1').textContent()) === 'Cifra de César', 'h1');
    expect(await page.getByText('Desloque letras. Transforme mensagens.').isVisible(), 'subtítulo');
  });

  await check('ABC XYZ, 3 → DEF ABC', async () => {
    await setShift(page, 3);
    await input(page).fill('ABC XYZ');
    expect((await output(page).inputValue()) === 'DEF ABC', await output(page).inputValue());
  });

  await check('Olá, Mundo! 123, 3 → Roá, Pxqgr! 123', async () => {
    await input(page).fill('Olá, Mundo! 123');
    expect((await output(page).inputValue()) === 'Roá, Pxqgr! 123', await output(page).inputValue());
  });

  await check('deslocamento 0 preserva', async () => {
    await setShift(page, 0);
    expect((await output(page).inputValue()) === 'Olá, Mundo! 123', 'alterou');
    await setShift(page, 3);
  });

  await check('criptografar → usar como entrada → descriptografar recupera', async () => {
    const original = 'Ave, César! 🌅 zebra XYZ';
    await setShift(page, 11);
    await input(page).fill(original);
    await page.getByRole('button', { name: 'Usar como entrada' }).click();
    await pythonReady(page);
    await page.getByRole('radio', { name: 'Descriptografar', exact: true }).click();
    expect((await output(page).inputValue()) === original, await output(page).inputValue());
    await page.getByRole('radio', { name: 'Criptografar', exact: true }).click();
  });

  await check('descriptografar usa o Python (Pyodide) e bate com o CPython', async () => {
    await pythonReady(page);
    const cifrado = 'Roá, Pxqgr! 123 🙂 Dyh, Fébdu! ABC';
    await setShift(page, 3);
    await page.getByRole('radio', { name: 'Descriptografar', exact: true }).click();
    await input(page).fill(cifrado);
    const out = await output(page).inputValue();
    expect(out === 'Olá, Mundo! 123 🙂 Ave, Céyar! XYZ', out);
    expect(out === cpython(cifrado, 3), 'navegador difere do CPython: ' + cpython(cifrado, 3));
    expect(await page.getByText('Decodificado em Python').isVisible(), 'selo do Python');
    await page.getByRole('radio', { name: 'Criptografar', exact: true }).click();
  });

  await check('validação do campo numérico', async () => {
    await setShift(page, 5);
    await input(page).fill('abc');
    for (const [raw, msg] of [
      ['', 'Informe um número'],
      ['3.5', 'número inteiro'],
      ['3,5', 'número inteiro'],
      ['30', 'vai de 0 a 25'],
      ['-2', 'vai de 0 a 25'],
      ['x', 'apenas números'],
    ]) {
      await field(page).fill(raw);
      expect((await field(page).getAttribute('aria-invalid')) === 'true', `${raw} não marcado inválido`);
      expect((await page.locator('.hint').textContent()).includes(msg), `${raw}: mensagem`);
      expect((await output(page).inputValue()) === 'fgh', `${raw}: resultado mudou`);
    }
    await field(page).blur();
    expect((await field(page).inputValue()) === '5', 'não restaurou ao sair');
    expect((await slider(page).inputValue()) === '5', 'slider dessincronizado');
  });

  await check('entrada vazia e emojis', async () => {
    await input(page).fill('');
    expect((await output(page).inputValue()) === '', 'vazio');
    await input(page).fill('👨‍👩‍👧 🙂 a');
    expect((await output(page).inputValue()) === '👨‍👩‍👧 🙂 f', await output(page).inputValue());
  });

  await check('digitação rápida não deixa o resultado atrasado', async () => {
    await setShift(page, 7);
    await input(page).fill('');
    const typed = 'Mensagem digitada muito rapido, com Acentos é ç e 42!';
    await input(page).pressSequentially(typed, { delay: 0 });
    expect((await output(page).inputValue()) === caesar(typed, 7, 'encrypt'), 'resultado desatualizado');
  });

  await check('slider rápido: resultado acompanha e animações não acumulam', async () => {
    await input(page).fill('Abcdefghijklmnopqrstuvwxyz');
    await slider(page).focus();
    for (let i = 0; i < 18; i++) await page.keyboard.press('ArrowRight');
    for (let i = 0; i < 9; i++) await page.keyboard.press('ArrowLeft');
    const s = Number(await slider(page).inputValue());
    expect((await output(page).inputValue()) === caesar('Abcdefghijklmnopqrstuvwxyz', s, 'encrypt'), 'desatualizado');
    expect((await field(page).inputValue()) === String(s), 'campo dessincronizado');
    const maxPerReel = await page.$$eval('.tile-reel', (els) => Math.max(...els.map((e) => e.getAnimations().length)));
    expect(maxPerReel <= 1, `rolo com ${maxPerReel} animações`);
    await page.waitForTimeout(800);
    const reelsDone = await page.$$eval('.tile-reel', (els) => els.every((e) => e.getAnimations().length === 0));
    expect(reelsDone, 'animações não terminaram');
    // Cada rolo termina mostrando a letra do resultado.
    const shown = await page.$$eval('.tile-reel', (els) =>
      els.map((e) => {
        const win = e.parentElement.getBoundingClientRect();
        const lines = e.textContent.split('\n');
        const lineH = e.getBoundingClientRect().height / lines.length;
        const idx = Math.round((win.top - e.getBoundingClientRect().top) / lineH);
        return lines[idx];
      }).join(''),
    );
    const out = await output(page).inputValue();
    expect(shown.length > 0 && shown === out.slice(-shown.length), `rolos mostram ${shown}`);
  });

  await check('texto longo (50.000) sem erro', async () => {
    const long = 'Lorem ipsum dolor sit amet, ação 🙂. '.repeat(1400).slice(0, 50000);
    const t0 = Date.now();
    await input(page).fill(long);
    const out = await output(page).inputValue();
    expect(out === caesar(long, Number(await slider(page).inputValue()), 'encrypt'), 'resultado errado');
    expect((await page.locator('.tile').count()) <= 24, 'amostra não limitada');
    console.log(`   (texto longo processado em ${Date.now() - t0} ms incluindo preenchimento)`);
    await input(page).fill('Copie isto');
  });

  await check('copiar: "Copiado" sem deslocar layout + área de transferência', async () => {
    const btn = page.locator('.copy-btn');
    const before = await btn.boundingBox();
    await btn.click();
    await page.waitForTimeout(300);
    const after = await btn.boundingBox();
    expect(before.width === after.width && before.height === after.height, 'botão mudou de tamanho');
    expect((await btn.getAttribute('data-status')) === 'copied', 'sem feedback');
    expect(await page.locator('[data-face="copied"]').isVisible(), 'rótulo Copiado invisível');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip === (await output(page).inputValue()), 'clipboard diferente');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'copiado.png'), clip: { x: after.x - 300, y: after.y - 260, width: 700, height: 340 } });
  });

  await check('copiar: falha mostra feedback claro', async () => {
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error('negado'));
      document.execCommand = () => false;
    });
    await page.waitForTimeout(1900);
    await page.locator('.copy-btn').click();
    expect((await page.locator('.copy-btn').getAttribute('data-status')) === 'error', 'sem estado de erro');
    expect((await page.getByRole('status').filter({ hasText: 'Não foi possível copiar' }).count()) === 1, 'sem anúncio');
  });

  await check('teclado: modo por setas, foco visível', async () => {
    await page.locator('input[name="mode"][value="encrypt"]').focus();
    await page.keyboard.press('ArrowRight');
    expect((await page.locator('.card').getAttribute('data-mode')) === 'decrypt', 'seta não trocou modo');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.getAttribute('type'));
    expect(focused === 'range', `Tab foi para ${focused}`);
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    // O range desenha o anel no polegar; os demais controles usam outline.
    await page.keyboard.press('Tab');
    const ring2 = await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return cs.boxShadow !== 'none' || cs.outlineStyle !== 'none';
    });
    expect(ring !== undefined && ring2, 'sem foco visível no campo numérico');
  });

  await check('rótulos acessíveis e resultado sem live region', async () => {
    const live = await output(page).evaluate((el) => el.closest('[aria-live]'));
    expect(live === null, 'resultado dentro de aria-live');
    await page.locator('.copy-btn[data-status="idle"]').waitFor({ timeout: 5000 });
    for (const name of ['Copiar resultado', 'Usar como entrada', 'Experimentar exemplo', 'Limpar']) {
      expect((await page.getByRole('button', { name }).count()) === 1, `botão ${name}`);
    }
    await page.getByText('Como funciona').click();
    expect(await page.getByText('Para descriptografar').isVisible(), 'detalhes não abriram');
    expect(await page.getByText('A cifra de César é um recurso educativo e não protege informações sensíveis.').isVisible(), 'aviso');
  });

  await check('nenhuma requisição externa com a mensagem', async () => {
    const reqs = [];
    page.on('request', (r) => reqs.push(r.url()));
    await input(page).fill('segredo');
    await page.waitForTimeout(300);
    expect(reqs.length === 0, reqs.join(','));
  });

  if (SHOTS) {
    await page.getByRole('button', { name: 'Experimentar exemplo' }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(SHOTS, 'desktop.png'), fullPage: true });
    await page.getByRole('radio', { name: 'Descriptografar', exact: true }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(SHOTS, 'desktop-decrypt.png'), fullPage: true });
  }
  await page.context().close();

  const mobile = await open({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await check('celular 360px: sem rolagem horizontal, ações alcançáveis', async () => {
    await mobile.getByRole('button', { name: 'Experimentar exemplo' }).tap();
    await mobile.waitForTimeout(800);
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow <= 0, `estouro de ${overflow}px`);
    for (const name of ['Copiar resultado', 'Usar como entrada', 'Limpar']) {
      const box = await mobile.getByRole('button', { name }).boundingBox();
      expect(box.x >= 0 && box.x + box.width <= 360 && box.height >= 44, `${name} fora/pequeno`);
    }
    if (SHOTS) await mobile.screenshot({ path: path.join(SHOTS, 'mobile.png'), fullPage: true });
  });
  await mobile.context().close();

  const calm = await open({ reducedMotion: 'reduce' });
  await check('movimento reduzido: sem animações, resultado imediato e equivalente', async () => {
    await input(calm).fill('Xyz abc');
    await pythonReady(calm);
    await calm.getByRole('radio', { name: 'Descriptografar', exact: true }).click();
    await setShift(calm, 9);
    const running = await calm.evaluate(() =>
      document.getAnimations().filter((a) => a.playState === 'running' && a.effect.getTiming().duration > 1).length,
    );
    expect(running === 0, `${running} animações em execução`);
    const reelOk = await calm.$$eval('.tile-reel', (els) => els.every((e) => e.style.transform.startsWith('translateY')));
    expect(reelOk, 'rolos sem posição final');
    expect((await output(calm).inputValue()) === caesar('Xyz abc', 9, 'decrypt'), 'resultado');
  });
  await calm.context().close();

  await check('sem erros no console', async () => {
    expect(consoleErrors.length === 0, consoleErrors.join(' | '));
  });
} finally {
  await browser.close();
  server.kill();
}

for (const [ok, name, err] of results) console.log(`${ok ? '✔' : '✘'} ${name}${err ? ` — ${err}` : ''}`);
const failed = results.filter((r) => !r[0]).length;
console.log(`\n${results.length - failed}/${results.length} verificações passaram`);
process.exit(failed ? 1 : 0);
