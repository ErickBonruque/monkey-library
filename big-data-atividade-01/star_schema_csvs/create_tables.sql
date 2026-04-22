-- ============================================================
-- DW ENEM 2023 - Star Schema
-- Script DDL para PostgreSQL
-- Gerado automaticamente por etl_star_schema.py
-- ============================================================

-- Dimensoes

CREATE TABLE dim_tempo (
    id_tempo SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    edicao_enem VARCHAR(20)
);

CREATE TABLE dim_localizacao (
    id_localizacao SERIAL PRIMARY KEY,
    estado VARCHAR(2),
    estado_nome VARCHAR(100),
    municipio VARCHAR(200),
    codigo_municipio VARCHAR(20)
);

CREATE TABLE dim_participante (
    id_participante SERIAL PRIMARY KEY,
    faixa_etaria INTEGER,
    faixa_etaria_descricao VARCHAR(100),
    sexo VARCHAR(1),
    sexo_descricao VARCHAR(50),
    cor_raca INTEGER,
    cor_raca_descricao VARCHAR(100),
    estado_civil INTEGER,
    estado_civil_descricao VARCHAR(100),
    nacionalidade INTEGER,
    nacionalidade_descricao VARCHAR(200),
    st_conclusao INTEGER,
    st_conclusao_descricao VARCHAR(200)
);

CREATE TABLE dim_escola (
    id_escola SERIAL PRIMARY KEY,
    tipo_escola INTEGER,
    tipo_escola_descricao VARCHAR(100),
    dependencia_adm INTEGER,
    dependencia_adm_descricao VARCHAR(50),
    localizacao INTEGER,
    localizacao_descricao VARCHAR(50),
    ensino INTEGER,
    ensino_descricao VARCHAR(100)
);

CREATE TABLE dim_socioeconomico (
    id_socioeconomico SERIAL PRIMARY KEY,
    escolaridade_pai VARCHAR(10),
    escolaridade_pai_descricao VARCHAR(200),
    escolaridade_mae VARCHAR(10),
    escolaridade_mae_descricao VARCHAR(200),
    quantidade_pessoas_moradia VARCHAR(10),
    quantidade_pessoas_moradia_descricao VARCHAR(50),
    renda_familiar VARCHAR(10),
    renda_familiar_descricao VARCHAR(200)
);

-- Tabela Fato

CREATE TABLE fact_enem_scores (
    id_fato BIGSERIAL PRIMARY KEY,
    id_tempo INTEGER NOT NULL REFERENCES dim_tempo(id_tempo),
    id_localizacao INTEGER NOT NULL REFERENCES dim_localizacao(id_localizacao),
    id_participante INTEGER NOT NULL REFERENCES dim_participante(id_participante),
    id_escola INTEGER REFERENCES dim_escola(id_escola),
    id_socioeconomico INTEGER REFERENCES dim_socioeconomico(id_socioeconomico),
    nu_inscricao BIGINT NOT NULL,
    nota_cn NUMERIC(10,2),
    nota_ch NUMERIC(10,2),
    nota_lc NUMERIC(10,2),
    nota_mt NUMERIC(10,2),
    nota_redacao NUMERIC(10,2),
    nota_media_geral NUMERIC(10,2),
    presenca_cn INTEGER,
    presenca_ch INTEGER,
    presenca_lc INTEGER,
    presenca_mt INTEGER,
    status_redacao INTEGER,
    status_redacao_descricao VARCHAR(100)
);

-- Comentarios
COMMENT ON TABLE fact_enem_scores IS 'Tabela fato com notas e presencas dos participantes do ENEM';
COMMENT ON TABLE dim_tempo IS 'Dimensao tempo (ano/edicao)';
COMMENT ON TABLE dim_localizacao IS 'Dimensao localizacao geografica (estado/municipio)';
COMMENT ON TABLE dim_participante IS 'Dimensao participante (demografia)';
COMMENT ON TABLE dim_escola IS 'Dimensao escola (tipo e dependencia administrativa)';
COMMENT ON TABLE dim_socioeconomico IS 'Dimensao socioeconomico (renda e escolaridade dos pais)';

-- Indices para performance
CREATE INDEX idx_fato_tempo ON fact_enem_scores(id_tempo);
CREATE INDEX idx_fato_localizacao ON fact_enem_scores(id_localizacao);
CREATE INDEX idx_fato_participante ON fact_enem_scores(id_participante);
CREATE INDEX idx_fato_escola ON fact_enem_scores(id_escola);
CREATE INDEX idx_fato_socioeconomico ON fact_enem_scores(id_socioeconomico);
CREATE INDEX idx_fato_inscricao ON fact_enem_scores(nu_inscricao);
