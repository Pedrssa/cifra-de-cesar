"""Design system Dark Academia × Celestial Vintage × Esotérico Antigo."""
import streamlit as st

TOKENS = {
    "obsidian": "#10100F",
    "midnight": "#171B24",
    "walnut": "#30251F",
    "parchment": "#E5D6B8",
    "ivory": "#F2E8D5",
    "gold": "#B69A62",
    "bronze": "#806843",
    "burgundy": "#542E36",
    "celestial": "#26384E",
}

# CSS não altera valores de formulários, APIs, algoritmos ou estado da aplicação.
STYLES = r"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');
:root {
  --obsidian:#10100F; --midnight:#171B24; --walnut:#30251F;
  --parchment:#E5D6B8; --ivory:#F2E8D5; --gold:#B69A62;
  --bronze:#806843; --burgundy:#542E36; --celestial:#26384E;
  --line:rgba(182,154,98,.34); --soft:rgba(229,214,184,.72);
  --display:'Cormorant Garamond',Georgia,serif;
  --body:'Inter',system-ui,sans-serif; --mono:'IBM Plex Mono',monospace;
  --radius:6px; --ease:cubic-bezier(.2,.8,.2,1);
}
html { color-scheme:dark; }
body, .stApp, [data-testid="stAppViewContainer"] {
  color:var(--ivory); background:var(--obsidian);
  font-family:var(--body);
}
.stApp {
 background-image:
   radial-gradient(ellipse 70% 45% at 85% 0%, rgba(38,56,78,.27),transparent 74%),
   radial-gradient(ellipse 45% 70% at 0% 90%,rgba(48,37,31,.19),transparent 80%);
}
[data-testid="stHeader"] { background:rgba(16,16,15,.68); }
[data-testid="stMainBlockContainer"] { max-width:1220px; padding-top:2.1rem; padding-bottom:5rem; }
[data-testid="stSidebar"], [data-testid="stSidebarContent"] {
  background:var(--midnight)!important; border-right:1px solid var(--line);
}
[data-testid="stSidebar"] * { color:var(--ivory); }
h1,h2,h3 { font-family:var(--display)!important; font-weight:600!important; letter-spacing:.01em!important; color:var(--ivory)!important; }
h1 { font-size:clamp(2.3rem,4.2vw,4rem)!important; }
h2 { font-size:clamp(1.8rem,3vw,2.7rem)!important; }
h3 { font-size:1.8rem!important; }
p,li,label,[data-testid="stMarkdownContainer"] { color:var(--ivory); }
small, .stCaption, [data-testid="stCaptionContainer"] { color:var(--soft)!important; }
a { color:var(--parchment)!important; text-underline-offset:3px; }
a:hover { color:var(--ivory)!important; }
:focus-visible { outline:2px solid var(--gold)!important; outline-offset:3px!important; }
[data-testid="stVerticalBlockBorderWrapper"] { border-color:var(--line); }
[data-testid="stMetric"] {
  padding:1.1rem 1.3rem; border:1px solid var(--line);
  background:linear-gradient(137deg,rgba(38,56,78,.30),rgba(23,27,36,.90));
  border-radius:var(--radius); min-height:125px;
}
[data-testid="stMetricLabel"] p { font-size:.75rem; color:var(--parchment)!important; text-transform:uppercase; letter-spacing:.13em; }
[data-testid="stMetricValue"] { color:var(--ivory)!important; font-family:var(--mono); font-variant-numeric:tabular-nums; font-size:clamp(1.25rem,2.1vw,2rem); }
.stTabs [data-baseweb="tab-list"] { gap:.4rem; border-bottom:1px solid var(--line); overflow-x:auto; }
.stTabs [data-baseweb="tab"] {
  font-family:var(--body); color:var(--soft)!important; background:transparent!important;
  border-radius:0; font-size:.86rem; min-height:50px; padding:0 1rem;
}
.stTabs [aria-selected="true"] { color:var(--ivory)!important; border-bottom:2px solid var(--gold)!important; }
.stTabs [data-baseweb="tab-highlight"] { background:var(--gold); }
[data-testid="stForm"] { padding:1.3rem!important; border:1px solid var(--line)!important; background:rgba(23,27,36,.58)!important; border-radius:var(--radius)!important; }
[data-baseweb="input"], [data-baseweb="textarea"], [data-baseweb="select"] {
  background:#1c2028!important; border:1px solid var(--line)!important;
  border-radius:var(--radius)!important; color:var(--ivory)!important;
}
input,textarea { color:var(--ivory)!important; font-family:var(--mono)!important; }
input:focus,textarea:focus { box-shadow:0 0 0 1px var(--gold)!important; }
.stButton button, [data-testid="stFormSubmitButton"] button {
  border:1px solid var(--gold)!important; border-radius:var(--radius)!important;
  background:transparent!important; color:var(--ivory)!important;
  font-family:var(--body)!important; font-weight:600; letter-spacing:.02em;
  transition:background .18s var(--ease),transform .18s var(--ease),border-color .18s var(--ease);
}
.stButton button:hover, [data-testid="stFormSubmitButton"] button:hover { background:rgba(182,154,98,.15)!important; border-color:var(--parchment)!important; }
.stButton button:active, [data-testid="stFormSubmitButton"] button:active { transform:translateY(1px); }
.stButton button:disabled { opacity:.52; cursor:not-allowed; }
button[kind="primary"], [data-testid="stFormSubmitButton"] button[kind="primary"] { background:var(--gold)!important; color:var(--obsidian)!important; }
button[kind="primary"]:hover { background:var(--parchment)!important; }
[data-testid="stAlert"] { border-radius:var(--radius)!important; border:1px solid var(--line)!important; }
[data-testid="stDataFrame"] { border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
[data-testid="stProgress"] [role="progressbar"] > div { background:var(--gold)!important; }
[data-testid="stExpander"] { border:1px solid var(--line); border-radius:var(--radius); }
[data-testid="stCodeBlock"] { border:1px solid var(--line); border-radius:var(--radius); }
[data-testid="stCodeBlock"],code,pre { font-family:var(--mono)!important; }
.atlas-hero {
  position:relative; isolation:isolate; overflow:hidden;
  padding:2rem clamp(1.2rem,4vw,3.5rem) 2.25rem;
  border:1px solid var(--line); border-radius:var(--radius);
  background:linear-gradient(125deg,rgba(23,27,36,.98),rgba(38,56,78,.45));
  margin:0 0 1.7rem;
}
.atlas-hero::before {
  content:""; pointer-events:none; position:absolute; inset:10px;
  border:1px solid rgba(182,154,98,.14); z-index:-1;
}
.atlas-hero::after {
  content:""; pointer-events:none; position:absolute; right:-95px; top:-150px;
  width:480px; height:480px; border-radius:50%;
  border:1px solid rgba(182,154,98,.23);
  box-shadow:0 0 0 42px rgba(182,154,98,.035),0 0 0 94px rgba(182,154,98,.025);
  opacity:.7; z-index:-1;
}
.atlas-kicker { color:var(--gold); font:500 .74rem var(--mono); letter-spacing:.23em; text-transform:uppercase; }
.atlas-hero h1 { margin:.65rem 0 .8rem; line-height:1.07; max-width:730px; }
.atlas-hero p { max-width:650px; color:var(--parchment); opacity:.89; line-height:1.75; }
.atlas-mark { color:var(--gold); font-family:var(--mono); font-size:.75rem; letter-spacing:.11em; }
.atlas-rule { height:1px; background:linear-gradient(90deg,var(--gold),rgba(182,154,98,.06)); margin:1.2rem 0; }
.atlas-section { margin:1.1rem 0 .8rem; color:var(--gold); font:500 .75rem var(--mono); letter-spacing:.16em; text-transform:uppercase; }
.atlas-grid { display:grid; grid-template-columns:repeat(10,minmax(0,1fr)); gap:.5rem; margin:1rem 0; }
.atlas-slot { min-height:48px; display:grid; place-items:center; border:1px solid var(--line); background:rgba(38,56,78,.20); color:var(--soft); font:500 .8rem var(--mono); }
.atlas-slot.filled { border-color:var(--gold); background:rgba(182,154,98,.13); color:var(--ivory); }
.atlas-note { font-size:.8rem; color:var(--soft); }
.atlas-footer { margin-top:2.4rem; padding-top:1rem; border-top:1px solid var(--line); font:400 .71rem var(--mono); color:var(--soft); letter-spacing:.07em; }
@media(max-width:700px) {
 [data-testid="stMainBlockContainer"] { padding:1.2rem 1rem 3rem; }
 .atlas-hero { padding:1.6rem 1.1rem; }
 .atlas-hero::after { width:280px; height:280px; top:-110px; right:-130px; }
 .atlas-grid { grid-template-columns:repeat(5,minmax(0,1fr)); }
 .atlas-slot { min-height:42px; }
 [data-testid="stMetric"] { padding:.8rem; min-height:100px; }
 .stTabs [data-baseweb="tab"] { padding:0 .65rem; }
}
@media (prefers-reduced-motion:reduce) {
 *,*::before,*::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; scroll-behavior:auto!important; }
}
</style>
"""

def aplicar_tema() -> None:
    st.markdown(STYLES, unsafe_allow_html=True)
