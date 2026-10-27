"""Cifra de César — decodificação.

Este arquivo é a fonte da descriptografia do aplicativo: o navegador o executa
com Pyodide (Python em WebAssembly), sem enviar a mensagem a nenhum servidor.
Também pode ser usado pelo terminal:

    python python/cifra.py "Roá, Pxqgr! 123" 3
"""

import sys
import unicodedata

TAMANHO_ALFABETO = 26
DESLOCAMENTO_MINIMO = 0
DESLOCAMENTO_MAXIMO = 25


def _letra_basica(ch: str) -> bool:
    return ("A" <= ch <= "Z") or ("a" <= ch <= "z")


def _desloca(ch: str, deslocamento: int) -> str:
    base = ord("A") if ch.isupper() else ord("a")
    return chr(base + (ord(ch) - base + deslocamento) % TAMANHO_ALFABETO)


def decifrar(texto: str, deslocamento: int) -> str:
    """Desfaz a cifra: cada letra A–Z/a–z volta `deslocamento` posições.

    Maiúsculas e minúsculas são mantidas. Espaços, números, pontuação, emojis
    e letras acentuadas são preservados — inclusive o acento decomposto
    ("a" + U+0301), em que a letra seguida de marca combinante não é deslocada.
    """
    if isinstance(deslocamento, bool) or not isinstance(deslocamento, int):
        raise TypeError("O deslocamento deve ser um número inteiro.")
    if not DESLOCAMENTO_MINIMO <= deslocamento <= DESLOCAMENTO_MAXIMO:
        raise ValueError("O deslocamento vai de 0 a 25.")

    volta = -deslocamento
    saida = []
    ultimo = len(texto) - 1
    for i, ch in enumerate(texto):
        acentuada = i < ultimo and unicodedata.category(texto[i + 1]).startswith("M")
        if _letra_basica(ch) and not acentuada:
            saida.append(_desloca(ch, volta))
        else:
            saida.append(ch)
    return "".join(saida)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) != 3:
        print('Uso: python cifra.py "mensagem cifrada" DESLOCAMENTO', file=sys.stderr)
        sys.exit(2)
    try:
        print(decifrar(sys.argv[1], int(sys.argv[2])))
    except ValueError as erro:
        print(erro, file=sys.stderr)
        sys.exit(1)
