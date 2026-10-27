# Cifra de César

Aplicação web para criptografar e descriptografar mensagens com a cifra de César,
com animações que mostram cada letra percorrendo o deslocamento.

- **Criptografia:** TypeScript (`src/lib/caesar.ts`).
- **Descriptografia:** Python (`python/cifra.py`), executado no próprio navegador
  via [Pyodide](https://pyodide.org). A mensagem nunca sai do navegador; só o
  interpretador Python é baixado do CDN na primeira vez.

> A cifra de César é um recurso educativo e não protege informações sensíveis.

## Preview

**▶ Abrir o app: https://pedrssa.github.io/cifra-de-cesar/**

Publicado pelo próprio repositório via GitHub Pages: a cada push no `main`, o
workflow [`pages.yml`](.github/workflows/pages.yml) roda os testes, gera o
build e atualiza o site.

| Criptografar | Descriptografar (Python) |
| --- | --- |
| ![Modo criptografar](docs/desktop.png) | ![Modo descriptografar](docs/desktop-decrypt.png) |

<p align="center"><img src="docs/mobile.png" alt="Versão para celular" width="300"></p>

## Rodar

```bash
npm install
npm run dev
```

## Testes

```bash
npm test                         # lógica da cifra (Node)
python -m unittest discover python   # decodificador em Python
npm run build && npm run test:e2e    # navegador (Edge, via playwright-core)
```

O decodificador também funciona pelo terminal:

```bash
python python/cifra.py "Roá, Pxqgr! 123" 3   # → Olá, Mundo! 123
```
