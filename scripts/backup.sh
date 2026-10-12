#!/usr/bin/env bash
# Backup database YOFALAB + berkas unggahan.
#
# Pemakaian:
#   ./scripts/backup.sh                  # ke ~/backup-yofalab/<tanggal>/
#   BACKUP_DIR=/mnt/disk2/backup ./scripts/backup.sh
#
# Variabel lingkungan:
#   DATABASE_URL  wajib (dibaca dari .env bila tidak diekspor)
#   BACKUP_DIR    opsional, default ~/backup-yofalab
#
# Retensi: simpan 14 backup terakhir, sisanya dihapus.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" && -f .env ]]; then
  # Ambil DATABASE_URL dari .env tanpa mengeksekusi seluruh file.
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'')"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL tidak ditemukan (env atau .env)." >&2
  exit 1
fi

# Pisahkan komponen URL: mysql://user:pass@host:port/db
proto="${DATABASE_URL%%://*}"
rest="${DATABASE_URL#*://}"
userinfo="${rest%%@*}"
hostpart="${rest#*@}"
DB_USER="${userinfo%%:*}"
DB_PASS="${userinfo#*:}"
DB_HOST="${hostpart%%/*}"
DB_NAME="${hostpart##*/}"
DB_NAME="${DB_NAME%%\?*}"

if [[ "$proto" != "mysql" ]]; then
  echo "Hanya mendukung skema mysql:// (ditemukan: $proto)." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${BACKUP_DIR:-$HOME/backup-yofalab}/$STAMP"
mkdir -p "$OUT_DIR"

echo "==> Dump database $DB_NAME"
MYSQL_PWD="$DB_PASS" mysqldump \
  --host="${DB_HOST%%:*}" \
  --user="$DB_USER" \
  --single-transaction \
  --routines --triggers \
  "$DB_NAME" | gzip > "$OUT_DIR/db-$DB_NAME.sql.gz"

echo "==> Arsipkan berkas unggahan"
if [[ -d uploads ]]; then
  tar -czf "$OUT_DIR/uploads.tar.gz" uploads
else
  echo "    (direktori uploads tidak ada, dilewati)"
fi

# Metadata untuk jejak rollback.
{
  echo "waktu: $STAMP"
  echo "database: $DB_NAME"
  echo "commit: $(git rev-parse HEAD 2>/dev/null || echo '-')"
  echo "ukuran_db: $(du -h "$OUT_DIR/db-$DB_NAME.sql.gz" | cut -f1)"
} > "$OUT_DIR/INFO.txt"

echo "==> Selesai: $OUT_DIR"

# Retensi 14 backup terakhir.
BASE_DIR="${BACKUP_DIR:-$HOME/backup-yofalab}"
if [[ -d "$BASE_DIR" ]]; then
  ls -1dt "$BASE_DIR"/*/ 2>/dev/null | tail -n +15 | xargs -r rm -rf
fi
