# HATEOAS Explorer — Nível 3 do Modelo de Maturidade de Richardson

Demonstração interativa e didática do **HATEOAS** (*Hypermedia As The Engine Of Application State*), o estágio mais maduro do Modelo de Maturidade de Richardson.

## O que é HATEOAS?

No **Nível 3** do Modelo de Richardson, as respostas da API incluem **links dinâmicos** que indicam ao cliente quais ações estão disponíveis, baseadas no **estado atual** do recurso. O front-end não precisa conhecer URLs hardcoded — ele simplesmente segue os links que a API retorna.

## O que este projeto demonstra

- **API Bancária** com operações de depósito, saque, transferência e empréstimo
- **Links HATEOAS dinâmicos** que mudam conforme o saldo e status da conta
- **Front-end sem lógica de negócio** — renderiza botões exclusivamente a partir dos `_links` da API
- **Comparação visual** entre Nível 2 e Nível 3

### Exemplo: Como o estado muda os links

| Estado da Conta | Links Retornados |
|---|---|
| Saldo positivo | ✅ sacar, ✅ transferir, ✅ depositar, ✅ extrato |
| Saldo zero | ❌ sacar, ❌ transferir, ✅ depositar, ✅ empréstimo |
| Conta inativa | ❌ tudo, ✅ extrato, ✅ reativar |

## Como executar

### 1. Backend (API)

```bash
cd backend
npm install
npm start
```

A API estará disponível em `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npx -y serve -l 3001 .
```

Acesse `http://localhost:3001` no navegador.

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Raiz da API |
| `GET` | `/contas` | Listar todas as contas |
| `GET` | `/contas/:id` | Detalhes de uma conta (com HATEOAS) |
| `GET` | `/contas/:id/extrato` | Extrato da conta |
| `POST` | `/contas/:id/depositar` | Realizar depósito |
| `POST` | `/contas/:id/sacar` | Realizar saque |
| `POST` | `/contas/:id/transferir` | Transferência entre contas |
| `POST` | `/contas/:id/emprestimo` | Solicitar empréstimo |
| `POST` | `/contas/:id/desativar` | Desativar conta |
| `POST` | `/contas/:id/reativar` | Reativar conta |
| `GET` | `/comparacao/:id` | Comparar Nível 2 vs Nível 3 |

## Dica para apresentação

Foque na palavra **Estado** da sigla HATEOAS:
- A API retorna links **baseados no estado atual** do recurso
- O front-end renderiza apenas o que a API permite
- Tira a responsabilidade de lógica condicional do front-end
- Sistema altamente **desacoplado**

## Tecnologias

- **Backend:** Node.js + Express
- **Frontend:** HTML + CSS + JavaScript puro
- **Conceito:** HATEOAS / Nível 3 Richardson
