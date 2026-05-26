# BanheiroUTFPR — Descritivo do Projeto

**Universidade Tecnológica Federal do Paraná — Câmpus Santa Helena**
Tecnologia em Desenvolvimento de Sistemas

**Sistema Inteligente de Avaliação de Banheiros do Campus**

- **Aluno:** Erick Bonruque
- **RA:** 2587246
- **Ano:** 2026

---

## 1. Descrição do Projeto

O **BanheiroUTFPR** é um sistema web colaborativo e inteligente desenvolvido para que os alunos da Universidade Tecnológica Federal do Paraná possam avaliar e consultar a qualidade dos banheiros disponíveis nos câmpus. O sistema permite que usuários cadastrados atribuam notas em 7 critérios distintos (limpeza, cheiro, papel higiênico, estado das portas, iluminação, silêncio e movimentação), deixem comentários, acompanhem rankings e consultem insights inteligentes gerados a partir dos dados coletados.

O projeto é composto por dois módulos:

- **API RESTful** desenvolvida com **Node.js** e **Express**, responsável pela lógica de negócio, persistência dos dados em **MongoDB** e processamento de inteligência.
- **Aplicação frontend** em **React**, que proporciona uma interface moderna, responsiva e intuitiva.

Um diferencial do sistema é a **modelagem flexível de localização**: nem todo banheiro de um câmpus universitário está dentro de um prédio com andares definidos. O BanheiroUTFPR suporta banheiros em áreas externas, containers provisórios, ginásios, bibliotecas e qualquer outro tipo de local, tornando-o utilizável em qualquer câmpus da UTFPR.

### 1.1 Objetivo

Criar uma plataforma funcional e inteligente que incentive a melhoria das instalações sanitárias do campus através do feedback coletivo dos alunos, oferecendo análises de dados como melhores horários para uso, tendências de qualidade e alertas automáticos, ao mesmo tempo em que demonstra domínio das tecnologias de desenvolvimento web full stack.

### 1.2 Funcionalidades Principais

- Cadastro e autenticação de usuários com JWT (login/registro)
- Painel administrativo para cadastro de câmpus, localizações e banheiros
- Sistema de avaliação com 7 critérios (notas de 1 a 5 estrelas cada)
- Critérios de silêncio e movimentação com registro de horário
- Comentários e fotos nas avaliações
- Ranking geral e por critério dos banheiros
- Dashboard com gráficos e estatísticas das avaliações
- Filtros por câmpus, localização, tipo de banheiro e acessibilidade
- Módulo de inteligência: análise temporal de movimentação por faixa horária
- Módulo de inteligência: tendência de qualidade (melhorando/piorando)
- Módulo de inteligência: alertas automáticos para banheiros críticos
- Módulo de inteligência: recomendação do melhor horário para usar cada banheiro
- Sistema de medalhas e conquistas (Trono de Ouro, Zona de Risco, etc.)
- Perfil do usuário com histórico de avaliações

### 1.3 Regras de Negócio

- Apenas usuários autenticados podem avaliar banheiros
- Cada usuário pode avaliar o mesmo banheiro apenas uma vez por dia
- A nota média do banheiro é recalculada automaticamente a cada nova avaliação
- O horário da avaliação é registrado automaticamente para análise temporal
- Somente administradores podem cadastrar, editar e remover banheiros, localizações e câmpus
- Banheiros com nota média abaixo de **2.0** recebem alerta visual de **"Zona de Risco"**
- Banheiros com nota média acima de **4.5** recebem medalha de **"Trono de Ouro"**
- Insights são gerados periodicamente via job agendado (**node-cron**)

---

## 2. Classes / Entidades do Projeto

O sistema é composto por sete entidades que representam o domínio do negócio. A modelagem utiliza uma hierarquia flexível (**Campus → Localização → Banheiro**) para suportar diferentes estruturas físicas entre câmpus, além de uma entidade dedicada para os insights gerados pelo módulo de inteligência.

### User

**Atributos:**
- `id`
- `nome`
- `email`
- `senha` (hash)
- `role` (admin/user)
- `avatar`
- `dataCriacao`

**Descrição:** Usuários do sistema. Alunos avaliam banheiros; administradores gerenciam o cadastro. Autenticação e autorização via JWT.

### Campus

**Atributos:**
- `id`
- `nome`
- `cidade`
- `estado`
- `ativo`

**Descrição:** Representa um câmpus da UTFPR. Permite que o sistema seja utilizado em múltiplos câmpus da universidade.

### Localizacao

**Atributos:**
- `id`
- `campusId`
- `tipo` (predio / bloco / area_externa / container / ginasio / biblioteca / outro)
- `nome`
- `descricao`
- `ativo`

