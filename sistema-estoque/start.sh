#!/usr/bin/env bash
#
# start.sh — sobe o backend (API) e o frontend (Next.js) com um único comando.
#
# Uso:
#   ./start.sh           # sobe tudo (faz o setup automático na primeira vez)
#   ./start.sh --seed    # força repopular o banco antes de subir
#   ./start.sh --setup   # força reinstalar deps + gerar Prisma + popular banco
#
# Pare tudo com Ctrl+C.

set -euo pipefail

# Diretório onde este script está (funciona de qualquer lugar).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"

FORCE_SEED=false
FORCE_SETUP=false
for arg in "$@"; do
  case "$arg" in
    --seed)  FORCE_SEED=true ;;
    --setup) FORCE_SETUP=true ;;
  esac
done

echo "==> Projeto: $ROOT"

# --- Setup do backend (só roda o que estiver faltando) -----------------------
if [ "$FORCE_SETUP" = true ] || [ ! -d "$BACKEND/node_modules" ]; then
  echo "==> [backend] Instalando dependências..."
  npm --prefix "$BACKEND" install
fi

if [ "$FORCE_SETUP" = true ] || [ ! -d "$BACKEND/node_modules/.prisma" ]; then
  echo "==> [backend] Gerando Prisma Client..."
  npm --prefix "$BACKEND" exec prisma generate
fi

# Popula o banco na primeira vez (sem dev.db), ou se pedido via flag.
if [ "$FORCE_SETUP" = true ] || [ "$FORCE_SEED" = true ] || [ ! -f "$BACKEND/prisma/dev.db" ]; then
  echo "==> [backend] Populando o banco (seed)..."
  npm --prefix "$BACKEND" exec prisma migrate deploy || true
  npm --prefix "$BACKEND" run seed
fi

# --- Setup do frontend -------------------------------------------------------
if [ "$FORCE_SETUP" = true ] || [ ! -d "$ROOT/node_modules" ]; then
  echo "==> [frontend] Instalando dependências..."
  npm --prefix "$ROOT" install
fi

# --- Encerra os dois processos ao sair (Ctrl+C) ------------------------------
PIDS=()
cleanup() {
  echo ""
  echo "==> Encerrando..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "==> Tudo parado."
}
trap cleanup EXIT INT TERM

# --- Sobe o backend ----------------------------------------------------------
echo "==> [backend] Iniciando API em http://localhost:3333 ..."
npm --prefix "$BACKEND" run dev &
PIDS+=($!)

# Espera a API responder antes de subir o frontend.
echo -n "==> Aguardando a API ficar pronta"
for _ in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3333/api/health 2>/dev/null; then
    echo " — pronta!"
    break
  fi
  echo -n "."
  sleep 1
done

# --- Sobe o frontend ---------------------------------------------------------
echo "==> [frontend] Iniciando site em http://localhost:3000 ..."
npm --prefix "$ROOT" run dev &
PIDS+=($!)

echo ""
echo "============================================================"
echo "  Site (frontend) : http://localhost:3000"
echo "  API (backend)   : http://localhost:3333"
echo "  Swagger (docs)  : http://localhost:3333/docs"
echo "  Login           : admin@admin.com / 123456"
echo "------------------------------------------------------------"
echo "  Pare tudo com Ctrl+C"
echo "============================================================"

# Mantém o script vivo enquanto os processos rodam.
wait
