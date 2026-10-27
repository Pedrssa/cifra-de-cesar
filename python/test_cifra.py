import unittest

from cifra import decifrar


class TestDecifrar(unittest.TestCase):
    def test_volta_circular(self):
        self.assertEqual(decifrar("DEF ABC", 3), "ABC XYZ")

    def test_preserva_acentos_pontuacao_numeros(self):
        self.assertEqual(decifrar("Roá, Pxqgr! 123", 3), "Olá, Mundo! 123")

    def test_preserva_acento_decomposto(self):
        self.assertEqual(decifrar("Roá", 3), "Olá")

    def test_deslocamento_zero(self):
        self.assertEqual(decifrar("Qualquer Coisa!", 0), "Qualquer Coisa!")

    def test_emojis_e_vazio(self):
        self.assertEqual(decifrar("🙂b👨‍👩‍👧", 1), "🙂a👨‍👩‍👧")
        self.assertEqual(decifrar("", 7), "")

    def test_todos_os_deslocamentos(self):
        original = "Ave, César! zZ aA 2026"
        for s in range(26):
            cifrado = "".join(
                chr((ord(c) - b + s) % 26 + b) if c.isascii() and c.isalpha() else c
                for c in original
                for b in [ord("A") if c.isupper() else ord("a")]
            )
            self.assertEqual(decifrar(cifrado, s), original)

    def test_texto_longo(self):
        longo = "Lorem ipsum dolor sit amet. " * 4000
        self.assertEqual(len(decifrar(longo, 11)), len(longo))

    def test_deslocamento_invalido(self):
        for valor in (-1, 26):
            with self.assertRaises(ValueError):
                decifrar("abc", valor)
        for valor in (3.5, "3", True):
            with self.assertRaises(TypeError):
                decifrar("abc", valor)


if __name__ == "__main__":
    unittest.main()
