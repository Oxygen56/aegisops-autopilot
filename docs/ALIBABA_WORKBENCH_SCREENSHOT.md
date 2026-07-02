# Alibaba Workbench Screenshot Proof

Use this guide for the visual proof emphasized by the Qwen Cloud Hackathon updates. It complements `docs/ALIBABA_PROOF_RECORDING.md`; it does not replace the separate proof recording or the live `/api/alibaba/proof` URL.

## Required Screenshot

Capture one public-safe screenshot from Alibaba Cloud Workbench after the app is deployed.

The screenshot should show:

- A running ECS instance, Function Compute service, or other Alibaba Cloud runtime that hosts AegisOps.
- A visible region, runtime status, and timestamp or recent activity indicator.
- The public domain or endpoint used for the deployed backend when it is safe to show.
- Enough surrounding UI to make it clear the resource is in Alibaba Cloud Workbench.

Do not show:

- Qwen, DashScope, or Alibaba Cloud secrets.
- Access keys, SSH keys, private `.env` values, billing pages, or full account identifiers.
- Real customer data, private logs, or proprietary incident data.

Recommended local file name after capture:

```text
docs/screenshots/alibaba-workbench-proof.png
```

If you need to redact the image, keep the runtime status, Alibaba Cloud context, and service identity visible.

## Code Proof Links

Paste these links alongside the screenshot and proof recording:

```text
Qwen Cloud Base URL code proof:
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/agent/qwenClient.ts

Alibaba proof endpoint implementation:
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts
```

The Qwen client file contains the default Qwen Cloud OpenAI-compatible Base URL:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

## Devpost Paste Block

After account deployment, replace placeholders and paste this into the Alibaba Cloud proof field:

```text
Code proof for Qwen Cloud Base URL:
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/agent/qwenClient.ts

Alibaba Cloud proof endpoint code:
https://github.com/Oxygen56/aegisops-autopilot/blob/main/src/server/cloud/alibabaProof.ts

Live proof endpoint:
https://<your-domain>/api/alibaba/proof

Visual proof:
Attached Alibaba Cloud Workbench screenshot showing the running ECS/Function Compute resource.

Separate proof recording:
https://<public-proof-recording-url>
```

## Verification

After the screenshot is captured and the service is live:

```bash
pnpm run deploy:verify -- https://<your-domain>
pnpm run final:preflight
```

`pnpm run final:preflight` warns until `docs/screenshots/alibaba-workbench-proof.png` exists, because this visual proof requires account-owner access to Alibaba Cloud.
