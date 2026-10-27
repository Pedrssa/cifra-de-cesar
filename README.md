# Cifra de César

Aplicação web para criptografar e descriptografar mensagens com a cifra de César,
com animações que mostram cada letra percorrendo o deslocamento.

- **Criptografia:** TypeScript (`src/lib/caesar.ts`).
- **Descriptografia:** Python (`python/cifra.py`), executado no próprio navegador
  via [Pyodide](https://pyodide.org). A mensagem nunca sai do navegador; só o
  interpretador Python é baixado do CDN na primeira vez.

> A cifra de César é um recurso educativo e não protege informações sensíveis.

## Preview

[![Abrir no GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Pedrssa/cifra-de-cesar?quickstart=1)

Clique no botão para rodar o app direto do repositório: o Codespaces instala as
dependências, inicia o servidor e abre o preview automaticamente (cerca de 1–2 min
na primeira vez).

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
