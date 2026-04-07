// ============================================================
// HATEOAS Explorer — Lógica do Frontend
// O front-end renderiza ações APENAS com base nos _links da API
// ============================================================

const API_BASE = 'http://localhost:3333';

// Estado local da aplicação
let contaAtual = null;
let dadosAtuais = null;

// ─── Elementos DOM ─────────────────────────────────────────
const accountsGrid = document.getElementById('accountsGrid');
const explorerSection = document.getElementById('explorerSection');
const detailHeader = document.getElementById('detailHeader');
const actionsGrid = document.getElementById('actionsGrid');
const jsonBody = document.getElementById('jsonBody');
const jsonEndpoint = document.getElementById('jsonEndpoint');
const resultSection = document.getElementById('resultSection');
const resultMessage = document.getElementById('resultMessage');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const bgParticles = document.getElementById('bgParticles');

// ─── Inicialização ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  criarParticulas();
  carregarContas();
  configurarModal();
  configurarCopiarJson();
});

// ─── Partículas de fundo decorativas ───────────────────────
function criarParticulas() {
  const cores = ['#6366f1', '#a855f7', '#22d3ee', '#34d399'];
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 300 + 100;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.background = cores[i % cores.length];
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${15 + Math.random() * 15}s`;
    bgParticles.appendChild(particle);
  }
}

// ─── Carregar lista de contas ──────────────────────────────
async function carregarContas() {
  try {
    const res = await fetch(`${API_BASE}/contas`);
    const data = await res.json();

    accountsGrid.innerHTML = '';
    data.contas.forEach(conta => {
      const card = criarCardConta(conta);
      accountsGrid.appendChild(card);
    });
  } catch (err) {
    accountsGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">
        <p style="font-size: 1.2rem; margin-bottom: 8px;">⚠️ API não conectada</p>
        <p>Execute <code style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">cd backend && npm install && npm start</code> primeiro.</p>
      </div>
    `;
  }
}

// ─── Criar card de conta ───────────────────────────────────
function criarCardConta(conta) {
  const card = document.createElement('div');
  card.classList.add('account-card');
  card.setAttribute('data-id', conta.id);

  let balanceClass = 'positive';
  if (conta.saldo === 0) balanceClass = 'zero';
  if (conta.saldo < 0) balanceClass = 'negative';

  const statusClass = conta.ativa ? 'active-status' : 'inactive-status';
  const statusText = conta.ativa ? 'Ativa' : 'Inativa';

  card.innerHTML = `
    <div class="account-name">${conta.titular}</div>
    <div class="account-type">${conta.tipo}</div>
    <div class="account-balance ${balanceClass}">R$ ${formatarMoeda(conta.saldo)}</div>
    <div class="account-status ${statusClass}">
      <span class="status-dot"></span>
      ${statusText}
    </div>
  `;

  card.addEventListener('click', () => selecionarConta(conta.id));
  return card;
}

