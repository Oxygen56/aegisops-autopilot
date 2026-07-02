# Demo Video Submission Pack

Devpost requires a public YouTube, Vimeo, or Youku link, and judges are not required to watch beyond three minutes.

## Local Draft Video

- Upload-friendly draft: `docs/demo/aegisops-demo-reel-draft.m4v`
- Original screen recording: `docs/demo/aegisops-demo-reel-draft.mov`
- Duration: 55 seconds
- Content: auto-playing AegisOps demo reel that calls the local backend and shows:
  - Track 4 positioning
  - SEV1 incident workflow
  - human approval pause
  - custom Qwen tools and MCP surface
  - ablation evidence
  - Alibaba Cloud deployment proof endpoint

## Re-record Command

Start the local app first:

```bash
pnpm run dev
```

Then record the Chrome demo reel:

```bash
pnpm run video:record
```

## Upload Step

Upload `docs/demo/aegisops-demo-reel-draft.m4v` to YouTube, Vimeo, or Youku as a public or unlisted public-viewable video, then paste that URL into Devpost.

Do not upload secrets, `.env` files, private logs, or unpublished customer data.
