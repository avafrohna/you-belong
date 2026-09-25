# You Belong San Diego

React/Vite site for You Belong San Diego, a developing community initiative. The directory contains reviewed real organizations and links to their official websites. The calendar lists individually announced events with direct external source links.

The owner confirmed `https://youbelongsandiego.org` as the primary address on 2026-09-21. The secondary `youbelongsandiego.com` should permanently redirect to it; it currently shows a GoDaddy parking page. The contact address remains `info@youbelongsandiego.org`.

## Local development

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The build generates complete HTML for every known route, including nested pages, so readers and search engines receive page content before JavaScript loads. React then hydrates those pages for menus, navigation, and filtering. A dedicated `404.html` provides the error page.

The build also generates:

- Page-specific titles, descriptions, canonical URLs, Open Graph and Twitter metadata.
- `robots.txt` and `sitemap.xml`.
- Conservative `WebSite` and `Organization` structured data, without asserting registered nonprofit status.
- A favicon based on the existing brand mark.

`src/seo.js` is the source of truth for the public origin and page metadata. Home, About, Explore, the local directory, real organization profiles, populated mission pages, and the calendar are indexable. The unfinished business section and 404 use `noindex, follow`. Events do not have local detail pages or sitemap entries. Crawling remains allowed so search engines can read page-level directives.

`npm run build` runs `scripts/check-build.mjs` automatically. Run `npm run check:build` to recheck existing output. The checks verify rendered content, page metadata, preview indexing restrictions, the sitemap, structured data, and consistency between `SITE_URL` and all CNAME files.

## Publish with the existing GitHub Pages workflow

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

In GitHub:

1. Go to **Settings → Pages**.
2. Set **Build and deployment** to **GitHub Actions**.
3. Confirm the custom domain matches the intended primary domain and `SITE_URL` in `src/seo.js`.
4. Ensure the GoDaddy DNS records point to this GitHub Pages site, following GitHub's current [custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
5. Push approved changes to `main`; the workflow builds, checks, and deploys `dist`.
6. Once the domain resolves and GitHub has issued its certificate, enable **Enforce HTTPS** in Pages settings.
7. Check the public home page, `/about/`, `/explore/`, `/robots.txt`, and `/sitemap.xml`. Open `/about/` and `/explore/` directly and refresh them; each should return its own page successfully. An unknown address should return the 404 page.

If the primary domain changes, update `SITE_URL` in `src/seo.js`, `CNAME`, `public/CNAME`, and the GitHub Pages custom-domain setting together. Configure a permanent redirect from any secondary domain rather than publishing competing copies of the same site. Do not change the contact email unless the new mailbox is configured.

## Make the published site discoverable on Google

Publishing a site and appearing in Google results are separate steps. These build changes make the public pages crawlable; Google decides whether and when to index them.

1. Open [Google Search Console](https://search.google.com/search-console/) with the owner's Google account and add a **Domain** property for the confirmed primary domain.
2. Follow Google's verification instructions. When offered DNS TXT verification, copy the exact verification value from Search Console and add it as a TXT record for the root domain in GoDaddy DNS. Keep any existing verification records; the new record does not replace the website or email DNS records. Return to Search Console and verify ownership after the record propagates.
3. In **Sitemaps**, submit `https://youbelongsandiego.org/sitemap.xml` (replace the origin if the primary domain changes).
4. Use **URL inspection** for the home page, `/about/`, and `/explore/`, test the live URL, then request indexing if the pages are eligible.
5. Check the **Page indexing** report for crawl problems and **Performance** for actual search impressions. Preview routes being excluded by `noindex` is intentional.

Google documents [ownership verification](https://support.google.com/webmasters/answer/9008080), [sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), and [indexing requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl). Crawling may take days or weeks; submitting a sitemap or requesting indexing does not guarantee inclusion or ranking. Search Console is the appropriate place to confirm the site's indexing status.

## Secondary .com domain

In GoDaddy, select `youbelongsandiego.com`, open DNS / Forwarding, and configure a permanent (301), forward-only redirect to `https://youbelongsandiego.org`. Do not use masking. Set the `.com` `www` CNAME to `@` as described in [GoDaddy’s forwarding instructions](https://www.godaddy.com/help/forward-my-godaddy-domain-12123). Check all four variants (HTTP and HTTPS, with and without `www`) after propagation. Preserve existing mail records. Keep GitHub Pages set to `.org`; changing CNAME alone does not change the Actions site binding.

## Photo

The homepage uses a real Balboa Park photograph by Librarybell (CC0). Source and download details are in `public/assets/PHOTO-CREDIT.md`.

## Community calendar

`/calendar/` provides a month view, multiple section/organization filters, search,
and direct links to external event sources. Each organization has its own
profile and upcoming event list. Fictional previews and recurring schedules are
not published. The reviewed content and held leads are documented in
[docs/community-profiles-and-events.md](docs/community-profiles-and-events.md).

See [docs/events.md](docs/events.md) to enter real organizations and events,
understand Pacific time and multi-day ranges, and plan future imports. There is
no automated scraper or editing dashboard yet. `npm test` covers date boundaries,
filters, publication rules, and data validation; CI runs it before building.
