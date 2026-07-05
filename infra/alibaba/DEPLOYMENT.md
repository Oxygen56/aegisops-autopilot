# Alibaba Cloud Deployment

This project is prepared for Alibaba Cloud ECS or Function Compute.

## Container Target

```bash
docker build -t aegisops-autopilot:latest .
docker run --rm -p 8787:8787 \
  -e QWEN_API_KEY="$QWEN_API_KEY" \
  -e QWEN_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1" \
  -e QWEN_MODEL="qwen-plus" \
  -e ALIBABA_CLOUD_REGION="ap-southeast-1" \
  aegisops-autopilot:latest
```

## Local Container Smoke

When Docker is running locally, verify the same container shape before pushing to Alibaba Cloud:

```bash
pnpm run docker:smoke
```

The smoke check builds the image, starts the container on `127.0.0.1:18787`, and verifies `/api/health`, `/api/alibaba/proof`, and `/api/tools`.

## Container Registry Push Template

Replace the placeholders with your Alibaba Cloud Container Registry namespace and region.

```bash
REGION=ap-southeast-1
NAMESPACE=<acr-namespace>
IMAGE=registry.${REGION}.aliyuncs.com/${NAMESPACE}/aegisops-autopilot:latest

docker build \
  --build-arg NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY:-https://registry.npmjs.org/}" \
  --build-arg PNPM_VERSION="${PNPM_VERSION:-11.7.0}" \
  -t "$IMAGE" .
docker push "$IMAGE"
```

For Mainland China networks, set `NPM_CONFIG_REGISTRY=https://registry.npmmirror.com` before building if the default npm registry is slow or blocked.

## ACR + ECS Deployment Pack

For the account-owner deployment path, this repository includes:

- `infra/alibaba/deploy-acr-ecs.sh`: builds the container, pushes it to Alibaba Cloud Container Registry, and optionally updates an ECS host over SSH.
- `infra/alibaba/docker-compose.ecs.yml`: ECS runtime service definition with health checks.
- `infra/alibaba/ecs.env.example`: secret-safe environment template to copy to the ECS host as `.env`.

Dry-run the exact commands without pushing or SSH:

```bash
DRY_RUN=1 \
ALIBABA_ACR_REGION=ap-southeast-1 \
ALIBABA_ACR_NAMESPACE=<acr-namespace> \
infra/alibaba/deploy-acr-ecs.sh
```

Push the image after `docker login` or by passing `ACR_USERNAME` and `ACR_PASSWORD` in the shell:

```bash
ALIBABA_ACR_REGION=ap-southeast-1 \
ALIBABA_ACR_NAMESPACE=<acr-namespace> \
infra/alibaba/deploy-acr-ecs.sh
```

To deploy on ECS, first create `/home/<user>/aegisops-autopilot/.env` from `infra/alibaba/ecs.env.example` on the ECS instance and fill `QWEN_API_KEY` or `DASHSCOPE_API_KEY` there. Then run:

```bash
ALIBABA_ACR_REGION=ap-southeast-1 \
ALIBABA_ACR_NAMESPACE=<acr-namespace> \
ALIBABA_ECS_HOST=<ecs-public-ip-or-domain> \
ALIBABA_ECS_USER=<ssh-user> \
infra/alibaba/deploy-acr-ecs.sh
```

The script does not write cloud credentials into the repository. Qwen credentials live only in the ECS `.env` file.

## Runtime Environment Variables

```text
QWEN_API_KEY=<from Qwen Cloud / DashScope>
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
PORT=8787
ALIBABA_CLOUD_REGION=ap-southeast-1
```

Use your region-specific Qwen base URL if your Qwen Cloud workspace requires one.

## Proof Endpoint

After deployment, open:

```text
https://<your-domain>/api/alibaba/proof
```

The proof endpoint is implemented in `src/server/cloud/alibabaProof.ts`. It demonstrates:

- Qwen Cloud OpenAI-compatible endpoint configuration.
- Alibaba Cloud ECS metadata probing when running on ECS.
- Function Compute environment detection when running on FC.
- Secret-safe evidence output for Devpost judges.

## Required Devpost Proof Link

Use a public repository link to:

```text
src/server/cloud/alibabaProof.ts
```

If the deployed app is live, also include the public proof endpoint URL.

## Post-Deploy Verification

```bash
curl -sS https://<your-domain>/api/health
curl -sS https://<your-domain>/api/alibaba/proof
curl -sS https://<your-domain>/api/tools
```

The proof endpoint must not return API keys or private runtime data.

## Generate Devpost Proof Report

After the public service is reachable, run:

```bash
ALIBABA_PROOF_URL=https://<your-domain> pnpm run deploy:verify
```

or:

```bash
pnpm run deploy:verify -- https://<your-domain>
```

This verifies `/api/health`, `/api/alibaba/proof`, and `/api/tools`, rejects `local-dev` proof, checks for leaked Qwen/Alibaba credential patterns, and writes:

```text
reports/alibaba_deployment_proof.md
```

Paste the live `/api/alibaba/proof` URL and the repository proof-code URL into Devpost.

## Workbench Screenshot Proof

The Devpost update titled "Proof of Deployment 101" asks for visual evidence from Alibaba Cloud Workbench in addition to code proof. After the service is running, capture a public-safe screenshot and follow:

```text
docs/ALIBABA_WORKBENCH_SCREENSHOT.md
```

Recommended destination:

```text
docs/screenshots/alibaba-workbench-proof.png
```
