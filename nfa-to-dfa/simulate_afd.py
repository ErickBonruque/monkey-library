import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch


# ----------------------- DEFINIÇÃO DO AFD -----------------------

AFD = {
    'inicial': 'Q0',
    'finais': {'Q4', 'Q5', 'Q6', 'Q7'},
    'transicoes': { 
        'Q0': {'0': 'Q1', '1': 'Q0'},
        'Q1': {'0': 'Q2', '1': 'Q3'},
        'Q2': {'0': 'Q4', '1': 'Q3'},
        'Q3': {'0': 'Q5', '1': 'Q0'},
        'Q4': {'0': 'Q4', '1': 'Q6'},
        'Q5': {'0': 'Q4', '1': 'Q6'},
        'Q6': {'0': 'Q5', '1': 'Q7'},
        'Q7': {'0': 'Q5', '1': 'Q7'},
    },
}

# Posições fixas dos estados no diagrama
POS = {
    'Q0': (0, 1), 'Q1': (1, 2), 'Q2': (2, 2), 'Q4': (3, 2),
    'Q3': (1, 0), 'Q5': (2, 0), 'Q6': (3, 0), 'Q7': (4, 1),
}


# ----------------------- CONSTRUÇÃO DO GRAFO -----------------------

def construir_grafo():
    """Cria o grafo combinando símbolos com mesmo destino (ex: '0, 1')."""
    G = nx.DiGraph()
    for origem, trans in AFD['transicoes'].items():
        for simbolo, destino in trans.items():
            if G.has_edge(origem, destino):
                G[origem][destino]['label'] += f', {simbolo}'
            else:
                G.add_edge(origem, destino, label=simbolo)
    return G


# ----------------------- SELF-LOOPS -----------------------

def desenhar_loops(ax, G, transicao_ativa):
    """Desenha self-loops como arcos acima do nó (networkx não renderiza bem)."""
    for u, v, d in G.edges(data=True):
        if u != v:
            continue
        x, y = POS[u]
        ativo = (u, v) == transicao_ativa
        cor = 'red' if ativo else '#64748b'
        lw = 3 if ativo else 1.5

        # Dois pontos próximos + raio grande = arco em formato de loop
        seta = FancyArrowPatch(
            (x - 0.1, y + 0.22), (x + 0.1, y + 0.22),
            connectionstyle='arc3,rad=-2.5',
            arrowstyle='->', mutation_scale=15,
            color=cor, linewidth=lw)
        ax.add_patch(seta)
        ax.text(x, y + 0.62, d['label'], fontsize=10, ha='center')


# ----------------------- DESENHO -----------------------

