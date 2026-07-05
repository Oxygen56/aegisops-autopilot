#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/aegisops-autopilot}"
REPO_URL="${REPO_URL:-https://github.com/Oxygen56/aegisops-autopilot.git}"
GIT_REF="${GIT_REF:-main}"
EXPECTED_COMMIT="${EXPECTED_COMMIT:-226b5954afc657d8ad802b62f8b031c12d1922e1}"
PORT="${PORT:-8787}"
NODE_VERSION="${NODE_VERSION:-22.12.0}"
PNPM_VERSION="${PNPM_VERSION:-11.7.0}"
NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY:-https://registry.npmmirror.com}"
NODE_DIST_BASE="${NODE_DIST_BASE:-https://npmmirror.com/mirrors/node}"
ENV_FILE="${ENV_FILE:-/etc/aegisops-autopilot.env}"
SERVICE_NAME="${SERVICE_NAME:-aegisops-autopilot}"
ALIBABA_CLOUD_REGION="${ALIBABA_CLOUD_REGION:-cn-beijing}"
ALIBABA_CLOUD_ECS_INSTANCE_ID="${ALIBABA_CLOUD_ECS_INSTANCE_ID:-i-2ze4hol1cy308ecm8tsi}"

log() {
  printf '[aegisops-deploy] %s\n' "$*"
}

install_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y ca-certificates curl git xz-utils lsof nginx
  else
    log "apt-get not found; assuming required packages are present"
  fi
}

install_node() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
    if [ "${major:-0}" -ge 20 ]; then
      log "using existing node $(node -v)"
      return
    fi
  fi

  local arch node_arch tarball url
  arch="$(uname -m)"
  case "$arch" in
    x86_64|amd64) node_arch="x64" ;;
    aarch64|arm64) node_arch="arm64" ;;
    *) log "unsupported architecture: $arch"; exit 1 ;;
  esac

  tarball="/tmp/node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"
  for base in "$NODE_DIST_BASE" "https://nodejs.org/dist"; do
    url="${base}/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"
    log "downloading Node.js from ${url}"
    if curl -fL --retry 3 --connect-timeout 20 "$url" -o "$tarball"; then
      break
    fi
  done

  test -s "$tarball"
  rm -rf "/opt/node-v${NODE_VERSION}-linux-${node_arch}"
  tar -xJf "$tarball" -C /opt
  ln -sf "/opt/node-v${NODE_VERSION}-linux-${node_arch}/bin/node" /usr/local/bin/node
  ln -sf "/opt/node-v${NODE_VERSION}-linux-${node_arch}/bin/npm" /usr/local/bin/npm
  ln -sf "/opt/node-v${NODE_VERSION}-linux-${node_arch}/bin/npx" /usr/local/bin/npx
  ln -sf "/opt/node-v${NODE_VERSION}-linux-${node_arch}/bin/corepack" /usr/local/bin/corepack
  hash -r
  log "installed node $(node -v)"
}

install_pnpm() {
  npm config set registry "$NPM_CONFIG_REGISTRY"
  npm install -g "pnpm@${PNPM_VERSION}" --registry="$NPM_CONFIG_REGISTRY"
  ln -sf "$(command -v pnpm)" /usr/local/bin/pnpm
  pnpm config set registry "$NPM_CONFIG_REGISTRY"
  log "installed pnpm $(pnpm --version)"
}

checkout_repo() {
  mkdir -p "$(dirname "$APP_DIR")"
  if [ -d "$APP_DIR/.git" ]; then
    log "updating repository in $APP_DIR"
    git -C "$APP_DIR" fetch --prune origin "$GIT_REF"
    git -C "$APP_DIR" checkout "$GIT_REF"
  else
    log "cloning $REPO_URL into $APP_DIR"
    rm -rf "$APP_DIR"
    git clone --branch "$GIT_REF" "$REPO_URL" "$APP_DIR"
  fi

  if [ -n "$EXPECTED_COMMIT" ]; then
    git -C "$APP_DIR" fetch origin "$EXPECTED_COMMIT" || true
    git -C "$APP_DIR" reset --hard "$EXPECTED_COMMIT"
  else
    git -C "$APP_DIR" reset --hard "origin/$GIT_REF"
  fi
  log "checked out $(git -C "$APP_DIR" rev-parse HEAD)"
}

build_app() {
  cd "$APP_DIR"
  pnpm install --frozen-lockfile=false
  pnpm run build
}

write_environment() {
  local tmp_env
  tmp_env="$(mktemp)"
  {
    printf 'NODE_ENV=production\n'
    printf 'PORT=%s\n' "$PORT"
    printf 'QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1\n'
    printf 'QWEN_MODEL=qwen-plus\n'
    printf 'ALIBABA_CLOUD_REGION=%s\n' "$ALIBABA_CLOUD_REGION"
    printf 'ALIBABA_CLOUD_ECS_INSTANCE_ID=%s\n' "$ALIBABA_CLOUD_ECS_INSTANCE_ID"
  } > "$tmp_env"

  if [ -f "$ENV_FILE" ]; then
    grep -E '^(QWEN_API_KEY|DASHSCOPE_API_KEY)=' "$ENV_FILE" >> "$tmp_env" || true
  fi

  install -m 0600 "$tmp_env" "$ENV_FILE"
  rm -f "$tmp_env"
}

write_systemd_unit() {
  cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<UNIT
[Unit]
Description=AegisOps Autopilot Qwen Cloud Hackathon
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/local/bin/pnpm run preview
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable "$SERVICE_NAME"
  systemctl restart "$SERVICE_NAME"
}

write_nginx_proxy() {
  if ! command -v nginx >/dev/null 2>&1; then
    log "nginx is not available; public URL can still use :${PORT}"
    return
  fi

  cat > /etc/nginx/sites-available/aegisops-autopilot <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

  rm -f /etc/nginx/sites-enabled/default
  ln -sf /etc/nginx/sites-available/aegisops-autopilot /etc/nginx/sites-enabled/aegisops-autopilot
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
}

open_local_firewall() {
  if command -v ufw >/dev/null 2>&1 && ufw status | grep -q active; then
    ufw allow 80/tcp || true
    ufw allow "${PORT}/tcp" || true
  fi
}

verify_local() {
  sleep 3
  systemctl --no-pager --full status "$SERVICE_NAME" | sed -n '1,30p'
  curl -fsS "http://127.0.0.1:${PORT}/api/health"
  printf '\n'
  curl -fsS "http://127.0.0.1:${PORT}/api/alibaba/proof"
  printf '\n'
  curl -fsS "http://127.0.0.1/api/health" || true
  printf '\n'
}

main() {
  log "deployment started"
  install_packages
  install_node
  install_pnpm
  checkout_repo
  build_app
  write_environment
  open_local_firewall
  write_systemd_unit
  write_nginx_proxy
  verify_local
  log "deployment completed"
}

main "$@"
