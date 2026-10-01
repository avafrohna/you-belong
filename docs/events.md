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
- If the source gives a non-clock ending such as “until sunset,” preserve it in `endTimeNote` and omit `end`. This is display text, not an estimated timestamp.
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
invalid supplied dates, missing source/review information, unsafe URL schemes, and real
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

## Checking news posts and image invitations

Review each organization’s News/Blog/Updates as well as Events pages. When an
announcement embeds a flyer or invitation, inspect the image before deciding
that the venue or timing is missing. Follow public registration links for
additional details; do not confuse the organization’s contact address with the
event venue. Preserve qualitative endings such as “until sunset” and refer
visitors to the organizer for unconfirmed pricing.

## Minimum information and incomplete events

An event name and direct public event link are enough to save a discovery. The
collector/editor attaches its stable ID, organization, categories, source type,
and checked date automatically. These bookkeeping fields stay required;
`description`, `location`, `cost`, and `end` are optional. Missing details must
not prevent collection, and must never be invented.

- No confirmed date: omit `start` and `end`, set `allDay: false`. Reviewed public
  announcements appear on their organization profile under “Date to be announced”;
  they do not occupy an invented day on the calendar or count as upcoming dates.
- Date known but time missing: use `dateOnly: true`, `allDay: false`, and a
  `YYYY-MM-DD` start. The calendar displays “Time to be announced.” This does
  not mean an all-day event. An optional date-only end is exclusive.
- Start time known: use the existing timestamp format with the correct Pacific
  offset. End time, location, pricing, and description remain optional.
- Unclear year, conflicting dates, or an old announcement: keep the discovery
  for review; do not infer a future date from the day/month or publish a known
  past event as “date to be announced.”

Daily collection should check events, news, blogs, updates, registration links,
and embedded invitations. New discoveries and proposed changes are separate
from human-edited records. A collector must not overwrite manual corrections
or re-publish an event that was dismissed, cancelled, or unpublished.

## Daily discovery inbox

### Editorial scope: arts-center films

Skip routine Media Arts Center / Digital Gym film listings by default. The owner
finds the full cinema schedule too numerous and usually unrelated to this site's
purpose. Do not enumerate film listings or repeatedly offer the declined arts
shortlist. Zoé Presents on October 7, 2026 is an explicitly approved exception.
The Fly was explicitly removed from the scrolling strip and must stay removed.

Continue checking for relevant non-film community programs. A special film
program can be considered only with a clear connection to local cultures,
community participation, or the project mission. An editor must record that
reason in `editorialRelevance` before it can bypass `skip-routine-film`; never
copy this field from scraped content, and it does not authorize publication.
Existing approved films stay published unless the owner asks to remove them.
The structured rule is in `reviewPolicy.routineFilmScreenings` in the inbox.

### Retained discoveries

`docs/event-discovery-inbox.json` is a research inbox, separate from the public
event collection. It is not a working admin dashboard or a database. It starts
with retained discoveries; adding this file does not schedule a job.

For each discovery, store a stable ID, `status: "draft"`, title, organization ID,
direct event URL, discovery/check timestamps, source evidence, and any confirmed
event fields. Leave unknown fields absent. Keep proposed edits to existing
events in `proposedChanges` with the existing event ID and supporting source.
Keep dismissed discoveries so later runs do not repeatedly suggest them.

The `sources` list records organization ID, checked page URL, last attempt,
last successful check, and failures or a content fingerprint when available.
`nextOrganizationId` is a checkpoint for continuing a partial pass. A run should
target five minutes, save before stopping, and report which sources remain
unchecked. This time target is not a promise to cover every website daily.

Prefer feeds and known event/news pages, then inspect changed announcements.
Deduplicate by event URL plus organization/title/date; a reused listings URL
alone cannot identify distinct events. Never infer cancellations from a failed
fetch. Keep all public-site edits, commits, and deployments out of discovery runs.

A local Codex schedule can maintain this inbox while the computer and app are
running. A future hosted collector can instead write drafts into the same
database used by the admin dashboard, independently of a developer's laptop.

## Permanent review history and repeat discoveries

The inbox is also the permanent review ledger. Each discovery has a
`reviewDecision` (`pending`, `approved`, or `rejected`) and append-only
`reviewHistory` entries containing `at`, `decision`, and `reason`. Retain source
aliases when a registration URL changes. Keep owner corrections in
`manualCorrections`; scrape results must never overwrite them. Rejection is
per announced occurrence, not an automatic ban on its organization.

Before proposing anything, read this ledger and the public collection. Run
`npm run events:review -- /path/to/candidates.json` on candidate objects (one
object or an array) to check both. `skip-rejected` must not be proposed again;
`already-recorded` is not a new discovery. Save meaningful source changes to
`proposedChanges` for review, without modifying approved values. A
`review-possible-change` needs a human comparison: it may be a rescheduled event,
an undated lead gaining a date, or a separately announced annual occurrence.
Do not inherit the old approval or rejection for a distinct new occurrence.
Changed titles/URLs that the helper cannot confidently match still need a manual
duplicate check. Never replace this ledger with only the latest run's results.

Approval for the scrolling strip alone belongs in `placementReviews.scroll`
with its decision, timestamp, and reason. Append a `scope: "scrolling-strip"`
history entry and keep the calendar's `reviewDecision` unchanged. A strip
approval does not approve a directory association or a calendar listing.

After an owner decision, update `reviewDecision`, append to `reviewHistory`, and
run `npm run events:review` to regenerate `docs/event-review-log.md`. For an
approved publication, store `publishedEventId` and update the public collection
only within an owner-authorized publishing task. Do not treat unanswered items
as rejected. Reopen rejected items only when the owner explicitly asks. Ordinary
discovery runs cannot publish. General source pages may still be fetched to find
new events, but already rejected occurrences should not be researched or offered
again. Keep held series and uncertain leads in the coverage report.
