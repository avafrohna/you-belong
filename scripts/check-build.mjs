import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getPageMeta, routeMetadata, SITE_URL } from "../src/seo.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFile(path.join(projectRoot, file), "utf8");
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const pages = [...Object.keys(routeMetadata), "/404"];
const pageHtml = new Map();
for (const route of pages) {
  const file = route === "/404" ? "dist/404.html" : `dist${route === "/" ? "" : route}/index.html`;
  const html = await read(file);
  const metadata = getPageMeta(route);
  pageHtml.set(route, html);
  assert.match(html, /<div id="root">[\s\S]+<h1(?:\s|>)/, `${route}: page body must be prerendered`);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${route}: needs a single primary heading`);
  assert.ok(html.includes(`<title>${escapeHtml(metadata.title)}</title>`), `${route}: expected page title`);
  assert.ok(html.includes(`<meta name="description" content="${escapeHtml(metadata.description)}"`), `${route}: expected description`);
  assert.ok(html.includes(`<meta name="robots" content="${metadata.robots}"`), `${route}: expected indexing policy`);
  assert.ok(html.includes(`<link rel="canonical" href="${metadata.canonical}"`), `${route}: expected canonical`);
  assert.ok(html.includes(`<meta property="og:url" content="${metadata.canonical}"`), `${route}: expected sharing URL`);
  assert.ok(html.includes('<meta name="twitter:card" content="summary"'), `${route}: expected Twitter card`);
  for (const icon of ["/favicon.ico", "/assets/favicon-48.png", "/assets/favicon-96.png", "/assets/favicon.svg", "/apple-touch-icon.png"]) {
    assert.ok(html.includes(`href="${icon}?v=2"`), `${route}: expected icon ${icon}`);
  }
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd, `${route}: expected structured data`);
  const structuredData = JSON.parse(jsonLd);
  assert.equal(structuredData["@graph"].find((item) => item["@type"] === "WebSite")?.url, `${SITE_URL}/`);
  assert.ok(!html.includes("<!-- SEO_START -->"), `${route}: no unfinished template placeholders`);
}
const heading = (route) => pageHtml.get(route).match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/)?.[1];
assert.notEqual(heading("/"), heading("/404"), "404 must be a real error page, not a copy of the home page");
assert.notEqual(heading("/"), heading("/about"), "About must have its own page content");
assert.notEqual(heading("/"), heading("/explore"), "Explore must have its own page content");
assert.notEqual(heading("/404"), heading("/explore"), "Explore must render its mission overview, not the error page");
assert.notEqual(heading("/"), heading("/directory"), "Directory must have its own page content");

const sitemap = await read("dist/sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).sort();
assert.deepEqual(sitemapUrls, [`${SITE_URL}/`, `${SITE_URL}/about/`, `${SITE_URL}/explore/`].sort(), "Only Home, About, and Explore may be indexed while the directory is a preview");
const robots = await read("dist/robots.txt");
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.ok(!robots.includes("Disallow: /"), "Crawlers must be allowed to read page-level noindex directives");
const hostname = new URL(SITE_URL).hostname;
for (const file of ["CNAME", "public/CNAME", "dist/CNAME"]) {
  assert.equal((await read(file)).trim(), hostname, `${file} must match SITE_URL`);
}
for (const icon of ["favicon.ico", "assets/favicon-48.png", "assets/favicon-96.png", "assets/favicon.svg", "apple-touch-icon.png"]) {
  await read(`dist/${icon}`);
}
console.log(`Build checks passed: ${pages.length} rendered pages, route metadata, noindex previews, sitemap, structured data, favicon, and domain consistency.`);
