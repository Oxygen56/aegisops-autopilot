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

docker build -t "$IMAGE" .
docker push "$IMAGE"
```

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
