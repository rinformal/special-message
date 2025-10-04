# A Special Message — React + Vite (GitHub Pages ready)

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173/

## Assets
Put images in `public/assets/`:
- hi.webp
- rose.gif
- rose-red.webp
- rose-blue.webp
- hugs.webp
- peek.webp
- heart-bucket.webp

## GitHub Pages
1. Edit `vite.config.ts` → set `base` to `'/<your-repo-name>/'`.
2. Push to GitHub.
3. Settings → Pages → **Source: GitHub Actions** (uses `.github/workflows/deploy.yml`).

## URL params
- `?name=Katalina&aka=Diana`
- `?intro=2.5`
- `?dur=3,3.8,3.8,3.8`
