#!/usr/bin/env bash

# ==============================================================================
# WAVO × ECO GREEN — Quick Start Script
#   - Backend API  : http://localhost:5000
#   - Web Store    : http://localhost:3000
#   - Web CMS      : http://localhost:3002
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
WEB_STORE_DIR="${ROOT_DIR}/web-store"
WEB_CMS_DIR="${ROOT_DIR}/web-cms"

BACKEND_PORT="${BACKEND_PORT:-5000}"
STORE_PORT="${STORE_PORT:-3000}"
CMS_PORT="${CMS_PORT:-3002}"

# ANSI Colors
CYAN='\033[0;36m'
TEAL='\033[1;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

BACKEND_PID=""
STORE_PID=""
CMS_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}⚡ Đang tắt hệ thống...${NC}"
  for pid in "${BACKEND_PID}" "${STORE_PID}" "${CMS_PID}"; do
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}✔ Đã dừng toàn bộ dịch vụ.${NC}"
}

print_banner() {
  echo ""
  echo -e "${TEAL}${BOLD}🌊 WAVO × ECO GREEN${NC} ${DIM}(Store :${STORE_PORT} • CMS :${CMS_PORT} • API :${BACKEND_PORT})${NC}"
  echo -e "${DIM}────────────────────────────────────────────────────────────${NC}"
}

check_prerequisites() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}✖ Vui lòng cài đặt Node.js (>= 18) và npm.${NC}"
    exit 1
  fi
}

ensure_env_files() {
  if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
    cat <<EOF > "${BACKEND_DIR}/.env"
PORT=${BACKEND_PORT}
NODE_ENV=development
BACKEND_PUBLIC_URL=http://localhost:${BACKEND_PORT}
MONGODB_URI=mongodb://127.0.0.1:27017/dtu_upcycled_3d
JWT_SECRET=dtu-ocean-upcycled-3d-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:${STORE_PORT},http://localhost:${CMS_PORT},http://localhost:5173,http://127.0.0.1:${STORE_PORT},http://127.0.0.1:${CMS_PORT},http://127.0.0.1:5173
VIETQR_BANK_ID=MB
VIETQR_BANK_NAME=MB - Ngân hàng Quân Đội (MB Bank)
VIETQR_ACCOUNT_NO=0905123456
VIETQR_TEMPLATE=compact2
VIETQR_ACCOUNT_NAME=CONG TY TAI CHE LUOI BIEN DTU
VIETQR_BASE_URL=https://img.vietqr.io/image
SEED_ADMIN_EMAIL=admin@dtu-upcycled.vn
SEED_STAFF_EMAIL=artisan@dtu-upcycled.vn
SEED_CUSTOMER_EMAIL=customer@dtu-upcycled.vn
SEED_DEFAULT_PASSWORD=Password123!
# Cloudinary Media Storage
CLOUDINARY_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER_PREFIX=wavo
CLOUDINARY_UPLOAD_PRESET=

# Shipping & Order Pricing Rules
FREE_SHIPPING_THRESHOLD=500000
DEFAULT_SHIPPING_FEE=30000
EOF
  fi

  if [[ -d "${WEB_STORE_DIR}" ]] && [[ ! -f "${WEB_STORE_DIR}/.env.local" ]]; then
    echo "VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}/api" > "${WEB_STORE_DIR}/.env.local"
  fi

  if [[ -d "${WEB_CMS_DIR}" ]] && [[ ! -f "${WEB_CMS_DIR}/.env.local" ]]; then
    cat <<EOF > "${WEB_CMS_DIR}/.env.local"
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}/api
NEXT_PUBLIC_STORE_URL=http://localhost:${STORE_PORT}
NEXT_PUBLIC_CMS_URL=http://localhost:${CMS_PORT}
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@dtu-upcycled.vn
NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD=Password123!
EOF
  fi
}

ensure_dependencies() {
  local force_install="${1:-false}"

  if [[ "${force_install}" == "true" ]] || [[ ! -d "${BACKEND_DIR}/node_modules" ]]; then
    echo -e "${CYAN}📦 Đang cài đặt Backend...${NC}"
    (cd "${BACKEND_DIR}" && npm install --silent)
  fi

  if [[ -d "${WEB_STORE_DIR}" ]]; then
    if [[ "${force_install}" == "true" ]] || [[ ! -d "${WEB_STORE_DIR}/node_modules" ]]; then
      echo -e "${CYAN}📦 Đang cài đặt Web Store...${NC}"
      (cd "${WEB_STORE_DIR}" && npm install --silent)
    fi
  fi

  if [[ -d "${WEB_CMS_DIR}" ]]; then
    if [[ -L "${WEB_CMS_DIR}/node_modules" ]] && [[ ! -e "${WEB_CMS_DIR}/node_modules" ]]; then
      rm -f "${WEB_CMS_DIR}/node_modules"
    fi
    if [[ "${force_install}" == "true" ]] || [[ ! -d "${WEB_CMS_DIR}/node_modules" ]]; then
      echo -e "${CYAN}📦 Đang cài đặt Web CMS...${NC}"
      (cd "${WEB_CMS_DIR}" && npm install --silent)
    fi
  fi
}

