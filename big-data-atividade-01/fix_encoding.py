#!/usr/bin/env python3
"""
Corrige o encoding dos nomes de município em dim_localizacao.csv
Causa: ETL usou encoding='utf8-lossy' no CSV do ENEM (que é Latin-1),
corrompendo caracteres especiais como á, é, í, ó, ú, ã, ç, etc.
"""

import csv
from pathlib import Path

BASE = Path("/home/bonru/faculdade/monkey_library/big-data-atividade-01")
ARQUIVO_ORIGINAL = BASE / "microdados_enem/2023/DADOS/MICRODADOS_ENEM_2023.csv"
CSV_CORROMPIDO   = BASE / "star_schema_csvs/dim_localizacao.csv"
CSV_CORRIGIDO    = BASE / "star_schema_csvs/dim_localizacao.csv"

ESTADOS_NOME = {
    "AC":"Acre","AL":"Alagoas","AP":"Amapa","AM":"Amazonas","BA":"Bahia",
    "CE":"Ceara","DF":"Distrito Federal","ES":"Espirito Santo","GO":"Goias",
    "MA":"Maranhao","MT":"Mato Grosso","MS":"Mato Grosso do Sul",
    "MG":"Minas Gerais","PA":"Para","PB":"Paraiba","PR":"Parana",
    "PE":"Pernambuco","PI":"Piaui","RJ":"Rio de Janeiro",
    "RN":"Rio Grande do Norte","RS":"Rio Grande do Sul","RO":"Rondonia",
    "RR":"Roraima","SC":"Santa Catarina","SP":"Sao Paulo",
    "SE":"Sergipe","TO":"Tocantins",
}

print("Lendo arquivo original com encoding latin1...")
municipios = {}  # codigo_municipio -> (sg_uf, nome_municipio)

with open(ARQUIVO_ORIGINAL, encoding="latin1", newline="") as f:
    reader = csv.DictReader(f, delimiter=";")
    for row in reader:
        co = row.get("CO_MUNICIPIO_PROVA", "").strip()
        no = row.get("NO_MUNICIPIO_PROVA", "").strip()
        sg = row.get("SG_UF_PROVA", "").strip()
        if co and no and sg and co not in municipios:
            municipios[co] = (sg, no)

print(f"  Municipios unicos lidos: {len(municipios)}")

# Le o CSV corrompido para preservar os ids e estrutura
print("Lendo dim_localizacao.csv corrompido...")
rows_corrigidas = []
nao_encontrados = []

with open(CSV_CORROMPIDO, encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        codigo = row.get("codigo_municipio", "").strip()
        if codigo in municipios:
            sg, nome_correto = municipios[codigo]
            row["municipio"] = nome_correto
            row["estado"] = sg
            row["estado_nome"] = ESTADOS_NOME.get(sg, sg)
        else:
            nao_encontrados.append(codigo)
        rows_corrigidas.append(row)

print(f"  Linhas corrigidas: {len(rows_corrigidas)}")
if nao_encontrados:
    print(f"  Codigos nao encontrados ({len(nao_encontrados)}): {nao_encontrados[:10]}")

# Salva CSV corrigido
print("Salvando dim_localizacao.csv corrigido...")
with open(CSV_CORRIGIDO, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows_corrigidas)

# Verificacao rapida
print("\nVerificacao - amostra de municipios corrigidos:")
amostras = [r for r in rows_corrigidas if any(c in r["municipio"] for c in "áéíóúãõâêîôûç")]
for r in amostras[:8]:
    print(f"  [{r['estado']}] {r['municipio']}")

print(f"\nTotal verificado com acentos: {len(amostras)}")
print("CONCLUIDO!")