def desenhar(G, axs, estado, transicao, titulo, historico, sentencas, idx):
    """Redesenha diagrama (esquerda) e painel de info (direita)."""
    ax_grafo, ax_info = axs
    ax_grafo.cla()
    ax_info.cla()

    # --- DIAGRAMA (esquerda) ---
    # Cor: verde=atual, amarelo=aceitação, cinza=normal
    cores = ['#34d399' if n == estado
             else '#fde68a' if n in AFD['finais']
             else '#e2e8f0' for n in G.nodes()]  

    # Arestas normais (sem self-loops — esses são desenhados à parte)
    arestas = [(u, v) for u, v in G.edges() if u != v]
    cores_ar = ['red' if e == transicao else '#64748b' for e in arestas]
    larguras = [3 if e == transicao else 1.5 for e in arestas]
    
    nx.draw_networkx_nodes(G, POS, ax=ax_grafo, node_color=cores,
                           node_size=2200, edgecolors='black', linewidths=2)
    nx.draw_networkx_labels(G, POS, ax=ax_grafo, font_size=11, font_weight='bold')

    nx.draw_networkx_edges(G, POS, ax=ax_grafo, edgelist=arestas,
                           edge_color=cores_ar, width=larguras,
                           connectionstyle='arc3,rad=0.15',
                           arrowsize=20, node_size=2200)
    
    # Rótulos das arestas (posicionados sobre a curva, não na reta)
    for u, v, d in G.edges(data=True):
        if u == v:
            continue
        x1, y1 = POS[u]
        x2, y2 = POS[v]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        # Se aresta bidirecional, desloca o rótulo na direção da curva
        if G.has_edge(v, u):
            dx, dy = x2 - x1, y2 - y1
            comp = (dx**2 + dy**2) ** 0.5
            mx += (dy / comp) * 0.18
            my += (-dx / comp) * 0.18
        ax_grafo.text(mx, my, d['label'], fontsize=10, ha='center', va='center',
                      bbox=dict(facecolor='white', edgecolor='none', alpha=0.8, pad=1))

    # Self-loops desenhados manualmente
    desenhar_loops(ax_grafo, G, transicao)

    # Círculo duplo nos estados de aceitação
    for f in AFD['finais']:
        fx, fy = POS[f]
        ax_grafo.scatter([fx], [fy], s=3000, facecolors='none',
                         edgecolors='black', linewidths=1.5)

    ax_grafo.set_title(titulo, fontsize=12, fontweight='bold', pad=10)
    ax_grafo.axis('off')

    # --- PAINEL DE INFO (direita) ---
    ax_info.axis('off')

    # Lista de sentenças
    ax_info.text(0.05, 0.97, 'Sentenças:', fontsize=11, fontweight='bold',
                 va='top', transform=ax_info.transAxes)
    for i, (s, res) in enumerate(sentencas):
        marca = '▶ ' if i == idx else '  '
        cor = '#15803d' if res == 'ACEITA' else '#b91c1c' if res == 'REJEITADA' else 'black'
        ax_info.text(0.05, 0.88 - i * 0.09,
                     f'{marca}[{i+1}] "{s}"  {res}',
                     fontsize=10, color=cor,
                     fontweight='bold' if i == idx else 'normal',
                     va='top', transform=ax_info.transAxes, fontfamily='monospace')

    # Histórico de transições
    sep_y = 0.88 - len(sentencas) * 0.09 - 0.05
    ax_info.plot([0.02, 0.98], [sep_y, sep_y], color='#cbd5e1',
                 linewidth=1, transform=ax_info.transAxes, clip_on=False)
    ax_info.text(0.05, sep_y - 0.03, 'Transições:', fontsize=11,
                 fontweight='bold', va='top', transform=ax_info.transAxes)
    for j, linha in enumerate(historico[-8:]):
        ax_info.text(0.05, sep_y - 0.10 - j * 0.08, linha, fontsize=9,
                     va='top', transform=ax_info.transAxes, fontfamily='monospace')

    plt.draw()


# ----------------------- SIMULAÇÃO -----------------------

def simular(G, axs, sentenca, sentencas, idx):
    """Processa a sentença passo a passo, esperando input a cada símbolo."""
    estado = AFD['inicial']
    historico = [f'Início em {estado}']
    sentencas[idx] = (sentenca, '')

    desenhar(G, axs, estado, None,
             f'Sentença "{sentenca}" — início em {estado}', historico, sentencas, idx)
    plt.waitforbuttonpress()

    for i, simbolo in enumerate(sentenca):
        proximo = AFD['transicoes'][estado][simbolo]
        historico.append(f"δ({estado}, '{simbolo}') = {proximo}  [{i+1}/{len(sentenca)}]")
        desenhar(G, axs, proximo, (estado, proximo),
                 f"Lendo '{simbolo}'  ({i+1}/{len(sentenca)})   {estado} → {proximo}",
                 historico, sentencas, idx)
        plt.waitforbuttonpress()
        estado = proximo

    aceita = estado in AFD['finais']
    resultado = 'ACEITA ✓' if aceita else 'REJEITADA ✗'
    historico.append(f'>>> {resultado}')
    sentencas[idx] = (sentenca, resultado.split()[0])
    desenhar(G, axs, estado, None,
             f'"{sentenca}" — {resultado}  (final: {estado})', historico, sentencas, idx)
    return aceita


# ----------------------- PROGRAMA PRINCIPAL -----------------------

def main():
    with open('sentencas.txt', encoding='utf-8') as f:
        sentencas = [linha.strip() for linha in f if linha.strip()]

    G = construir_grafo()
    fig, axs = plt.subplots(1, 2, figsize=(14, 6),
                            gridspec_kw={'width_ratios': [2, 1]})
    fig.canvas.manager.set_window_title('Simulador de AFD')
    fig.patch.set_facecolor('#f8fafc')

    lista = [(s, '') for s in sentencas]

    for i, s in enumerate(sentencas):
        simular(G, axs, s, lista, i)
        if i < len(sentencas) - 1:
            plt.waitforbuttonpress()

    plt.waitforbuttonpress()
    plt.close()


if __name__ == '__main__':
    main()