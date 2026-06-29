# You Belong San Diego

React/Vite site for `youbelongsandiego.org`, a San Diego non-profit directory for communities, values-led small businesses, volunteer opportunities, events, and places to gather.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

In GitHub:

1. Go to **Settings → Pages**.
2. Set **Build and deployment** to **GitHub Actions**.
3. Push to `main`.
4. Add the custom domain `youbelongsandiego.org`.

The `public/CNAME` file is already set to `youbelongsandiego.org`.
