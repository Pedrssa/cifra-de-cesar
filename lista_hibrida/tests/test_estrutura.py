import unittest
from estrutura import ListaHibrida, TAMANHO_INICIAL

class TestListaHibrida(unittest.TestCase):
    def setUp(self):
        self.lista = ListaHibrida()

    def test_geracao_deterministica(self):
        self.assertEqual(len(self.lista.ordenada), TAMANHO_INICIAL)
        self.assertEqual(len(set(self.lista.ordenada)), TAMANHO_INICIAL)
        self.assertEqual(self.lista.ordenada, sorted(self.lista.ordenada))
        self.assertEqual(self.lista.ordenada, ListaHibrida().ordenada)

    def test_busca_binaria(self):
        chave = self.lista.ordenada[123]
        r = self.lista.buscar(chave)
        self.assertTrue(r.encontrado)
        self.assertEqual((r.regiao, r.indice, r.iteracoes_sequencial), ("Ordenada", 123, 0))

    def test_rejeita_duplicatas(self):
        self.assertFalse(self.lista.inserir(self.lista.ordenada[0]))
        self.assertTrue(self.lista.inserir(200001))
        self.assertFalse(self.lista.inserir(200001))
        self.assertEqual(self.lista.cauda, [200001])

    def test_busca_sequencial(self):
        self.lista.inserir(200001)
        self.lista.inserir(200002)
        r = self.lista.buscar(200002)
        self.assertEqual((r.regiao, r.indice, r.iteracoes_sequencial), ("Cauda", 1, 2))
        r = self.lista.buscar(-999)
        self.assertFalse(r.encontrado)
        self.assertEqual(r.iteracoes_sequencial, 2)

    def test_decima_insercao(self):
        for chave in range(200000, 200010):
            self.assertTrue(self.lista.inserir(chave))
        self.assertEqual(self.lista.cauda, [])
        self.assertEqual(self.lista.reordenacoes, 1)
        self.assertEqual(len(self.lista.ordenada), TAMANHO_INICIAL + 10)
        self.assertEqual(self.lista.ordenada, sorted(self.lista.ordenada))
        self.assertEqual(self.lista.buscar(200009).regiao, "Ordenada")
        self.assertTrue(self.lista.inserir(200010))
        self.assertEqual(self.lista.cauda, [200010])

    def test_reordenacao_com_extremos(self):
        for chave in [-90, -50, -1, 200001, 200002, 200003, 200004, 200005, 200006, 200007]:
            self.assertTrue(self.lista.inserir(chave))
        self.assertEqual(self.lista.cauda, [])
        self.assertEqual(self.lista.ordenada, sorted(self.lista.ordenada))

    def test_tipo_invalido(self):
        with self.assertRaises(TypeError):
            self.lista.inserir(True)
        with self.assertRaises(TypeError):
            self.lista.buscar(1.5)

if __name__ == "__main__":
    unittest.main()
