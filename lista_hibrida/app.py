"""Atlas de Dados — Interface Streamlit para lista híbrida."""
from html import escape

import streamlit as st

from estrutura import CAPACIDADE_CAUDA, ListaHibrida, SEMENTE, TAMANHO_INICIAL
from tema import aplicar_tema


st.set_page_config(
    page_title="Atlas de Dados | Lista Híbrida",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)
aplicar_tema()

if "lista" not in st.session_state:
    st.session_state.lista = ListaHibrida()
if "ultimo_resultado" not in st.session_state:
    st.session_state.ultimo_resultado = None
lista = st.session_state.lista

st.markdown(
    """
    <section class="atlas-hero" aria-label="Apresentação do simulador">
      <span class="atlas-kicker">Observatório de algoritmos / Volume I</span>
      <h1>Atlas da Lista Híbrida</h1>
      <p>Uma exploração interativa entre a ordem e o acaso. Investigue 1.024 chaves
      organizadas, uma cauda mutável e o rigor das buscas binária e sequencial.</p>
      <div class="atlas-rule"></div>
      <span class="atlas-mark">✦ &nbsp; BUSCA · INSERÇÃO · REORDENAÇÃO</span>
    </section>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.markdown('<div class="atlas-section">Instrumentos de controle</div>', unsafe_allow_html=True)
    st.header("Configuração")
    semente = st.number_input(
        "Semente para geração reprodutível",
        value=int(lista.semente),
        step=1,
        help="Reiniciar aplica a semente escolhida e restaura as 1.024 chaves iniciais.",
    )
    if st.button("↺ Reiniciar estrutura", use_container_width=True):
        st.session_state.lista = ListaHibrida(int(semente))
        st.session_state.ultimo_resultado = None
        st.rerun()

    st.caption(f"Semente em uso: {lista.semente} · Base inicial: {TAMANHO_INICIAL} chaves.")
    st.divider()
    st.subheader("Integrantes")
    st.info("Adicionar os nomes reais dos integrantes antes da apresentação.")
    with st.expander("Instrumentos matemáticos utilizados"):
        st.code(
            "random.Random.sample\n"
            "list / set\n"
            "Busca binária\n"
            "Busca sequencial\n"
            "Mesclagem ordenada\n"
            "Streamlit",
            language="text",
        )
    with st.expander("Como interpretar os índices"):
        st.write("Os índices começam em zero, separadamente, na região ordenada e na cauda.")

st.markdown('<div class="atlas-section">I / Estado da estrutura</div>', unsafe_allow_html=True)
m1, m2, m3, m4 = st.columns(4)
m1.metric("Região ordenada", f"{len(lista.ordenada):,}".replace(",", "."))
m2.metric("Cauda", f"{len(lista.cauda)} / {CAPACIDADE_CAUDA}")
m3.metric("Total de chaves", f"{len(lista.ordenada) + len(lista.cauda):,}".replace(",", "."))
m4.metric("Reordenações", lista.reordenacoes)

st.markdown('<div class="atlas-section">II / Laboratório de operações</div>', unsafe_allow_html=True)
aba_inserir, aba_buscar, aba_dados = st.tabs(
    ["✦ Inserção", "⌕ Busca híbrida", "▦ Cartografia dos dados"]
)

with aba_inserir:
    st.subheader("A cauda não ordenada")
    st.write(
        "Cada chave inédita entra no fim da cauda. Na décima inserção válida, "
        "as chaves são incorporadas à região ordenada e a cauda fica vazia."
    )
    with st.form("inserir"):
        nova_chave = st.number_input(
            "Nova chave inteira",
            step=1,
            value=100_001,
            format="%d",
            help="Chaves repetidas não são inseridas nem contam para o limite da cauda.",
        )
        enviar = st.form_submit_button("Registrar chave na cauda", type="primary")

    if enviar:
        try:
            inserida = lista.inserir(int(nova_chave))
        except (TypeError, ValueError) as erro:
            st.error(f"Não foi possível inserir a chave: {erro}")
        else:
            if not inserida:
                st.warning("Esta chave já existe. Nenhuma alteração foi realizada.")
            else:
                st.session_state.ultimo_resultado = None
                if not lista.cauda:
                    st.success("Décima chave registrada: mesclagem concluída e cauda esvaziada.")
                else:
                    st.success(f"Chave inserida na posição {len(lista.cauda) - 1} da cauda.")

    st.progress(
        len(lista.cauda) / CAPACIDADE_CAUDA,
        text=f"{len(lista.cauda)} de {CAPACIDADE_CAUDA} inserções até a próxima reordenação",
    )
    slots = []
    for indice in range(CAPACIDADE_CAUDA):
        if indice < len(lista.cauda):
            valor = escape(str(lista.cauda[indice]))
            slots.append(f'<div class="atlas-slot filled" title="Posição {indice}">{valor}</div>')
        else:
            slots.append(f'<div class="atlas-slot" title="Posição {indice}">{indice + 1:02d}</div>')
    st.markdown(
        '<div class="atlas-grid" aria-label="Estado visual da cauda">'
        + "".join(slots)
        + "</div>",
        unsafe_allow_html=True,
    )
    st.caption("Os espaços vazios são numerados de 01 a 10; as chaves preenchidas aparecem em sua ordem de inserção.")

with aba_buscar:
    st.subheader("O método das duas buscas")
    st.write(
        "O sistema investiga primeiro a região ordenada por busca binária. "
        "Se a chave não estiver nela, percorre a cauda sequencialmente."
    )
    with st.form("buscar"):
        chave = st.number_input(
            "Chave a localizar",
            step=1,
            value=100_001,
            format="%d",
        )
        pesquisar = st.form_submit_button("Executar investigação", type="primary")
    if pesquisar:
        try:
            st.session_state.ultimo_resultado = lista.buscar(int(chave))
        except (TypeError, ValueError) as erro:
            st.session_state.ultimo_resultado = None
            st.error(f"Não foi possível realizar a busca: {erro}")

    resultado = st.session_state.ultimo_resultado
    if resultado is not None:
        if resultado.encontrado:
            st.success(
                f"Chave {resultado.chave} encontrada na região {resultado.regiao}, "
                f"índice {resultado.indice} (base zero)."
            )
        else:
            st.warning(f"Chave {resultado.chave} não localizada em nenhuma das regiões.")

        st.markdown('<div class="atlas-section">III / Registro de medições</div>', unsafe_allow_html=True)
        a, b, c = st.columns(3)
        a.metric("Iterações binárias", resultado.iteracoes_binaria)
        b.metric("Iterações sequenciais", resultado.iteracoes_sequencial)
        c.metric("Total de iterações", resultado.iteracoes_total)
        d, e, f = st.columns(3)
        d.metric("Comparações binárias", resultado.comparacoes_binaria)
        e.metric("Comparações sequenciais", resultado.comparacoes_sequencial)
        f.metric("Total de comparações", resultado.comparacoes_total)
        st.caption(
            "Uma iteração = uma passagem no laço. Na busca binária, igualdade e ordem "
            "são comparações distintas. Na busca sequencial, cada chave examinada "
            "corresponde a uma comparação."
        )
    else:
        st.info("Informe uma chave e execute a busca para revelar as medições.")

with aba_dados:
    st.subheader("Cartografia das regiões")
    st.write(
        "Inspecione cada posição e seu valor. A região principal permanece ordenada; "
        "a cauda preserva a ordem de chegada até a décima inserção."
    )
    st.markdown('<div class="atlas-section">Região I / Arquivo ordenado</div>', unsafe_allow_html=True)
    st.dataframe(
        [{"Índice": indice, "Chave": valor} for indice, valor in enumerate(lista.ordenada)],
        hide_index=True,
        use_container_width=True,
        height=330,
    )
    st.markdown('<div class="atlas-section">Região II / Registro transitório</div>', unsafe_allow_html=True)
    if lista.cauda:
        st.dataframe(
            [{"Índice": indice, "Chave": valor} for indice, valor in enumerate(lista.cauda)],
            hide_index=True,
            use_container_width=True,
        )
    else:
        st.info("A cauda está vazia. Insira uma chave para iniciar um novo ciclo.")

st.markdown(
    '<div class="atlas-footer">ATLAS DE DADOS · EXPERIMENTO DIDÁTICO · PYTHON / STREAMLIT · '
    'ESTRUTURA HÍBRIDA</div>',
    unsafe_allow_html=True,
)
