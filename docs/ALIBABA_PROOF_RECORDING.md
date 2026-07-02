# Alibaba Cloud Proof Recording

Use this for the separate Alibaba Cloud deployment proof recording required by Devpost. This is separate from the main product demo video.

## Goal

Record a short public-viewable clip proving that the AegisOps backend is running on Alibaba Cloud and that the proof endpoint is safe to inspect.

Recommended length: 45-75 seconds.

## Before Recording

1. Deploy the container using `infra/alibaba/DEPLOYMENT.md`.
2. Confirm the live service has `QWEN_API_KEY` or `DASHSCOPE_API_KEY` configured in the cloud runtime, not in the repository.
3. Run:

```bash
pnpm run deploy:verify -- https://<your-domain>
```

4. Confirm `reports/alibaba_deployment_proof.md` is generated and contains no secrets.

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
https://<your-domain>/api/alibaba/proof
```

Show:

- `provider` or Alibaba runtime signal.
- Qwen/DashScope base URL configuration.
- Region or runtime metadata.
- Secret-safe response fields only.

4. Run the verifier locally:

```bash
pnpm run deploy:verify -- https://<your-domain>
```

Show:

- `/api/health` passed.
- `/api/alibaba/proof` passed.
- `/api/tools` passed.
- leaked credential checks passed.
- `reports/alibaba_deployment_proof.md` written.

5. Open the generated report:

```text
reports/alibaba_deployment_proof.md
```

Say: "This report is generated after live deployment and is included in the final package when available."

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
Separate deployment proof for the Qwen Cloud Hackathon submission AegisOps Autopilot. The recording shows the repository proof endpoint implementation, Alibaba Cloud deployment instructions, the live /api/alibaba/proof endpoint, and the verifier command that checks health, proof, tools, and secret safety.
```

Visibility: public or unlisted public-viewable.

## Devpost Paste

After upload, paste the proof recording URL alongside the Alibaba Cloud proof code link and the live `/api/alibaba/proof` URL in the Devpost submission.

Required links:

```text
Proof code: https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
Live proof: https://<your-domain>/api/alibaba/proof
Proof recording: https://<public-video-url>
```
