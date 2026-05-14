# Violência Algorítmica em Cidades Inteligentes

## What This Is

Repositório de rastreabilidade para o artigo acadêmico que analisa, por meio de revisão bibliográfica, como sistemas algorítmicos utilizados em cidades inteligentes reproduzem e aprofundam desigualdades sociais, raciais e socioespaciais. O projeto gerencia o ciclo de vida completo do artigo: pesquisa de referências, extração de dados, análise, redação e formatação final.

## Core Value

Produzir uma análise crítica e sistemática sobre violência algorítmica no contexto urbano, com rastreabilidade completa entre referências, dados extraídos, achados e conclusões.

## Requirements

### Validated

- ✓ Pesquisa PICOC estruturada com Population, Intervention, Comparison, Outcome, Context
- ✓ Questões de pesquisa definidas (4 questões)
- ✓ Palavras-chave e sinônimos mapeados por categoria
- ✓ Artigos coletados com status (Accepted, Rejected, Duplicated, Unclassified)

### Active

- [ ] **REQ-PRJ-01**: Estruturar repositório com diretórios padronizados para cada fase da pesquisa
- [ ] **REQ-PRJ-02**: Definir string de busca sistemática a partir dos termos PICOC
- [ ] **REQ-SLR-01**: Realizar triagem dos artigos coletados (Accepted vs Rejected)
- [ ] **REQ-SLR-02**: Extrair dados dos artigos aceitos em planilha padronizada
- [ ] **REQ-SLR-03**: Sintetizar achados por questão de pesquisa
- [ ] **REQ-ANA-01**: Analisar como a violência algorítmica se manifesta em cidades inteligentes
- [ ] **REQ-ANA-02**: Identificar grupos sociais mais afetados
- [ ] **REQ-ANA-03**: Mapear alternativas críticas propostas na literatura
- [ ] **REQ-ANA-04**: Analisar relações de poder no controle de dados urbanos
- [ ] **REQ-WRT-01**: Redigir artigo completo seguindo normas acadêmicas
- [ ] **REQ-WRT-02**: Gerenciar referências bibliográficas (BibTeX)
- [ ] **REQ-WRT-03**: Aplicar formatação ABNT/NBR

### Out of Scope

- Coleta de dados primários — A pesquisa é exclusivamente revisão bibliográfica
- Experimentos empíricos ou implementação de sistemas — Escopo teórico-conceitual
- Análise quantitativa avançada — Abordagem qualitativa de análise crítica da literatura

## Context

Este projeto de pesquisa está vinculado a um programa de pós-graduação e utiliza metodologia de revisão sistemática da literatura. O referencial teórico situa-se na interseção entre estudos urbanos críticos, ciência de dados e justiça social.

### PICOC

| Elemento | Descrição |
|----------|-----------|
| **Population** | Populações urbanas marginalizadas, comunidades periféricas, minorias, grupos vulneráveis, comunidades de baixa renda |
| **Intervention** | Cidades inteligentes, vigilância urbana, policiamento preditivo, reconhecimento facial, IA, machine learning, sistemas algorítmicos, governança algorítmica |
| **Comparison** | (Não se aplica) |
| **Outcome** | Desigualdade social, viés racial, viés algorítmico, exclusão digital, segregação espacial, discriminação |
| **Context** | Áreas urbanas, cidades, regiões metropolitanas |

### Questões de Pesquisa

1. Como os sistemas algorítmicos utilizados em cidades inteligentes reproduzem e aprofundam desigualdades sociais, raciais e socioespaciais?
2. Quais populações urbanas são mais afetadas pela violência algorítmica no contexto das cidades inteligentes?
3. Quais alternativas críticas a literatura propõe para combater a opressão algorítmica nas cidades inteligentes?
4. Quem controla os dados gerados nas cidades inteligentes e como isso reflete relações de poder existentes?

### Keywords por Categoria

**Population:** marginalized urban populations, peripheral communities, vulnerable populations, low-income communities, minority communities

**Intervention:** smart city, smart cities, urban surveillance, predictive policing, facial recognition, artificial intelligence, machine learning, algorithmic system, algorithmic governance

**Outcome:** social inequality, racial bias, algorithmic bias, digital divide, social exclusion, spatial segregation, urban inequality, discrimination, digital exclusion

**Context:** urban areas, cities, metropolitan regions

## Constraints

- **Escopo**: Revisão bibliográfica — sem coleta de dados primários
- **Formatação**: Normas ABNT/NBR para artigo acadêmico
- **Referências**: Gerenciamento via BibTeX
- **Idioma**: Português (artigo) com referências em inglês/português

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Revisão sistemática em vez de revisão narrativa | Rigor metodológico e rastreabilidade | — Pending |
| PICOC adaptado sem Comparison | Comparação não se aplica ao objetivo exploratório-crítico | ✓ Good |
| Rastreabilidade via GSD | Organização faseada com verificação por fase | — Pending |

## Estrutura do Repositório

```
artigo-violencia-algoritmica/
├── .planning/              # Gerenciamento do projeto (GSD)
├── references/             # Artigos coletados (PDFs + BibTeX)
├── data/                   # Dados extraídos das referências
└── writing/                # Versões do artigo
```

---
*Last updated: 2026-05-14 after initialization*
