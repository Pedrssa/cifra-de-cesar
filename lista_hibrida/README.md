# Lista Híbrida — Busca e Reordenação

Implementação independente em Python + Streamlit para a atividade acadêmica. O projeto original de Cifra de César é preservado.

## Requisitos atendidos
- 1.024 inteiros distintos gerados de modo reprodutível com semente fixa.
- Inserção no final da cauda não ordenada, rejeitando duplicatas.
- Busca binária na região ordenada, seguida de busca sequencial na cauda.
- Contagem de iterações e comparações, localização e região do resultado.
- Reordenação e esvaziamento da cauda após 10 inserções válidas; novas inserções continuam possíveis.
- Testes automatizados e interface Streamlit.

## Executar

Na raiz do repositório:

```bash
python -m pip install -r lista_hibrida/requirements.txt
streamlit run lista_hibrida/app.py
```

## Testes

```bash
cd lista_hibrida
python -m unittest discover -s tests -v
```

## Streamlit Community Cloud

1. Acesse https://share.streamlit.io/ e conecte o GitHub.
2. Selecione o repositório `Pedrssa/cifra-de-cesar` e a branch correspondente.
3. Em **Main file path**, informe `lista_hibrida/app.py`.
4. Publique, abra a URL pública e valide as funcionalidades.
5. Substitua o aviso de integrantes em `app.py` pelos nomes reais antes da entrega.

**Convenção das métricas:** uma iteração é uma passagem de laço. Na busca binária são contabilizadas a comparação de igualdade e, quando a chave é diferente, a comparação de ordem. Na sequencial é contabilizada uma comparação por item examinado. Os índices começam em zero em cada região.

**Nota:** o deploy e a demonstração presencial não são realizados automaticamente pelo código.
