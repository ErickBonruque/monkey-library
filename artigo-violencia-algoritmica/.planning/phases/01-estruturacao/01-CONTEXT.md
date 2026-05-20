# Phase 1: Estruturação do Projeto e Referencial Teórico — Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Estruturar o repositório do artigo acadêmico, finalizar a string de busca sistemática a partir dos termos PICOC, documentar o protocolo de revisão seguindo PRISMA, e consolidar o arquivo BibTeX mestre com todas as referências. Inclui também a definição da estrutura do diretório `writing/` com seções em .md + template LaTeX para o pipeline de compilação (a ser implementado na Fase 4).

**Requirements cobertas:** PRJ-01, PRJ-02, PRJ-03, PRJ-04
</domain>

<decisions>
## Implementation Decisions

### Organização dos Diretórios
- **D-01:** Estrutura plana — cada diretório raiz (references/, data/, writing/) com arquivos diretamente, sem subpastas por tema.
- **D-02:** Padrão de nomenclatura `Sobrenome-Ano` para PDFs e entradas BibTeX (ex: `morozov-2013.pdf`).

### String de Busca
- **D-03:** Documentar string canônica combinando todos os termos PICOC com operadores booleanos, mais adaptações específicas para cada base (Scopus, Web of Science, IEEE).
- **D-04:** Armazenar em `references/search-string.md`.

### Protocolo de Revisão
- **D-05:** Documento em Markdown seguindo checklist PRISMA 2020.
- **D-06:** Armazenar em `.planning/protocolo-revisao.md` com seções: objetivo, PICOC, critérios de inclusão/exclusão, string de busca, fluxo de triagem.

### Gestão do BibTeX
- **D-07:** Arquivo único `references/referencias.bib` com curadoria manual.
- **D-08:** Chaves (keys) seguindo o padrão `SobrenomeAno` (ex: `Morozov2013`).

### Rastreamento de Artigos
- **D-09:** Planilha em Markdown em `references/artigos.md` com colunas: ID, Título, Autores, Ano, Base, Status (Accepted/Rejected/Duplicated/Unclassified), Notas.

### Pipeline de Compilação (MD → LaTeX → PDF)
- **D-10:** Estruturar agora o diretório `writing/secoes/` com arquivos .md separados por seção do artigo (numerados: `01-introducao.md`, `02-referencial.md`, etc.), mais `writing/template/template.tex`.
- **D-11:** A implementação da compilação (script Makefile ou similar) fica para a Fase 4 (Redação).

### Discretion
Nenhuma área foi delegada a critério do agente — todas as decisões foram capturadas acima.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projeto
- `.planning/PROJECT.md` — Visão do projeto, PICOC, questões de pesquisa, keywords
- `.planning/REQUIREMENTS.md` — Requisitos detalhados com rastreabilidade por fase
- `.planning/ROADMAP.md` — Fases, metas e critérios de sucesso

### Metodologia
- `references/search-string.md` — String de busca canônica + adaptações por base (a ser criada)
- `.planning/protocolo-revisao.md` — Protocolo de revisão seguindo PRISMA (a ser criado)
- `references/artigos.md` — Planilha de rastreamento de artigos (a ser criada)

### Referências
- `references/referencias.bib` — Arquivo BibTeX mestre (a ser criado)

### Escrita
- `writing/secoes/` — Arquivos .md por seção do artigo (a serem criados)
- `writing/template/template.tex` — Template LaTeX (a ser criado)

</canonical_refs>

<code_context>
## Existing Code Insights

### Estrutura Existente
- `references/` — Diretório vazio, será populado com PDFs e BibTeX
- `data/` — Diretório vazio, para dados extraídos na Fase 2
- `writing/` — Diretório vazio, será estruturado com seções e template

### Established Patterns
- Projeto novo sem padrões estabelecidos ainda
- Config GSD em `.planning/config.json` com modo yolo e auto_advance ativo

### Integration Points
- As decisões desta fase (estrutura de diretórios, nomenclatura) afetam todas as fases seguintes
- O protocolo de revisão alimenta a triagem na Fase 2
- O BibTeX alimenta a formatação final na Fase 4
- A estrutura writing/ alimenta a redação na Fase 4

</code_context>

<specifics>
## Specific Ideas

- **Pipeline LaTeX:** Usar um Makefile ou script simples para converter .md → .tex → .pdf.
  O template LaTeX deve seguir normas ABNT/NBR. A compilação será implementada na Fase 4,
  mas a estrutura de arquivos e o template serão criados já nesta fase.
- **PRISMA 2020:** Seguir o checklist PRISMA 2020 para o protocolo de revisão, incluindo
  fluxograma de triagem (a ser preenchido na Fase 2).

</specifics>

<deferred>
## Deferred Ideas

- **Pipeline de compilação MD → LaTeX → PDF:** Estrutura definida na Fase 1, implementação
  do script de compilação e exportação PDF será feita na Fase 4 (Redação).

</deferred>

---

*Phase: 01-estruturacao*
*Context gathered: 2026-05-14*
