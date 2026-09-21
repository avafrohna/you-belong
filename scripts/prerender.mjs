import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { getPageMeta, getStructuredData, routeMetadata, SITE_URL, SITE_NAME } from "../src/seo.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "dist");
const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function renderHead(route) {
  const metadata = getPageMeta(route);
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonical)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    '<meta property="og:locale" content="en_US" />',
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<script type="application/ld+json">${JSON.stringify(getStructuredData()).replaceAll("<", "\\u003c")}</script>`,
  ];
  return tags.join("\n    ");
}

if (!template.includes("<!-- SEO_START -->") || !template.includes('<div id="root"></div>')) {
  throw new Error("Prerender template markers are missing from dist/index.html.");
}

const server = await createServer({
  root: projectRoot,
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { render } = await server.ssrLoadModule("/src/entry-server.jsx");
  const routes = [...Object.keys(routeMetadata), "/404"];
  for (const route of routes) {
    const renderedApp = render(route);
    if (!renderedApp.includes("<h1")) throw new Error(`Missing prerendered heading: ${route}`);
    const html = template
      .replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, () => renderHead(route))
      .replace('<div id="root"></div>', () => `<div id="root">${renderedApp}</div>`);
    const outputFile = route === "/404"
      ? path.join(outputDirectory, "404.html")
      : path.join(outputDirectory, route.slice(1), "index.html");
    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, html);
  }

  const indexedRoutes = Object.keys(routeMetadata).filter((route) => !getPageMeta(route).robots.includes("noindex"));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexedRoutes.map((route) => `  <url><loc>${escapeHtml(getPageMeta(route).canonical)}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);
  await writeFile(path.join(outputDirectory, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log(`Prerendered ${routes.length} pages; sitemap includes ${indexedRoutes.length} public pages.`);
} finally {
  await server.close();
}
