const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;

// ============================================================
// DADOS SIMULADOS - Banco de dados em memória
// ============================================================

// Contas bancárias simuladas
const contas = {
  1: { id: 1, titular: 'Maria Silva', saldo: 5200.00, tipo: 'corrente', ativa: true },
  2: { id: 2, titular: 'João Santos', saldo: 0.00, tipo: 'corrente', ativa: true },
  3: { id: 3, titular: 'Ana Oliveira', saldo: -150.00, tipo: 'corrente', ativa: true },
  4: { id: 4, titular: 'Carlos Lima', saldo: 850.00, tipo: 'poupanca', ativa: false },
};

// Histórico de transações
const transacoes = {
  1: [
    { id: 't1', tipo: 'deposito', valor: 3000.00, data: '2026-04-01', descricao: 'Salário' },
    { id: 't2', tipo: 'saque', valor: 800.00, data: '2026-04-03', descricao: 'Pagamento aluguel' },
    { id: 't3', tipo: 'deposito', valor: 3000.00, data: '2026-04-05', descricao: 'Freelance' },
  ],
  2: [
    { id: 't4', tipo: 'saque', valor: 1000.00, data: '2026-04-02', descricao: 'Emergência médica' },
  ],
  3: [
    { id: 't5', tipo: 'saque', valor: 500.00, data: '2026-04-01', descricao: 'Compras' },
  ],
  4: [
    { id: 't6', tipo: 'deposito', valor: 850.00, data: '2026-03-15', descricao: 'Reserva' },
  ],
};

// Pedidos de empréstimo
const emprestimos = {};

// ============================================================
// FUNÇÕES AUXILIARES - Geração de links HATEOAS
// ============================================================

/**
 * Gera os links HATEOAS com base no estado atual da conta.
 * ESTE É O PONTO CENTRAL DA DEMONSTRAÇÃO:
 * Os links mudam dinamicamente de acordo com o estado do recurso.
 */
function gerarLinksHATEOAS(conta) {
  const links = {
    // Link obrigatório: referência a si mesmo
    self: {
      href: `${BASE_URL}/contas/${conta.id}`,
      method: 'GET',
      title: 'Ver detalhes desta conta'
    },
    // Extrato está sempre disponível
    extrato: {
      href: `${BASE_URL}/contas/${conta.id}/extrato`,
      method: 'GET',
      title: 'Consultar extrato da conta'
    },
  };

  // Se a conta está inativa, só permite reativar
  if (!conta.ativa) {
    links.reativar = {
      href: `${BASE_URL}/contas/${conta.id}/reativar`,
      method: 'POST',
      title: 'Reativar esta conta'
    };
    return links;
  }

  // Depósito sempre está disponível para contas ativas
  links.depositar = {
    href: `${BASE_URL}/contas/${conta.id}/depositar`,
    method: 'POST',
    title: 'Realizar um depósito',
    body: { valor: 'number' }
  };

  // Saque e transferência somente se o saldo for maior que zero
  if (conta.saldo > 0) {
    links.sacar = {
      href: `${BASE_URL}/contas/${conta.id}/sacar`,
      method: 'POST',
      title: 'Realizar um saque',
      body: { valor: 'number' }
    };
    links.transferir = {
      href: `${BASE_URL}/contas/${conta.id}/transferir`,
      method: 'POST',
      title: 'Transferir para outra conta',
      body: { contaDestino: 'number', valor: 'number' }
    };
  }

  // Empréstimo disponível apenas se o saldo for zero ou negativo
  if (conta.saldo <= 0) {
    links.solicitar_emprestimo = {
      href: `${BASE_URL}/contas/${conta.id}/emprestimo`,
      method: 'POST',
      title: 'Solicitar um empréstimo',
      body: { valor: 'number' }
    };
  }

  // Desativar conta está disponível para contas ativas
  links.desativar = {
    href: `${BASE_URL}/contas/${conta.id}/desativar`,
    method: 'POST',
    title: 'Desativar esta conta'
  };

  return links;
}

// ============================================================
// ROTAS DA API
// ============================================================

// Rota raiz - ponto de entrada da API (como numa API HATEOAS real)
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Bancária - Demonstração HATEOAS (Nível 3 Richardson)',
    versao: '1.0.0',
    _links: {
      self: { href: `${BASE_URL}/`, method: 'GET', title: 'Raiz da API' },
      contas: { href: `${BASE_URL}/contas`, method: 'GET', title: 'Listar todas as contas' },
    }
  });
});

