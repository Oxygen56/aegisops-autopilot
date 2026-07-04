# Demo Video Submission Pack

Devpost requires a public YouTube, Vimeo, or Youku link, and judges are not required to watch beyond three minutes.

## Local Draft Video

- Upload-friendly final: `docs/demo/aegisops-demo-reel-fixed.mov`
- Source frames: `docs/demo/frames/reel/slide-01.png` through `slide-07.png`
- Duration: 59.5 seconds
- Content: auto-playing AegisOps demo reel that calls the local backend and shows:
  - Track 4 positioning
  - SEV1 incident workflow
  - human approval pause
  - custom Qwen tools and MCP surface
  - official 30/30/25/15 rubric evidence
  - ablation evidence
  - Alibaba Cloud deployment proof endpoint

## Preferred Regeneration Command

Start the local app first:

```bash
pnpm run dev
```

Then regenerate the clean 720p video without depending on screen focus:

```bash
pnpm run video:frames
pnpm run video:render
```

## Screen Recording Fallback

Start the local app first:

```bash
pnpm run dev
```

Then record the Chrome demo reel. By default this records `http://127.0.0.1:5184/?reel=1` for 65 seconds:

```bash
pnpm run video:record
```

For a different local port or already-hosted URL:

```bash
DEMO_REEL_URL=http://127.0.0.1:5173/?reel=1 DEMO_REEL_SECONDS=65 pnpm run video:record
```

## Upload Step

Uploaded YouTube URL: https://youtu.be/eAqfwJn9sr8

The uploaded video is unlisted public-viewable and passed a YouTube oEmbed access check on 2026-07-04.

If replacing the video, upload `docs/demo/aegisops-demo-reel-fixed.mov` to YouTube, Vimeo, or Youku as a public or unlisted public-viewable video, then paste that URL into Devpost.

Use `docs/VIDEO_UPLOAD_METADATA.md` for the title, description, tags, chapters, and upload settings. Upload `docs/demo/aegisops-demo-reel-fixed.en.srt` as English captions.

Do not upload secrets, `.env` files, private logs, or unpublished customer data.
