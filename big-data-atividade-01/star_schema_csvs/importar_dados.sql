-- ============================================================
-- Script de importacao dos CSVs para PostgreSQL
-- Execute APOS rodar create_tables.sql
-- ============================================================
--

-- Windows (WSL):
SET csv_path = '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs';

-- Dimensoes (ordem importante por causa das FKs)

COPY dim_tempo(id_tempo, ano, edicao_enem)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\dim_tempo.csv'
DELIMITER ','
CSV HEADER;

COPY dim_localizacao(id_localizacao, estado, estado_nome, municipio, codigo_municipio)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\dim_localizacao.csv'
DELIMITER ','
CSV HEADER;

COPY dim_participante(id_participante, faixa_etaria, faixa_etaria_descricao, sexo, sexo_descricao, cor_raca, cor_raca_descricao, estado_civil, estado_civil_descricao, nacionalidade, nacionalidade_descricao, st_conclusao, st_conclusao_descricao)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\dim_participante.csv'
DELIMITER ','
CSV HEADER;

COPY dim_escola(id_escola, tipo_escola, tipo_escola_descricao, dependencia_adm, dependencia_adm_descricao, localizacao, localizacao_descricao, ensino, ensino_descricao)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\dim_escola.csv'
DELIMITER ','
CSV HEADER;

COPY dim_socioeconomico(id_socioeconomico, escolaridade_pai, escolaridade_pai_descricao, escolaridade_mae, escolaridade_mae_descricao, quantidade_pessoas_moradia, quantidade_pessoas_moradia_descricao, renda_familiar, renda_familiar_descricao)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\dim_socioeconomico.csv'
DELIMITER ','
CSV HEADER;

COPY fact_enem_scores(id_tempo, id_localizacao, id_participante, id_escola, id_socioeconomico, nu_inscricao, nota_cn, nota_ch, nota_lc, nota_mt, nota_redacao, nota_media_geral, presenca_cn, presenca_ch, presenca_lc, presenca_mt, status_redacao, status_redacao_descricao)
FROM '\\wsl.localhost\Ubuntu\home\bonru\faculdade\monkey_library\big-data-atividade-01\star_schema_csvs\fact_enem_scores.csv'
DELIMITER ','
CSV HEADER;