// Listar todas as contas
app.get('/contas', (req, res) => {
  const lista = Object.values(contas).map(conta => ({
    id: conta.id,
    titular: conta.titular,
    saldo: conta.saldo,
    tipo: conta.tipo,
    ativa: conta.ativa,
    _links: {
      self: {
        href: `${BASE_URL}/contas/${conta.id}`,
        method: 'GET',
        title: `Ver detalhes da conta de ${conta.titular}`
      },
    }
  }));

  res.json({
    total: lista.length,
    contas: lista,
    _links: {
      self: { href: `${BASE_URL}/contas`, method: 'GET', title: 'Lista de contas' },
    }
  });
});

// Detalhes de uma conta específica (com links HATEOAS dinâmicos)
app.get('/contas/:id', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) {
    return res.status(404).json({
      erro: 'Conta não encontrada',
      _links: {
        contas: { href: `${BASE_URL}/contas`, method: 'GET', title: 'Voltar para lista de contas' }
      }
    });
  }

  res.json({
    ...conta,
    _links: gerarLinksHATEOAS(conta)
  });
});

// Consultar extrato
app.get('/contas/:id/extrato', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) {
    return res.status(404).json({ erro: 'Conta não encontrada' });
  }

  const historicoTransacoes = transacoes[conta.id] || [];

  res.json({
    contaId: conta.id,
    titular: conta.titular,
    saldoAtual: conta.saldo,
    transacoes: historicoTransacoes,
    _links: {
      self: { href: `${BASE_URL}/contas/${conta.id}/extrato`, method: 'GET', title: 'Este extrato' },
      conta: { href: `${BASE_URL}/contas/${conta.id}`, method: 'GET', title: 'Voltar para a conta' },
    }
  });
});

// Realizar depósito
app.post('/contas/:id/depositar', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });
  if (!conta.ativa) return res.status(400).json({ erro: 'Conta inativa' });

  const { valor } = req.body;
  if (!valor || valor <= 0) {
    return res.status(400).json({ erro: 'Valor de depósito inválido' });
  }

  conta.saldo += valor;

  // Registrar a transação
  if (!transacoes[conta.id]) transacoes[conta.id] = [];
  transacoes[conta.id].push({
    id: `t${Date.now()}`,
    tipo: 'deposito',
    valor,
    data: new Date().toISOString().split('T')[0],
    descricao: 'Depósito via API'
  });

  res.json({
    mensagem: `Depósito de R$ ${valor.toFixed(2)} realizado com sucesso!`,
    saldoAnterior: (conta.saldo - valor).toFixed(2),
    saldoAtual: conta.saldo.toFixed(2),
    _links: gerarLinksHATEOAS(conta)
  });
});

// Realizar saque
app.post('/contas/:id/sacar', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });
  if (!conta.ativa) return res.status(400).json({ erro: 'Conta inativa' });

  const { valor } = req.body;
  if (!valor || valor <= 0) {
    return res.status(400).json({ erro: 'Valor de saque inválido' });
  }
  if (valor > conta.saldo) {
    return res.status(400).json({
      erro: 'Saldo insuficiente',
      saldoDisponivel: conta.saldo,
      _links: gerarLinksHATEOAS(conta)
    });
  }

  conta.saldo -= valor;

  if (!transacoes[conta.id]) transacoes[conta.id] = [];
  transacoes[conta.id].push({
    id: `t${Date.now()}`,
    tipo: 'saque',
    valor,
    data: new Date().toISOString().split('T')[0],
    descricao: 'Saque via API'
  });

  res.json({
    mensagem: `Saque de R$ ${valor.toFixed(2)} realizado com sucesso!`,
    saldoAnterior: (conta.saldo + valor).toFixed(2),
    saldoAtual: conta.saldo.toFixed(2),
    _links: gerarLinksHATEOAS(conta)
  });
});

