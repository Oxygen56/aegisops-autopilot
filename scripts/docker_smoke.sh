#!/usr/bin/env bash
set -euo pipefail

image="${IMAGE_NAME:-aegisops-autopilot:smoke}"
container="aegisops-smoke-$$"
host_port="${SMOKE_PORT:-18787}"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not available. Start Docker and rerun pnpm run docker:smoke."
  exit 2
fi

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker build -t "$image" .
docker run -d --rm \
  --name "$container" \
  -p "127.0.0.1:${host_port}:8787" \
  -e QWEN_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1" \
  -e QWEN_MODEL="qwen-plus" \
  -e ALIBABA_CLOUD_REGION="local-container-smoke" \
  "$image" >/dev/null

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${host_port}/api/health" >/tmp/aegisops-health.json; then
    break
  fi
  sleep 0.5
done

curl -fsS "http://127.0.0.1:${host_port}/api/health" | tee /tmp/aegisops-health.json
curl -fsS "http://127.0.0.1:${host_port}/api/alibaba/proof" | tee /tmp/aegisops-proof.json
curl -fsS "http://127.0.0.1:${host_port}/api/tools" >/tmp/aegisops-tools.json

if ! rg -q '"ok": true' /tmp/aegisops-health.json; then
  echo "container health check did not return ok=true"
  exit 1
fi

if ! rg -q '"computeTarget"' /tmp/aegisops-proof.json; then
  echo "Alibaba proof endpoint did not return deployment proof fields"
  exit 1
fi

echo "docker smoke passed on http://127.0.0.1:${host_port}"
