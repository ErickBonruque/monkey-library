"""
Script para download dos Microdados do ENEM - Últimos 5 anos
Fonte: INEP - Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira
URL base: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem

Uso: python download_enem.py
Requisitos: pip install requests tqdm
"""

import os
import sys
import zipfile
import requests
import urllib3
from pathlib import Path

# Desabilitar warnings de SSL (servidor INEP tem problema de certificado)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

try:
    from tqdm import tqdm
except ImportError:
    tqdm = None


# =============================================
# CONFIGURAÇÃO
# =============================================
# Últimos 5 anos disponíveis (ajuste se necessário)
ANOS = [2020, 2021, 2022, 2023, 2024]

# Pasta onde os arquivos serão salvos
PASTA_DOWNLOAD = Path("microdados_enem")

# URL base do INEP
URL_BASE = "https://download.inep.gov.br/microdados/microdados_enem_{ano}.zip"

# =============================================


def criar_pastas():
    """Cria a estrutura de pastas necessária."""
    PASTA_DOWNLOAD.mkdir(parents=True, exist_ok=True)
    print(f"Pasta de download: {PASTA_DOWNLOAD.resolve()}\n")


def download_arquivo(url: str, destino: Path) -> bool:
    """
    Faz o download de um arquivo com barra de progresso.
    Retorna True se o download foi bem-sucedido.
    """
    try:
        print(f"  Conectando a {url}...")
        response = requests.get(url, stream=True, timeout=30, verify=False)

        if response.status_code == 404:
            print(f"  AVISO: Arquivo não encontrado (404). Este ano pode ainda não estar disponível.")
            return False

        response.raise_for_status()

        tamanho_total = int(response.headers.get("content-length", 0))
        tamanho_mb = tamanho_total / (1024 * 1024) if tamanho_total else 0

        print(f"  Tamanho: {tamanho_mb:.1f} MB")
        print(f"  Baixando para: {destino}")

        with open(destino, "wb") as f:
            if tqdm and tamanho_total:
                barra = tqdm(
                    total=tamanho_total,
                    unit="B",
                    unit_scale=True,
                    desc=f"  {destino.name}",
                )
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    barra.update(len(chunk))
                barra.close()
            else:
                baixado = 0
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    baixado += len(chunk)
                    if tamanho_total:
                        pct = (baixado / tamanho_total) * 100
                        print(f"\r  Progresso: {pct:.1f}% ({baixado / 1024 / 1024:.1f} MB)", end="")
                print()

        print(f"  Download concluído!")
        return True

    except requests.exceptions.ConnectionError:
        print(f"  ERRO: Não foi possível conectar ao servidor. Verifique sua internet.")
        return False
    except requests.exceptions.Timeout:
        print(f"  ERRO: Timeout na conexão. Tente novamente.")
        return False
    except requests.exceptions.HTTPError as e:
        print(f"  ERRO HTTP: {e}")
        return False
    except Exception as e:
        print(f"  ERRO inesperado: {e}")
        return False


def extrair_zip(arquivo_zip: Path, pasta_destino: Path) -> bool:
    """Extrai o conteúdo do ZIP para uma pasta específica."""
    try:
        print(f"  Extraindo {arquivo_zip.name}...")
        with zipfile.ZipFile(arquivo_zip, "r") as zf:
            # Lista os arquivos principais dentro do ZIP
            arquivos = zf.namelist()
            csvs = [a for a in arquivos if a.lower().endswith(".csv")]
            dicionarios = [a for a in arquivos if "dicionario" in a.lower() or "leia" in a.lower()]

            print(f"  Arquivos encontrados: {len(arquivos)} total, {len(csvs)} CSV(s)")

            zf.extractall(pasta_destino)

        print(f"  Extraído para: {pasta_destino}")
        return True

    except zipfile.BadZipFile:
        print(f"  ERRO: Arquivo ZIP corrompido. Tente baixar novamente.")
        return False
    except Exception as e:
        print(f"  ERRO na extração: {e}")
        return False


def main():
    print("=" * 60)
    print("  DOWNLOAD - Microdados do ENEM (INEP)")
    print("  Últimos 5 anos")
    print("=" * 60)
    print()

    criar_pastas()

    resultados = {}

    for ano in ANOS:
        print(f"\n{'─' * 50}")
        print(f"ANO: {ano}")
        print(f"{'─' * 50}")

        url = URL_BASE.format(ano=ano)
        arquivo_zip = PASTA_DOWNLOAD / f"microdados_enem_{ano}.zip"
        pasta_ano = PASTA_DOWNLOAD / str(ano)

        # Verifica se já foi baixado
        if arquivo_zip.exists():
            print(f"  Arquivo já existe: {arquivo_zip}")
            print(f"  Pulando download (delete o arquivo para baixar novamente)")
            resultados[ano] = "já existia"

            # Extrai se a pasta não existe
            if not pasta_ano.exists():
                pasta_ano.mkdir(parents=True, exist_ok=True)
                extrair_zip(arquivo_zip, pasta_ano)
            continue

        # Download
        sucesso = download_arquivo(url, arquivo_zip)

        if sucesso:
            # Extrai o ZIP
            pasta_ano.mkdir(parents=True, exist_ok=True)
            extrair_zip(arquivo_zip, pasta_ano)
            resultados[ano] = "OK"
        else:
            resultados[ano] = "FALHOU"

    # Resumo final
    print(f"\n\n{'=' * 60}")
    print("  RESUMO")
    print(f"{'=' * 60}")
    for ano, status in resultados.items():
        icone = "OK" if status in ("OK", "já existia") else "FALHOU"
        print(f"  ENEM {ano}: {icone} ({status})")

    print(f"\nArquivos salvos em: {PASTA_DOWNLOAD.resolve()}")

    # Listar CSVs encontrados
    csvs = list(PASTA_DOWNLOAD.rglob("*.csv"))
    if csvs:
        print(f"\nCSVs encontrados ({len(csvs)}):")
        for csv in sorted(csvs):
            tamanho = csv.stat().st_size / (1024 * 1024)
            print(f"  {csv.relative_to(PASTA_DOWNLOAD)} ({tamanho:.1f} MB)")

    print(f"\n{'=' * 60}")
    print("  PRÓXIMOS PASSOS:")
    print("  1. Verifique os CSVs baixados")
    print("  2. Consulte o DICIONÁRIO de dados (xlsx dentro do zip)")
    print("  3. Execute o script de ETL para criar o star schema")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()