// Transferir entre contas
app.post('/contas/:id/transferir', (req, res) => {
  const contaOrigem = contas[req.params.id];
  if (!contaOrigem) return res.status(404).json({ erro: 'Conta de origem não encontrada' });
  if (!contaOrigem.ativa) return res.status(400).json({ erro: 'Conta de origem inativa' });

  const { contaDestino, valor } = req.body;
  const destino = contas[contaDestino];

  if (!destino) return res.status(404).json({ erro: 'Conta de destino não encontrada' });
  if (!destino.ativa) return res.status(400).json({ erro: 'Conta de destino inativa' });
  if (!valor || valor <= 0) return res.status(400).json({ erro: 'Valor inválido' });
  if (valor > contaOrigem.saldo) {
    return res.status(400).json({
      erro: 'Saldo insuficiente para transferência',
      _links: gerarLinksHATEOAS(contaOrigem)
    });
  }

  contaOrigem.saldo -= valor;
  destino.saldo += valor;

  const dataHoje = new Date().toISOString().split('T')[0];

  if (!transacoes[contaOrigem.id]) transacoes[contaOrigem.id] = [];
  transacoes[contaOrigem.id].push({
    id: `t${Date.now()}`,
    tipo: 'transferencia_enviada',
    valor,
    data: dataHoje,
    descricao: `Transferência para ${destino.titular}`
  });

  if (!transacoes[destino.id]) transacoes[destino.id] = [];
  transacoes[destino.id].push({
    id: `t${Date.now() + 1}`,
    tipo: 'transferencia_recebida',
    valor,
    data: dataHoje,
    descricao: `Transferência de ${contaOrigem.titular}`
  });

  res.json({
    mensagem: `Transferência de R$ ${valor.toFixed(2)} para ${destino.titular} realizada!`,
    saldoAtual: contaOrigem.saldo.toFixed(2),
    _links: gerarLinksHATEOAS(contaOrigem)
  });
});

// Solicitar empréstimo
app.post('/contas/:id/emprestimo', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });
  if (!conta.ativa) return res.status(400).json({ erro: 'Conta inativa' });

  const { valor } = req.body;
  if (!valor || valor <= 0 || valor > 10000) {
    return res.status(400).json({ erro: 'Valor de empréstimo inválido (máx: R$ 10.000)' });
  }

  conta.saldo += valor;

  if (!transacoes[conta.id]) transacoes[conta.id] = [];
  transacoes[conta.id].push({
    id: `t${Date.now()}`,
    tipo: 'emprestimo',
    valor,
    data: new Date().toISOString().split('T')[0],
    descricao: 'Empréstimo aprovado'
  });

  emprestimos[conta.id] = {
    valor,
    dataAprovacao: new Date().toISOString(),
    parcelas: 12,
    valorParcela: (valor * 1.15 / 12).toFixed(2)
  };

  res.json({
    mensagem: `Empréstimo de R$ ${valor.toFixed(2)} aprovado!`,
    detalhes: emprestimos[conta.id],
    saldoAtual: conta.saldo.toFixed(2),
    _links: gerarLinksHATEOAS(conta)
  });
});

// Desativar conta
app.post('/contas/:id/desativar', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });

  conta.ativa = false;

  res.json({
    mensagem: `Conta de ${conta.titular} desativada com sucesso.`,
    ...conta,
    _links: gerarLinksHATEOAS(conta)
  });
});

// Reativar conta
app.post('/contas/:id/reativar', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });

  conta.ativa = true;

  res.json({
    mensagem: `Conta de ${conta.titular} reativada com sucesso!`,
    ...conta,
    _links: gerarLinksHATEOAS(conta)
  });
});

// ============================================================
// ROTA COMPARATIVA - Mostra a diferença entre Nível 2 e Nível 3
// ============================================================
app.get('/comparacao/:id', (req, res) => {
  const conta = contas[req.params.id];
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });

  res.json({
    nivel2: {
      descricao: 'Nível 2 - Apenas dados (sem HATEOAS)',
      resposta: {
        id: conta.id,
        titular: conta.titular,
        saldo: conta.saldo,
        tipo: conta.tipo,
        ativa: conta.ativa
      }
    },
    nivel3: {
      descricao: 'Nível 3 - Dados + Links HATEOAS (hipermídia)',
      resposta: {
        id: conta.id,
        titular: conta.titular,
        saldo: conta.saldo,
        tipo: conta.tipo,
        ativa: conta.ativa,
        _links: gerarLinksHATEOAS(conta)
      }
    }
  });
});

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🏦 API Bancária HATEOAS rodando em ${BASE_URL}`);
  console.log(`\n📋 Rotas disponíveis:`);
  console.log(`   GET  ${BASE_URL}/            → Raiz da API`);
  console.log(`   GET  ${BASE_URL}/contas       → Listar contas`);
  console.log(`   GET  ${BASE_URL}/contas/:id   → Detalhes de uma conta`);
  console.log(`   GET  ${BASE_URL}/comparacao/:id → Comparar Nível 2 vs Nível 3`);
  console.log(`\n🎓 Exemplo didático pronto para apresentação!\n`);
});
