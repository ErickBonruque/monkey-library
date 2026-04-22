-- ============================================================
-- Reimporta dim_localizacao com encoding corrigido
-- Execute no pgAdmin (Query Tool) apontando para o banco do DW
-- ============================================================

-- 1. Limpa a tabela (sem apagar a estrutura)
TRUNCATE TABLE dim_localizacao CASCADE;

-- 2. Reimporta o CSV corrigido
-- ATENÇÃO: ajuste o caminho abaixo se necessário
COPY dim_localizacao(id_localizacao, estado, estado_nome, municipio, codigo_municipio)
FROM '/home/bonru/faculdade/monkey_library/big-data-atividade-01/star_schema_csvs/dim_localizacao.csv'
DELIMITER ','
CSV HEADER
ENCODING 'UTF8';

-- 3. Verifica resultado
SELECT COUNT(*) AS total_linhas FROM dim_localizacao;

SELECT estado, municipio
FROM dim_localizacao
WHERE municipio LIKE '%ã%' OR municipio LIKE '%é%' OR municipio LIKE '%í%'
LIMIT 10;