**Descrição:** Modelo flexível de localização. Nem todo banheiro fica em um prédio com andar; pode ser uma área externa, container provisório, ginásio, etc.

### Banheiro

**Atributos:**
- `id`
- `localizacaoId`
- `identificador`
- `andar` (opcional)
- `tipo` (M / F / Unissex / PCD)
- `descricao`
- `foto`
- `qtdCabines`
- `acessivel`
- `notaMedia`
- `totalAvaliacoes`
- `ativo`

**Descrição:** Cadastro dos banheiros. Vinculado a uma Localização com andar opcional. O campo `identificador` permite nomes livres como *"Ao lado do auditório"*.

### Avaliacao

**Atributos:**
- `id`
- `userId`
- `banheiroId`
- `limpeza` (1-5)
- `cheiro` (1-5)
- `papelHigienico` (1-5)
- `estadoPortas` (1-5)
- `iluminacao` (1-5)
- `silencio` (1-5)
- `movimentacao` (1-5)
- `notaGeral` (calculada)
- `comentario`
- `foto`
- `dataAvaliacao`
- `horarioAvaliacao`

**Descrição:** Avaliação com 7 critérios. Armazena data e horário separados para análise temporal (ex: cruzar notas de movimentação por faixa horária).

### Comentario

**Atributos:**
- `id`
- `userId`
- `banheiroId`
- `texto`
- `dataCriacao`

**Descrição:** Comentários livres dos usuários sobre os banheiros, funcionando como um fórum de discussão por banheiro.

### Insight

**Atributos:**
- `id`
- `banheiroId`
- `tipo` (melhor_horario / pico / tendencia / alerta)
- `titulo`
- `descricao`
- `dados` (JSON)
- `periodo`
- `geradoEm`

**Descrição:** Insights gerados automaticamente pelo módulo de inteligência. Armazena análises como melhor horário para uso, tendências de qualidade e alertas.

### 2.1 Diagrama de Relacionamento

- **Campus (1) → (N) Localização:** Um campus possui várias localizações.
- **Localização (1) → (N) Banheiro:** Uma localização pode conter vários banheiros.
- **User (1) → (N) Avaliação:** Um usuário pode fazer várias avaliações.
- **User (1) → (N) Comentário:** Um usuário pode fazer vários comentários.
- **Banheiro (1) → (N) Avaliação:** Um banheiro pode receber várias avaliações.
- **Banheiro (1) → (N) Comentário:** Um banheiro pode ter vários comentários.
- **Banheiro (1) → (N) Insight:** Um banheiro pode ter vários insights gerados.

---

## 3. Rotas da API (Endpoints)

A API RESTful segue o padrão de arquitetura REST com as seguintes rotas organizadas por domínio:

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/api/auth/register` | Registro de novo usuário | Público |
| POST | `/api/auth/login` | Login e geração de token JWT | Público |
| GET | `/api/campus` | Listar todos os câmpus | Público |
| POST | `/api/campus` | Cadastrar novo câmpus | Admin |
| GET | `/api/localizacoes` | Listar localizações (filtro por campus) | Público |
| POST | `/api/localizacoes` | Cadastrar nova localização | Admin |
| GET | `/api/banheiros` | Listar banheiros (filtros diversos) | Público |
| GET | `/api/banheiros/:id` | Detalhes de um banheiro | Público |
| POST | `/api/banheiros` | Cadastrar novo banheiro | Admin |
| PUT | `/api/banheiros/:id` | Editar banheiro existente | Admin |
| DELETE | `/api/banheiros/:id` | Remover banheiro | Admin |
| GET | `/api/banheiros/:id/avaliacoes` | Listar avaliações de um banheiro | Público |
| POST | `/api/banheiros/:id/avaliacoes` | Criar avaliação | Autenticado |
| GET | `/api/ranking` | Ranking geral dos banheiros | Público |
| GET | `/api/insights/:banheiroId` | Insights inteligentes de um banheiro | Público |
| GET | `/api/insights/:id/horarios` | Análise de movimentação por horário | Público |
| GET | `/api/insights/campus/:campusId` | Panorama geral do câmpus | Público |
| GET | `/api/perfil` | Ver perfil do usuário logado | Autenticado |
| PUT | `/api/perfil` | Editar perfil | Autenticado |
| GET | `/api/perfil/avaliacoes` | Histórico de avaliações | Autenticado |

---

## Stack Tecnológica (Resumo)

- **Backend:** Node.js + Express
- **Banco de dados:** MongoDB
- **Frontend:** React
- **Autenticação:** JWT
- **Jobs agendados:** node-cron