free_port_if_busy() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti tcp:"${port}" -sTCP:LISTEN 2>/dev/null || true)
    if [[ -n "${pids}" ]]; then
      for pid in ${pids}; do
        local comm
        comm=$(ps -p "${pid}" -o comm= 2>/dev/null || true)
        if echo "${comm}" | grep -qi "node"; then
          kill -9 "${pid}" 2>/dev/null || true
          sleep 0.3
        fi
      done
    fi
  fi
}

print_usage() {
  cat <<EOF
Cách dùng: ./start.sh [TÙY CHỌN]

  (mặc định)   Khởi chạy toàn bộ hệ thống (Store, CMS, API)
  --migrate    Chạy migration cập nhật cấu trúc dữ liệu & danh mục MongoDB
  --seed       Nạp lại dữ liệu mẫu vào MongoDB
  --test       Chạy kiểm thử Backend và kiểm tra build Web Store + Web CMS
  --install    Cài đặt lại toàn bộ dependencies
  --help, -h   Hiển thị hướng dẫn
EOF
}

print_access_guide() {
  echo -e "${GREEN}${BOLD}✔ Hệ thống đã sẵn sàng!${NC}"
  echo ""
  echo -e "  🛒 ${BOLD}Web Store:${NC}   ${CYAN}http://localhost:${STORE_PORT}${NC}"
  echo -e "  🛠  ${BOLD}Web CMS:${NC}     ${CYAN}http://localhost:${CMS_PORT}${NC}"
  echo -e "  ⚙️  ${BOLD}Backend API:${NC} ${CYAN}http://localhost:${BACKEND_PORT}/api${NC}"
  echo ""
  echo -e "  🔑 ${DIM}Admin: admin@dtu-upcycled.vn / Password123!${NC}"
  echo -e "${DIM}────────────────────────────────────────────────────────────${NC}"
  echo -e "${YELLOW}💡 Nhấn Ctrl+C để dừng hệ thống.${NC}"
  echo ""
}

MODE="${1:-run}"

case "${MODE}" in
  --help|-h)
    print_banner
    print_usage
    exit 0
    ;;
  --install)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "true"
    echo -e "${GREEN}✔ Đã cài đặt xong toàn bộ dependencies.${NC}"
    exit 0
    ;;
  --migrate)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"
    echo -e "${CYAN}🔄 Đang chạy Database Migration...${NC}"
    (cd "${BACKEND_DIR}" && npm run migrate:force)
    echo -e "${GREEN}✔ Hoàn tất Migration!${NC}"
    exit 0
    ;;
  --seed)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"
    echo -e "${CYAN}🌱 Đang nạp dữ liệu mẫu...${NC}"
    (cd "${BACKEND_DIR}" && npm run seed)
    echo -e "${GREEN}✔ Hoàn tất!${NC}"
    exit 0
    ;;
  --test)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"
    echo -e "${CYAN}🧪 [1/3] Kiểm thử Backend API...${NC}"
    (cd "${BACKEND_DIR}" && npm test && npm run seed)
    if [[ -d "${WEB_STORE_DIR}" ]]; then
      echo -e "${CYAN}🏗  [2/3] Build Web Store...${NC}"
      (cd "${WEB_STORE_DIR}" && npm run build)
    fi
    if [[ -d "${WEB_CMS_DIR}" ]]; then
      echo -e "${CYAN}🏗  [3/3] Build Web CMS...${NC}"
      (cd "${WEB_CMS_DIR}" && npm run build)
    fi
    echo -e "${GREEN}✔ Toàn bộ bài test và bản build đều PASS!${NC}"
    exit 0
    ;;
  run|"")
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"

    trap cleanup INT TERM EXIT

    free_port_if_busy "${BACKEND_PORT}"
    free_port_if_busy "${STORE_PORT}"
    free_port_if_busy "${CMS_PORT}"

    echo -e "${DIM}⏳ Đang khởi động dịch vụ...${NC}"

    mkdir -p "${ROOT_DIR}/.logs"

    (cd "${BACKEND_DIR}" && PORT="${BACKEND_PORT}" npm start > "${ROOT_DIR}/.logs/backend.log" 2>&1) &
    BACKEND_PID=$!

    if [[ -d "${WEB_STORE_DIR}" ]]; then
      (cd "${WEB_STORE_DIR}" && npx vite --port "${STORE_PORT}" --host 0.0.0.0 > "${ROOT_DIR}/.logs/store.log" 2>&1) &
      STORE_PID=$!
    fi

    if [[ -d "${WEB_CMS_DIR}" ]]; then
      (cd "${WEB_CMS_DIR}" && npx next dev -p "${CMS_PORT}" > "${ROOT_DIR}/.logs/cms.log" 2>&1) &
      CMS_PID=$!
    fi

    # Đợi Backend & Store sẵn sàng
    for i in {1..20}; do
      if curl -s "http://localhost:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
        break
      fi
      sleep 0.5
    done
    sleep 1

    print_access_guide

    wait
    ;;
  *)
    print_banner
    echo -e "${RED}✖ Tham số không hợp lệ: ${MODE}${NC}"
    print_usage
    exit 1
    ;;
esac
