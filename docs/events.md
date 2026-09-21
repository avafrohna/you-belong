# Calendar and organization events

The calendar lives at `/calendar/`. An event belongs to one or more organizations
and one or more of the four mission sections. The calendar and profile pages read
the same collection; do not enter an event separately for each page or co-host.

The first version shows **fictional preview events** from the existing sample
businesses. Those records live in `src/data/example-events.js`, separate from
real events, and move with the current San Diego month for design previews.
Their profiles, event pages, and the preview calendar are `noindex` and excluded
from the sitemap. There are no real booking links on sample events.

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

This creates `/organizations/your-organization/` with its shared upcoming event
list. Real organizations appear in calendar filters when real events are
published. The old business directory still contains its explicitly fictional
preview listings; replacing that directory with verified entries is a separate
content step.

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
  Cancelled events keep their information but have no registration button.
- Give each repeat occurrence a distinct ID and its own start/end values.
- Timed events require explicit UTC offsets. San Diego is normally `-07:00`
  during daylight saving and `-08:00` during standard time. Use the offset
  applicable to that date; never assume the visitor's timezone is San Diego.
- All-day events use date strings. The end date is **exclusive**: October 10
  alone uses `start: '2026-10-10', end: '2026-10-11', allDay: true`.
- An event with multiple hosts appears once on the calendar and on each host's
  profile. Multiple sections match as OR; multiple organizations match as OR;
  a section selection and organization selection combine as AND.
- Keep source URLs public HTTP(S) links. The event page links to the organizer
  for arrangements/registration, with the review date visible.

Section IDs: `united-neighborhoods`, `global-impact`, `rights-action`,
`businesses-give-back`.

Once the collection contains a published or cancelled real event, the main
calendar switches from samples to real records. Real organization and event
pages are prerendered; the real calendar becomes indexable. Example pages remain
labelled previews and excluded from the sitemap. Date-sensitive lists initialize
in the browser using San Diego time, avoiding stale dates in static HTML.

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
