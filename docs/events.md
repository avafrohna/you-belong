# Calendar and organization events

The calendar lives at `/calendar/`. An event belongs to one or more organizations
and one or more of the four mission sections. The calendar and profile pages read
the same collection; do not enter an event separately for each page or co-host.

The public directory contains reviewed real organizations. The calendar shows only
reviewed, individually announced dates. It never falls back to fictional events.
Every event link opens the organizer’s external source in a new tab; there are
no local event detail pages. Organization profiles have prominent website links.

## Add an organization manually

Add an object to `communityOrganizations` in `src/data/organizations.js`:

```js
{
  id: 'your-organization', // Permanent unique slug; avoid changing it later.
  name: 'Organization name',
  description: 'A verified description of the organization and its work.',
  neighborhood: 'North Park',
  website: 'https://the-organizations-own-website.example',
  sectionIds: ['united-neighborhoods'],
  values: ['An optional, verified community contribution'],
}
```

This creates `/organizations/your-organization/`, its upcoming event list, and an
entry in the shared directory, relevant mission pages, and calendar filters.
Include `organizationType`, `profileSourceUrl`, and `reviewedAt` to preserve the
profile’s scope and provenance. Do not imply that national organizations are
small local businesses; identify their local office or chapter where applicable.

## Add an event manually

Add an object to `events` in `src/data/events.js`. Replace all example text,
URLs and dates with information checked against the organizer's source:

```js
{
  id: 'your-organization-event-2026-10-10',
  title: 'Event title',
  description: 'What visitors can expect.',
  organizationIds: ['your-organization'],
  sectionIds: ['united-neighborhoods', 'businesses-give-back'],
  allDay: false,
  start: '2026-10-10T10:00:00-07:00',
  end: '2026-10-10T12:00:00-07:00',
  location: 'Verified venue and address, or Online',
  cost: 'Free',
  status: 'draft',
  sourceType: 'manual',
  sourceUrl: 'https://the-organizations-own-website.example/event',
  verifiedAt: '2026-09-21',
}
```

- Use `draft` until the details have been checked, then `published`.
- Use `cancelled` for a previously published cancellation so visitors see it.
  Cancelled entries remain labelled and link to the external source for updates.
- Do not publish recurring schedules or generate repeated occurrences. Add only individually announced, reviewed dates.
- Timed events require a confirmed start with an explicit UTC offset. Omit `end` if the organizer does not publish it; the UI says “End time not listed” and shows it on its start date only. Start-only events leave profile lists after that San Diego day. Never infer duration from a film runtime.
- Timed events require explicit UTC offsets. San Diego is normally `-07:00`
  during daylight saving and `-08:00` during standard time. Use the offset
  applicable to that date; never assume the visitor's timezone is San Diego.
- All-day events use date strings. The end date is **exclusive**: October 10
  alone uses `start: '2026-10-10', end: '2026-10-11', allDay: true`.
- An event with multiple hosts appears once on the calendar and on each host's
  profile. Multiple sections match as OR; multiple organizations match as OR;
  a section selection and organization selection combine as AND.
- Keep source URLs public HTTP(S) links. Every event title, calendar entry, and event arrow links directly to that URL. Review dates are shown in the event lists. No local event pages are created.

Section IDs: `united-neighborhoods`, `global-impact`, `rights-action`,
`businesses-give-back`.

The directory, real organization profiles, populated mission pages, and calendar
are indexable. No event detail URLs are generated or added to the sitemap. The
business section stays noindex until real business listings are ready.
Date-sensitive lists initialize in the browser using San Diego time.

Run `npm test` and `npm run build`, commit, and deploy to GitHub Pages.
Build validation rejects duplicate IDs, broken organization/section references,
invalid dates, missing source/review information, unsafe URL schemes, and real
events linked to fictional organizations. Draft events have no public route.

## Future imports

There is no scraper, scheduled importer, database, or admin sign-in in this
version. Manual editing means updating the source collection and redeploying.

When real source websites are selected, implement source-specific adapters:

1. Prefer organizer-provided feeds or APIs when available; otherwise assess
   the site's public event pages and access rules before writing a scraper.
2. Normalize into the event schema with a stable source ID, source URL and
   `sourceType: 'feed'` or `'website'`. Keep IDs stable to avoid duplicates.
3. Stage imported records for review as drafts; do not automatically label
   scraped records as verified or overwrite reviewed corrections.
4. Handle date changes, cancellations, and removed events explicitly. Record
   fetch failures without deleting existing events or fabricating replacements.
5. After review, publish the shared collection. Both profile and calendar views
   update together through the normal build.

A private editing dashboard can be added separately if editing files becomes
inconvenient. Never put an unauthenticated public editing form on the static site.
