"""Lista híbrida: 1024 chaves ordenadas e uma cauda de até 10 chaves."""
from dataclasses import dataclass
from random import Random

TAMANHO_INICIAL = 1024
CAPACIDADE_CAUDA = 10
SEMENTE = 20261103

@dataclass(frozen=True)
class ResultadoBusca:
    chave: int
    encontrado: bool
    regiao: str | None
    indice: int | None
    iteracoes_binaria: int
    iteracoes_sequencial: int
    comparacoes_binaria: int
    comparacoes_sequencial: int

    @property
    def iteracoes_total(self):
        return self.iteracoes_binaria + self.iteracoes_sequencial

    @property
    def comparacoes_total(self):
        return self.comparacoes_binaria + self.comparacoes_sequencial

class ListaHibrida:
    def __init__(self, semente: int = SEMENTE):
        self.semente = semente
        self.ordenada = sorted(Random(semente).sample(range(1, 100_001), TAMANHO_INICIAL))
        self.cauda: list[int] = []
        self._chaves = set(self.ordenada)
        self.reordenacoes = 0

    def inserir(self, chave: int) -> bool:
        if type(chave) is not int:
            raise TypeError("A chave precisa ser um inteiro.")
        if chave in self._chaves:
            return False
        self.cauda.append(chave)
        self._chaves.add(chave)
        if len(self.cauda) == CAPACIDADE_CAUDA:
            self.reordenar()
        return True

    def reordenar(self):
        if not self.cauda:
            return
        novos = sorted(self.cauda)
        resultado = []
        i = j = 0
        while i < len(self.ordenada) and j < len(novos):
            if self.ordenada[i] < novos[j]:
                resultado.append(self.ordenada[i])
                i += 1
            else:
                resultado.append(novos[j])
                j += 1
        resultado.extend(self.ordenada[i:])
        resultado.extend(novos[j:])
        self.ordenada = resultado
        self.cauda.clear()
        self.reordenacoes += 1

    def buscar(self, chave: int) -> ResultadoBusca:
        if type(chave) is not int:
            raise TypeError("A chave precisa ser um inteiro.")
        esquerda, direita = 0, len(self.ordenada) - 1
        iter_bin = comp_bin = 0
        while esquerda <= direita:
            iter_bin += 1
            meio = (esquerda + direita) // 2
            comp_bin += 1
            if self.ordenada[meio] == chave:
                return ResultadoBusca(chave, True, "Ordenada", meio, iter_bin, 0, comp_bin, 0)
            comp_bin += 1
            if self.ordenada[meio] < chave:
                esquerda = meio + 1
            else:
                direita = meio - 1
        for indice, valor in enumerate(self.cauda):
            if valor == chave:
                n = indice + 1
                return ResultadoBusca(chave, True, "Cauda", indice, iter_bin, n, comp_bin, n)
        n = len(self.cauda)
        return ResultadoBusca(chave, False, None, None, iter_bin, n, comp_bin, n)
