# Data Warehouse - Microdados ENEM 2023

Projeto da disciplina - Introducao a Big Data e Data Analytics**.

Atividade: Construir e implementar um Data Warehouse usando a tecnica **Star Schema** sobre dados abertos do governo brasileiro.

- **Fonte:** INEP - Microdados do ENEM 2023
- **URL:** https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem
- **Licenca:** Creative Commons Atribuicao

> **Observacao:** Foram baixados os microdados dos anos de 2020 a 2024, porem a analise no **PowerBI foi realizada apenas com o ano de 2023** devido ao grande volume de dados (cada ano possui aproximadamente 4 milhoes de registros, totalizando cerca de 20 milhoes de linhas quando somados todos os anos, o que inviabiliza o processamento em maquina local sem otimizacoes adicionais).

---

## Estrutura do Projeto

```
big-data-atividade-01/
|-- download_microdados.py      # Script de download dos dados brutos do INEP
|-- etl_star_schema.py           # Script ETL: ENEM CSV -> Star Schema CSVs
|-- requirements.txt             # Dependencias Python
|-- microdados_enem/             # Dados brutos baixados (ZIPs + CSVs)
|   |-- 2023/
|       |-- DADOS/
|       |   |-- MICRODADOS_ENEM_2023.csv
|       |-- DICIONARIO/
|           |-- Dicionario_Microdados_Enem_2023.xlsx
|
|-- star_schema_csvs/            # <-- ENTREGAVEIS PRINCIPAIS
    |-- create_tables.sql         # DDL PostgreSQL (criacao das tabelas)
    |-- importar_dados.sql        # Script COPY para importar os CSVs
    |-- dim_tempo.csv
    |-- dim_localizacao.csv
    |-- dim_participante.csv
    |-- dim_escola.csv
    |-- dim_socioeconomico.csv
    |-- fact_enem_scores.csv      # (nao versionado - ver nota abaixo)
```

> **Nota sobre arquivos nao versionados no GitHub:**
> - `microdados_enem/` (~13 GB) - dados brutos do INEP, baixe com `download_microdados.py`
> - `fact_enem_scores.csv` (~297 MB) - excede o limite de 100 MB por arquivo do GitHub; gerado localmente executando `etl_star_schema.py`
> - `etl_star_schema.py` - script ETL mantido fora do repositorio publico
> - `venv/` - ambiente virtual Python

---

## Modelo Star Schema

```
                    +------------------+
                    |   dim_tempo      |
                    |------------------|
                    | PK id_tempo      |
                    |    ano           |
                    |    edicao_enem   |
                    +--------+---------+
                             |
                             |
    +-------------------+    |    +--------------------+
    | dim_participante  |    |    | dim_localizacao    |
    |-------------------|    |    |--------------------|
    | PK id_participante|    |    | PK id_localizacao  |
    |    faixa_etaria   |    |    |    estado          |
    |    sexo           |    |    |    municipio      |
    |    cor_raca       |    |    |    codigo_municipio|
    |    estado_civil   |    |    +--------+---------+
    |    ...            |    |             |
    +--------+----------+    |             |
             |               |             |
             |               |             |
             |    +----------+-------------+---------+
             |    | fact_enem_scores                  |
             |    |-----------------------------------|
             +--->| FK id_participante                |
             |    | FK id_localizacao                 |
             |    | FK id_tempo                       |
             |    | FK id_escola                      |
             |    | FK id_socioeconomico              |
             |    |    nu_inscricao                   |
             |    |    nota_cn / nota_ch / nota_lc    |
             |    |    nota_mt / nota_redacao         |
             |    |    nota_media_geral               |
             |    |    presenca_cn / presenca_ch        |
             |    |    presenca_lc / presenca_mt      |
             |    |    status_redacao                 |
             |    +-----------------------------------+
             |
    +--------+----------+
    | dim_escola        |
    |-------------------|
    | PK id_escola      |
    |    tipo_escola    |
    |    dependencia_adm|
    |    localizacao    |
    |    ensino         |
    +-------------------+

    +---------------------+
    | dim_socioeconomico  |
    |---------------------|
    | PK id_socioeconomico|
    |    escolaridade_pai |
    |    escolaridade_mae |
    |    renda_familiar   |
    |    quantidade_pessoas_moradia |
    +---------------------+
```

---

## Metricas Principais (Tabela Fato)

| Coluna | Descricao |
|--------|-----------|
| `nota_cn` | Nota Ciencias da Natureza |
| `nota_ch` | Nota Ciencias Humanas |
| `nota_lc` | Nota Linguagens e Codigos |
| `nota_mt` | Nota Matematica |
| `nota_redacao` | Nota Redacao |
| `nota_media_geral` | Media das 5 notas |
| `presenca_*` | 0=Faltou, 1=Presente, 2=Eliminado |

---

## Como Executar

### 1. Baixar os dados

```bash
cd big-data-atividade-01
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 download_microdados.py
```

### 2. Rodar o ETL

```bash
source venv/bin/activate
python3 etl_star_schema.py
```

Isso gera os arquivos em `star_schema_csvs/`.

---

## Ideias de Analises para o Dashboard

- Nota media por estado
- Nota por faixa de renda familiar
- Comparativo escola publica vs. privada
- Presenca vs. ausencia por regiao
- Desempenho por sexo e cor/raca
- Correlacao renda vs. nota_media_geral

---

## Entregaveis da Atividade

| Item | Arquivo |
|------|---------|
| Modelo fisico estrela (diagrama) | Este README + `create_tables.sql` |
| Script das tabelas do banco | `star_schema_csvs/create_tables.sql` |
| Datasets separados por tabela | `star_schema_csvs/*.csv` (6 arquivos) |
| Arquivo do PowerBI | `.pbix` (gerado manualmente no PowerBI) |

---

## Dados

- **Total de participantes:** 3.933.955
- **Ano analisado:** 2023
- **Tamanho do CSV fato:** ~297 MB
- **Tamanho do CSV bruto:** ~1.7 GB