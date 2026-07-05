#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGION="${ALIBABA_ACR_REGION:-${ALIBABA_CLOUD_REGION:-ap-southeast-1}}"
NAMESPACE="${ALIBABA_ACR_NAMESPACE:-}"
REPOSITORY="${ALIBABA_ACR_REPOSITORY:-aegisops-autopilot}"
TAG="${IMAGE_TAG:-$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
REMOTE_DIR="${ALIBABA_ECS_APP_DIR:-aegisops-autopilot}"
DRY_RUN="${DRY_RUN:-0}"
NPM_REGISTRY="${NPM_CONFIG_REGISTRY:-https://registry.npmjs.org/}"
PNPM_VERSION="${PNPM_VERSION:-11.7.0}"

if [[ -n "${ALIBABA_IMAGE:-}" ]]; then
  IMAGE="$ALIBABA_IMAGE"
else
  if [[ -z "$NAMESPACE" ]]; then
    echo "Set ALIBABA_ACR_NAMESPACE or ALIBABA_IMAGE." >&2
    exit 1
  fi
  IMAGE="registry.${REGION}.aliyuncs.com/${NAMESPACE}/${REPOSITORY}:${TAG}"
fi

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf "[dry-run]"
    printf " %q" "$@"
    printf "\n"
  else
    "$@"
  fi
}

if [[ -n "${ACR_USERNAME:-}" && -n "${ACR_PASSWORD:-}" ]]; then
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] docker login registry.${REGION}.aliyuncs.com --username ${ACR_USERNAME} --password-stdin"
  else
    printf "%s" "$ACR_PASSWORD" | docker login "registry.${REGION}.aliyuncs.com" --username "$ACR_USERNAME" --password-stdin
  fi
fi

run docker build \
  --build-arg "NPM_CONFIG_REGISTRY=${NPM_REGISTRY}" \
  --build-arg "PNPM_VERSION=${PNPM_VERSION}" \
  -t "$IMAGE" "$ROOT"
run docker push "$IMAGE"

if [[ -z "${ALIBABA_ECS_HOST:-}" ]]; then
  image_label="Image pushed"
  if [[ "$DRY_RUN" == "1" ]]; then
    image_label="Image planned"
  fi
  cat <<EOF

${image_label}:
$IMAGE

To deploy on ECS:
1. Copy infra/alibaba/ecs.env.example to /home/<user>/${REMOTE_DIR}/.env on the ECS instance.
2. Fill QWEN_API_KEY or DASHSCOPE_API_KEY in that remote .env file.
3. Re-run this script with ALIBABA_ECS_HOST=<public-ip-or-domain>.

EOF
  exit 0
fi

if [[ "$REMOTE_DIR" == *"'"* ]]; then
  echo "ALIBABA_ECS_APP_DIR must not contain single quotes." >&2
  exit 1
fi

ECS_USER="${ALIBABA_ECS_USER:-root}"
ECS_TARGET="${ECS_USER}@${ALIBABA_ECS_HOST}"

run ssh "$ECS_TARGET" "mkdir -p '$REMOTE_DIR'"
run scp "$ROOT/infra/alibaba/docker-compose.ecs.yml" "$ECS_TARGET:$REMOTE_DIR/docker-compose.yml"

remote_command="cd '$REMOTE_DIR' && test -f .env && AEGISOPS_IMAGE='$IMAGE' docker compose --env-file .env -f docker-compose.yml up -d && docker compose -f docker-compose.yml ps"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[dry-run] ssh $ECS_TARGET \"$remote_command\""
else
  ssh "$ECS_TARGET" "$remote_command" || {
    cat <<EOF >&2
Remote deployment failed.

Confirm that $ECS_TARGET:$REMOTE_DIR/.env exists and contains QWEN_API_KEY or DASHSCOPE_API_KEY.
Use infra/alibaba/ecs.env.example as the template.
EOF
    exit 1
  }
fi

cat <<EOF

Deployment command completed.
Verify the public endpoint after DNS or security-group routing is ready:
  ALIBABA_PROOF_URL=https://<your-domain> pnpm run deploy:verify

EOF
