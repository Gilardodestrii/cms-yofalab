#!/usr/bin/env bash
# Pulihkan database YOFALAB dari hasil scripts/backup.sh.
#
# Pemakaian:
#   ./scripts/restore.sh ~/backup-yofalab/20261012-101500
#
# PERINGATAN: skrip ini menimpa seluruh tabel database tujuan.
# Pastikan sudah membuat backup terbaru sebelum menjalankan.

set -euo pipefail

cd "$(dirname "$0")/.."

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "Pemakaian: $0 <direktori-backup>" >&2
  exit 1
fi

DUMP="$(ls -1 "$SRC"/db-*.sql.gz 2>/dev/null | head -1 || true)"
if [[ -z "$DUMP" ]]; then
  echo "Tidak menemukan berkas db-*.sql.gz di $SRC." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" && -f .env ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'')"
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL tidak ditemukan (env atau .env)." >&2
  exit 1
fi

rest="${DATABASE_URL#*://}"
userinfo="${rest%%@*}"
hostpart="${rest#*@}"
DB_USER="${userinfo%%:*}"
DB_PASS="${userinfo#*:}"
DB_HOST="${hostpart%%/*}"
DB_NAME="${hostpart##*/}"
DB_NAME="${DB_NAME%%\?*}"

echo "Rollback akan MENIMPA database: $DB_NAME @ ${DB_HOST%%:*}"
read -r -p "Ketik nama database untuk konfirmasi: " CONFIRM
if [[ "$CONFIRM" != "$DB_NAME" ]]; then
  echo "Dibatalkan." >&2
  exit 1
fi

echo "==> Pulihkan dump"
MYSQL_PWD="$DB_PASS" gunzip -c "$DUMP" | MYSQL_PWD="$DB_PASS" mysql \
  --host="${DB_HOST%%:*}" \
  --user="$DB_USER" \
  "$DB_NAME"

if [[ -f "$SRC/uploads.tar.gz" ]]; then
  echo "==> Pulihkan berkas unggahan"
  tar -xzf "$SRC/uploads.tar.gz" -C .
fi

echo "==> Rollback selesai. Jalankan 'npm run db:deploy' bila skema perlu diselaraskan."
