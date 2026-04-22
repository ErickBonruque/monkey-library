-- ============================================================
-- Reimporta fact_enem_scores (tabela fato ficou vazia após CASCADE)
-- Execute no pgAdmin (Query Tool)
-- ============================================================

-- 1. Limpa SOMENTE a tabela fato (sem CASCADE)
TRUNCATE TABLE fact_enem_scores;

-- 2. Reimporta o CSV da tabela fato
COPY fact_enem_scores(
    id_tempo, id_localizacao, id_participante, id_escola, id_socioeconomico,
    nu_inscricao, nota_cn, nota_ch, nota_lc, nota_mt, nota_redacao,
    nota_media_geral, presenca_cn, presenca_ch, presenca_lc, presenca_mt,
    status_redacao, status_redacao_descricao
)
FROM '/home/bonru/faculdade/monkey_library/big-data-atividade-01/star_schema_csvs/fact_enem_scores.csv'
DELIMITER ','
CSV HEADER
ENCODING 'UTF8';

-- 3. Verifica resultado
SELECT COUNT(*) AS total_registros FROM fact_enem_scores;
