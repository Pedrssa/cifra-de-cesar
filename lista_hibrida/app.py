"""Interface Streamlit da lista híbrida."""
import streamlit as st
from estrutura import ListaHibrida, SEMENTE, TAMANHO_INICIAL

st.set_page_config(page_title="Lista Híbrida • Busca e Reordenação", page_icon="🔎", layout="wide")
st.title("Lista Híbrida — Busca e Reordenação")
st.caption("Python + Streamlit | busca binária, busca sequencial e reordenação")

if "lista" not in st.session_state:
    st.session_state.lista = ListaHibrida()
if "ultimo_resultado" not in st.session_state:
    st.session_state.ultimo_resultado = None
lista = st.session_state.lista

with st.sidebar:
    st.header("Configuração")
    semente = st.number_input("Semente reprodutível", value=SEMENTE, step=1)
    if st.button("Reiniciar lista", use_container_width=True):
        st.session_state.lista = ListaHibrida(int(semente))
        st.session_state.ultimo_resultado = None
        st.rerun()
    st.write(f"**Tamanho inicial:** {TAMANHO_INICIAL} números distintos")
    st.write(f"**Semente em uso:** {lista.semente}")
    st.divider()
    st.subheader("Integrantes")
    st.info("Preencher os nomes dos integrantes antes da entrega.")
    with st.expander("Componentes utilizados"):
        st.code("random.Random.sample\nlist, set\nBusca binária\nBusca sequencial\nMesclagem ordenada\nStreamlit")

c1, c2, c3, c4 = st.columns(4)
c1.metric("Região ordenada", len(lista.ordenada))
c2.metric("Cauda", f"{len(lista.cauda)}/10")
c3.metric("Total de chaves", len(lista.ordenada) + len(lista.cauda))
c4.metric("Reordenações", lista.reordenacoes)

aba_inserir, aba_buscar, aba_dados = st.tabs(["Inserir", "Buscar", "Visualizar estrutura"])
with aba_inserir:
    st.subheader("Inserção na cauda")
    with st.form("inserir"):
        nova_chave = st.number_input("Nova chave inteira", step=1, value=100_001, format="%d")
        enviar = st.form_submit_button("Inserir chave", type="primary")
    if enviar:
        if not lista.inserir(int(nova_chave)):
            st.warning("Chave já cadastrada; duplicatas são rejeitadas.")
        elif not lista.cauda:
            st.success("Décima inserção válida: mesclagem automática concluída e cauda esvaziada.")
        else:
            st.success(f"Chave adicionada ao final da cauda ({len(lista.cauda)}/10).")
    st.progress(len(lista.cauda) / 10, text="Progresso até a reordenação")
    st.write("**Cauda (ordem de inserção):**", lista.cauda if lista.cauda else "Vazia")

with aba_buscar:
    st.subheader("Busca híbrida")
    with st.form("buscar"):
        chave = st.number_input("Chave a localizar", step=1, value=100_001, format="%d")
        pesquisar = st.form_submit_button("Executar busca", type="primary")
    if pesquisar:
        st.session_state.ultimo_resultado = lista.buscar(int(chave))
    resultado = st.session_state.ultimo_resultado
    if resultado is not None:
        if resultado.encontrado:
            st.success(f"Chave {resultado.chave} encontrada em {resultado.regiao}, índice {resultado.indice} (base zero).")
        else:
            st.warning(f"Chave {resultado.chave} não encontrada.")
        a, b, c = st.columns(3)
        a.metric("Iterações binárias", resultado.iteracoes_binaria)
        b.metric("Iterações sequenciais", resultado.iteracoes_sequencial)
        c.metric("Iterações totais", resultado.iteracoes_total)
        d, e, f = st.columns(3)
        d.metric("Comparações binárias", resultado.comparacoes_binaria)
        e.metric("Comparações sequenciais", resultado.comparacoes_sequencial)
        f.metric("Comparações totais", resultado.comparacoes_total)
        st.caption("Uma iteração por passagem no laço; na busca binária, igualdade e comparação de ordem são contadas separadamente.")

with aba_dados:
    st.subheader("Duas regiões")
    st.write(f"**Região ordenada ({len(lista.ordenada)} chaves)**")
    st.dataframe([{"Índice": i, "Chave": v} for i, v in enumerate(lista.ordenada)],
                 hide_index=True, use_container_width=True, height=330)
    st.write("**Cauda não ordenada (ordem de inserção)**")
    st.dataframe([{"Índice": i, "Chave": v} for i, v in enumerate(lista.cauda)],
                 hide_index=True, use_container_width=True)
