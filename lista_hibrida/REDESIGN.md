# Redesign — Atlas Celestial / Lista Híbrida

## Escopo
Apenas `lista_hibrida/`. A aplicação React/Vite da Cifra de César não foi alterada. A estrutura de dados Python (`estrutura.py`) e os testes de algoritmos permanecem sem modificações.

## Linguagem visual
- Dark Academia (40%), Celestial Vintage (35%) e Esotérico Antigo (25%), sem símbolos aleatórios.
- Tokens CSS na raiz de `tema.py`: obsidiana, azul noturno, pergaminho, bronze, bordô e dourado antigo.
- Tipografia: Cormorant Garamond, Inter e IBM Plex Mono, com fontes locais alternativas quando indisponíveis.
- Superfícies sóbrias com órbitas geométricas CSS, sem imagens pesadas nem animações contínuas.
- Layout responsivo: cartões, campos, abas, contador de cauda e tabelas do próprio Streamlit.
- Acessibilidade: foco visível, redução de movimento, HTML decorativo sem eventos, títulos semânticos, labels preservados.

## Alterações
- `app.py`: apresentação editorial, painel de estado, inserção, busca, visualização, métricas e feedback.
- `tema.py`: novo tema CSS e aplicação centralizada.
- `.github/workflows/lista-hibrida.yml`: compilação, testes e smoke test HTTP em PRs e pushes.

## Requisitos preservados
As regras de geração determinística, unicidade, inserção, busca binária/sequencial e mesclagem na 10ª inserção continuam em `estrutura.py`. O resultado de busca anterior é limpo após uma inserção válida, evitando exibir métricas obsoletas.

## Executar
Na raiz:
```bash
python -m pip install -r lista_hibrida/requirements.txt
streamlit run lista_hibrida/app.py
```

Testes:
```bash
cd lista_hibrida
python -m unittest discover -s tests -v
```

## Limites e validações pendentes
- A validação visual precisa ser feita no navegador em desktop, tablet e celular. CSS utiliza alguns seletores internos do Streamlit, sujeitos a alterações em futuras versões.
- O carregamento opcional de fontes do Google exige conexão externa; fontes substitutas continuam funcionais.
- A verificação automatizada testa compilação, algoritmos e inicialização HTTP do servidor, **não substitui** testes de interação no navegador.
- Inserir os nomes reais dos integrantes e publicar no Streamlit Community Cloud antes da apresentação.
- Não há nova biblioteca Python ou JavaScript.
