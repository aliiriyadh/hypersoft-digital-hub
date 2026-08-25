#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PHONE_ENV="$ROOT_DIR/.phone.env"
PGDATA="$ROOT_DIR/.phone-postgres"
API_PORT="${API_PORT:-5001}"
WEB_PORT="${WEB_PORT:-5000}"

fail() {
  printf '\nخطأ: %s\n' "$1" >&2
  exit 1
}

command -v node >/dev/null 2>&1 || fail "Node.js غير مثبت. نفّذ: pkg install nodejs-lts"
command -v pnpm >/dev/null 2>&1 || fail "pnpm غير مثبت. نفّذ: npm install -g pnpm"
command -v initdb >/dev/null 2>&1 || fail "PostgreSQL غير مثبت. نفّذ: pkg install postgresql"
command -v pg_ctl >/dev/null 2>&1 || fail "أداة pg_ctl غير موجودة. أعد تثبيت PostgreSQL عبر: pkg reinstall postgresql"
command -v createdb >/dev/null 2>&1 || fail "أداة createdb غير موجودة. أعد تثبيت PostgreSQL عبر: pkg reinstall postgresql"

if [ ! -f "$PHONE_ENV" ]; then
  SESSION_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  ADMIN_INITIAL_PASSWORD="$(node -e 'console.log(require("crypto").randomBytes(12).toString("base64url"))')"
  cat > "$PHONE_ENV" <<EOF
SESSION_SECRET=$SESSION_SECRET
ADMIN_INITIAL_PASSWORD=$ADMIN_INITIAL_PASSWORD
EOF
  chmod 600 "$PHONE_ENV"
  printf '\nتم إنشاء حساب المدير الأول تلقائيًا:\n'
  printf 'اسم المستخدم: admin\n'
  printf 'كلمة المرور: %s\n' "$ADMIN_INITIAL_PASSWORD"
  printf 'احفظ كلمة المرور قبل إغلاق هذه الشاشة.\n\n'
fi

# shellcheck disable=SC1090
source "$PHONE_ENV"
export SESSION_SECRET ADMIN_INITIAL_PASSWORD
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres@127.0.0.1:5432/hypersoft}"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  printf 'تهيئة قاعدة البيانات المحلية لأول مرة...\n'
  initdb -D "$PGDATA" -A trust --username=postgres >/dev/null
fi

if ! pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" -o "-h 127.0.0.1 -p 5432" start >/dev/null
  for _ in $(seq 1 30); do
    if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

if ! psql "$DATABASE_URL" -tAc "SELECT 1" >/dev/null 2>&1; then
  createdb -h 127.0.0.1 -U postgres hypersoft 2>/dev/null || true
fi

printf 'تجهيز جداول الموقع...\n'
pnpm --filter @workspace/db run push >/dev/null

cleanup() {
  trap - INT TERM EXIT
  [ -n "${API_PID:-}" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "${WEB_PID:-}" ] && kill "$WEB_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

printf '\nتشغيل الخادم والواجهة...\n'
printf 'على الهاتف: http://127.0.0.1:%s\n' "$WEB_PORT"
if command -v ip >/dev/null 2>&1; then
  WIFI_IP="$(ip route get 8.8.8.8 2>/dev/null | awk '{for(i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')"
  [ -n "${WIFI_IP:-}" ] && printf 'على أجهزة Wi‑Fi نفسها: http://%s:%s\n' "$WIFI_IP" "$WEB_PORT"
fi
printf 'لإيقاف الموقع اضغط Ctrl+C.\n\n'

(PORT="$API_PORT" NODE_ENV=development pnpm --filter @workspace/api-server run dev) &
API_PID=$!
(PORT="$WEB_PORT" BASE_PATH="/" PHONE_MODE=1 pnpm --filter @workspace/hypersoft run dev) &
WEB_PID=$!

wait "$API_PID" "$WEB_PID"