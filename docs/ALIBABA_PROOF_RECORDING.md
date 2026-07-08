# Alibaba Cloud Proof Recording

Use this for the separate Alibaba Cloud deployment proof recording required by Devpost. This is separate from the main product demo video.

## Goal

Record a short public-viewable clip proving that the AegisOps backend is running on Alibaba Cloud, exposes Qwen Cloud integration metadata, and keeps secrets out of public endpoints.

Recommended length: 45-75 seconds.

## Before Recording

1. Use the live ECS deployment at `http://101.201.33.56/`.
2. Open `http://101.201.33.56/api/health` and confirm it shows Qwen Cloud provider metadata, model, base URL, timestamp, and redacted credential state.
3. Do not require a public live key for this proof. Public reviewer mode may use deterministic fixtures to avoid exposing or burning a private Qwen API key; the same backend switches to live Qwen Cloud mode when `QWEN_API_KEY` or `DASHSCOPE_API_KEY` is configured.
4. Capture the Alibaba Cloud Workbench screenshot described in `docs/ALIBABA_WORKBENCH_SCREENSHOT.md`.
5. Run:

```bash
pnpm run deploy:verify -- http://101.201.33.56
```

6. Confirm `reports/alibaba_deployment_proof.md` is generated and contains no secrets.

## Recording Sequence

Show only public-safe information.

1. Open the repository file:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

Say: "This is the proof endpoint implementation for the Alibaba Cloud deployment."

2. Open the deployment instructions:

```text
https://github.com/Oxygen56/aegisops-autopilot/blob/main/infra/alibaba/DEPLOYMENT.md
```

Say: "The backend is packaged as a Docker service for Alibaba Cloud ECS or Function Compute."

3. Open the live proof endpoint:

```text
http://101.201.33.56/api/alibaba/proof
```

Show:

- Alibaba runtime signal.
- Qwen/DashScope base URL configuration.
- Qwen model and timestamp.
- Region or runtime metadata.
- Secret-safe response fields only.

4. Open the Alibaba Cloud Workbench screenshot:

```text
docs/screenshots/alibaba-workbench-proof.png
```

Show:

- Running Alibaba Cloud ECS, Function Compute, or equivalent runtime.
- Region and resource status.
- Public endpoint or service identity when safe.
- No secrets, private keys, or billing/account details.

5. Run the verifier locally:

```bash
pnpm run deploy:verify -- http://101.201.33.56
```

Show:

- `/api/health` passed.
- `/api/alibaba/proof` passed.
- `/api/tools` passed.
- leaked credential checks passed.
- `reports/alibaba_deployment_proof.md` written.

6. Open the generated report:

```text
reports/alibaba_deployment_proof.md
```

Say: "This report is generated after live deployment and is included in the final package when available."

7. Open the live health endpoint:

```text
http://101.201.33.56/api/health
```

Say: "The health endpoint exposes Qwen Cloud provider metadata and redacted credential state without returning any key."

## Do Not Show

- Qwen API keys.
- Alibaba Cloud access keys.
- Console pages containing account IDs that should remain private.
- `.env` files.
- SSH private keys.
- Billing pages.
- Private customer data or real incident logs.

## Upload Metadata

Title:

```text
AegisOps Autopilot - Alibaba Cloud Deployment Proof
```

Description:

```text
Separate deployment proof for the Qwen Cloud Hackathon submission AegisOps Autopilot. The recording shows the repository proof endpoint implementation, Alibaba Cloud deployment instructions, the live /api/alibaba/proof endpoint, the /api/health Qwen Cloud metadata response, and the verifier command that checks health, proof, tools, and secret safety.
```

Visibility: public or unlisted public-viewable.

## Devpost Paste

After upload, paste the proof recording URL alongside the Alibaba Cloud proof code link and the live `/api/alibaba/proof` URL in the Devpost submission.

Required links:

```text
Qwen base URL proof: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/agent/qwenClient.ts
Proof endpoint code: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
Live health: http://101.201.33.56/api/health
Live proof: http://101.201.33.56/api/alibaba/proof
Workbench screenshot: attach docs/screenshots/alibaba-workbench-proof.png or include the uploaded screenshot URL
Proof recording: https://youtu.be/KECJK5LgGOA
```

Local generated asset path:

```text
docs/demo/alibaba-backend-proof.mov
```