// ─── Selecionar e carregar detalhes de uma conta ───────────
async function selecionarConta(id) {
  // Marcar card ativo
  document.querySelectorAll('.account-card').forEach(c => c.classList.remove('active'));
  const cardAtivo = document.querySelector(`.account-card[data-id="${id}"]`);
  if (cardAtivo) cardAtivo.classList.add('active');

  contaAtual = id;
  resultSection.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/contas/${id}`);
    const data = await res.json();
    dadosAtuais = data;

    renderizarDetalhes(data);
    renderizarAcoes(data._links);
    renderizarJson(data, `GET /contas/${id}`);

    explorerSection.style.display = 'block';
    explorerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error('Erro ao carregar conta:', err);
  }
}

// ─── Renderizar header dos detalhes ────────────────────────
function renderizarDetalhes(data) {
  let balanceClass = 'positive';
  if (data.saldo === 0) balanceClass = 'zero';
  if (data.saldo < 0) balanceClass = 'negative';

  detailHeader.innerHTML = `
    <h2>${data.titular}</h2>
    <div class="detail-meta">
      <span>ID: ${data.id}</span>
      <span>Tipo: ${data.tipo}</span>
      <span>Status: ${data.ativa ? '🟢 Ativa' : '🔴 Inativa'}</span>
    </div>
    <div class="detail-balance ${balanceClass}">R$ ${formatarMoeda(data.saldo)}</div>
  `;
}

// ─── Renderizar botões de ação a partir dos _links ─────────
// ESTE É O PONTO-CHAVE DA DEMONSTRAÇÃO:
// Nenhuma lógica de negócio aqui. Apenas mapeamos os links para botões.
function renderizarAcoes(links) {
  actionsGrid.innerHTML = '';

  // Mapeamento de nomes de ações para ícones e labels amigáveis
  const acaoConfig = {
    self:                 { icon: '🔗', label: 'Ver Conta' },
    extrato:              { icon: '📋', label: 'Ver Extrato' },
    depositar:            { icon: '💵', label: 'Depositar' },
    sacar:                { icon: '💸', label: 'Sacar' },
    transferir:           { icon: '🔄', label: 'Transferir' },
    solicitar_emprestimo: { icon: '🏦', label: 'Solicitar Empréstimo' },
    desativar:            { icon: '🔒', label: 'Desativar Conta' },
    reativar:             { icon: '🔓', label: 'Reativar Conta' },
  };

  Object.entries(links).forEach(([nome, link]) => {
    const config = acaoConfig[nome] || { icon: '🔗', label: nome };
    const btn = document.createElement('button');
    btn.classList.add('action-btn');
    btn.setAttribute('data-action', nome);

    const methodClass = (link.method || 'GET').toLowerCase();

    btn.innerHTML = `
      <span class="action-method ${methodClass}">${link.method || 'GET'}</span>
      <span>${config.icon} ${config.label}</span>
    `;

    btn.title = link.title || '';
    btn.addEventListener('click', () => executarAcao(nome, link));
    actionsGrid.appendChild(btn);
  });
}

// ─── Executar ação com base no link HATEOAS ────────────────
async function executarAcao(nome, link) {
  // Ações GET são executadas diretamente
  if (link.method === 'GET') {
    try {
      const res = await fetch(link.href);
      const data = await res.json();
      dadosAtuais = data;

      const path = link.href.replace(API_BASE, '');
      renderizarJson(data, `GET ${path}`);

      // Se for a conta principal, atualizar detalhes e ações
      if (data._links) {
        if (data.titular) renderizarDetalhes(data);
        renderizarAcoes(data._links);
      }

      // Para extrato, mostrar resultado
      if (nome === 'extrato') {
        mostrarResultado(formatarExtrato(data), false);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
    return;
  }

  // Ações POST: abrir modal para coletar dados
  if (link.method === 'POST') {
    if (link.body) {
      abrirModal(nome, link);
    } else {
      // Ações sem body (como desativar/reativar)
      await executarPost(link.href, {}, nome);
    }
  }
}

// ─── Executar requisição POST ──────────────────────────────
async function executarPost(url, body, nomeAcao) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    dadosAtuais = data;

    const path = url.replace(API_BASE, '');
    renderizarJson(data, `POST ${path}`);

    if (data.erro) {
      mostrarResultado(`❌ ${data.erro}`, true);
    } else {
      mostrarResultado(data.mensagem || 'Ação realizada com sucesso!', false);
    }

    // Atualizar ações com novos links HATEOAS
    if (data._links) {
      renderizarAcoes(data._links);
    }

    // Recarregar contas para refletir mudanças nos cards
    carregarContas();

    // Atualizar header se a conta mudou
    if (contaAtual) {
      const resConta = await fetch(`${API_BASE}/contas/${contaAtual}`);
      const contaData = await resConta.json();
      renderizarDetalhes(contaData);
    }
  } catch (err) {
    mostrarResultado(`❌ Erro de conexão: ${err.message}`, true);
  }
}

// ─── Modal para ações com body ─────────────────────────────
function abrirModal(nome, link) {
  const titulos = {
    depositar: 'Realizar Depósito',
    sacar: 'Realizar Saque',
    transferir: 'Transferir Valor',
    solicitar_emprestimo: 'Solicitar Empréstimo',
  };

  modalTitle.textContent = titulos[nome] || nome;
  modalBody.innerHTML = '';

  // Gerar campos do formulário com base no body do link
  if (link.body) {
    Object.entries(link.body).forEach(([campo, tipo]) => {
      const group = document.createElement('div');
      group.classList.add('form-group');

      const labels = {
        valor: 'Valor (R$)',
        contaDestino: 'Conta Destino (ID)',
      };

      group.innerHTML = `
        <label for="modal-${campo}">${labels[campo] || campo}</label>
        <input 
          type="${tipo === 'number' ? 'number' : 'text'}" 
          id="modal-${campo}" 
          name="${campo}" 
          placeholder="${campo === 'valor' ? 'Ex: 500.00' : campo === 'contaDestino' ? 'Ex: 2' : ''}"
          step="${tipo === 'number' ? '0.01' : ''}"
          min="${tipo === 'number' ? '0.01' : ''}"
        >
      `;
      modalBody.appendChild(group);
    });
  }

  // Configurar confirmação
  modalConfirm.onclick = async () => {
    const body = {};
    if (link.body) {
      Object.keys(link.body).forEach(campo => {
        const input = document.getElementById(`modal-${campo}`);
        body[campo] = link.body[campo] === 'number' ? parseFloat(input.value) : input.value;
      });
    }
    fecharModal();
    await executarPost(link.href, body, nome);
  };

  modalOverlay.classList.add('open');
}

function fecharModal() {
  modalOverlay.classList.remove('open');
}

function configurarModal() {
  modalClose.addEventListener('click', fecharModal);
  modalCancel.addEventListener('click', fecharModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
  });
}

// ─── Renderizar JSON com syntax highlighting ───────────────
function renderizarJson(data, endpoint) {
  jsonEndpoint.textContent = endpoint;

  const jsonStr = JSON.stringify(data, null, 2);
  const highlighted = colorirJson(jsonStr);
  jsonBody.innerHTML = `<code>${highlighted}</code>`;
}

function colorirJson(json) {
  // Flag para saber se estamos dentro do bloco _links
  let insideLinks = false;
  let braceCount = 0;

  const lines = json.split('\n');
  const coloredLines = lines.map(line => {
    // Detectar início do bloco _links
    if (line.includes('"_links"')) {
      insideLinks = true;
      braceCount = 0;
    }

    if (insideLinks) {
      // Contar chaves para saber quando o bloco _links fecha
      for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      if (braceCount <= 0 && line.includes('}')) {
        insideLinks = false;
      }
    }

    // Aplicar coloração
    let colored = line
      // Chaves JSON
      .replace(/"([^"]+)"(?=\s*:)/g, '<span class="json-key">"$1"</span>')
      // Strings
      .replace(/:\s*"([^"]*)"(,?)/g, ': <span class="json-string">"$1"</span>$2')
      // Números
      .replace(/:\s*(-?\d+\.?\d*)(,?)/g, ': <span class="json-number">$1</span>$2')
      // Booleans
      .replace(/:\s*(true|false)(,?)/g, ': <span class="json-bool">$1</span>$2')
      // Null
      .replace(/:\s*(null)(,?)/g, ': <span class="json-null">$1</span>$2');

    // Highlight do bloco _links
    if (line.includes('"_links"') || (insideLinks && !line.includes('"_links"'))) {
      colored = `<span class="json-links-block">${colored}</span>`;
    }

    return colored;
  });

  return coloredLines.join('\n');
}

// ─── Mostrar resultado de ação ─────────────────────────────
function mostrarResultado(mensagem, isError) {
  resultSection.style.display = 'block';
  resultMessage.textContent = mensagem;
  resultMessage.className = `result-message ${isError ? 'error' : ''}`;
}

// ─── Formatar extrato de forma legível ─────────────────────
function formatarExtrato(data) {
  if (!data.transacoes || data.transacoes.length === 0) {
    return '📋 Nenhuma transação registrada.';
  }

  let texto = `📋 Extrato de ${data.titular}\n`;
  texto += `Saldo atual: R$ ${formatarMoeda(data.saldoAtual)}\n\n`;

  data.transacoes.forEach(t => {
    const sinal = t.tipo.includes('saque') || t.tipo.includes('enviada') ? '-' : '+';
    texto += `${t.data} | ${sinal} R$ ${formatarMoeda(t.valor)} | ${t.descricao}\n`;
  });

  return texto;
}

// ─── Formatar valor monetário ──────────────────────────────
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Copiar JSON ───────────────────────────────────────────
function configurarCopiarJson() {
  copyJsonBtn.addEventListener('click', () => {
    if (dadosAtuais) {
      navigator.clipboard.writeText(JSON.stringify(dadosAtuais, null, 2));
      copyJsonBtn.style.color = 'var(--accent-emerald)';
      setTimeout(() => {
        copyJsonBtn.style.color = '';
      }, 1500);
    }
  });
}
