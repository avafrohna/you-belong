import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { events } from '../src/data/events.js';

// Keep event IDs/query parameters, but ignore marketing and fragment variants.
export function sourceKey(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_.+|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    return url.href.replace(/\/$/, '');
  } catch { return value; }
}

const titleKey = value => (value || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const day = event => event.start?.slice(0, 10);
const urls = event => [event.sourceUrl, ...(event.sourceAliases || [])].filter(Boolean).map(sourceKey);

// Read-only: discovery never changes an owner's decision or corrected fields.
export function classifyCandidate(candidate, records, policy = {}) {
  let possibleChange;
  for (const record of records) {
    if (candidate.id && candidate.id === record.id) return result(record);
    const sameOrg = candidate.organizationIds?.some(id => record.organizationIds?.includes(id));
    if (!sameOrg) continue;
    const sameUrl = urls(candidate).some(url => urls(record).includes(url));
    const sameTitle = titleKey(candidate.title) === titleKey(record.title);
    const sameDay = day(candidate) === day(record);
    // Shared calendar/listing URLs alone are not event identities.
    if (sameTitle && sameDay) return result(record);
    if (sameUrl && sameTitle) possibleChange = { action: 'review-possible-change', existingId: record.id };
  }
  const films = policy.routineFilmScreenings;
  if (films?.excludeByDefault) {
    let cinemaFilm = false;
    try {
      const url = new URL(candidate.sourceUrl);
      cinemaFilm = films.sourceHosts?.includes(url.hostname.replace(/^www\./, '')) && url.pathname.startsWith('/movies/');
    } catch { /* Invalid URLs are handled by content validation. */ }
    const orgFilm = candidate.eventType === 'film-screening' && candidate.organizationIds?.some(id => films.organizationIds?.includes(id));
    if ((cinemaFilm || orgFilm) && !candidate.editorialRelevance?.trim()) {
      return { action: 'skip-routine-film', reason: films.reason };
    }
  }
  return possibleChange || { action: 'new-draft' };
}

function result(record) {
  const rejected = record.reviewDecision === 'rejected' || record.status === 'dismissed';
  return {
    action: rejected ? 'skip-rejected' : 'already-recorded',
    existingId: record.id,
    reviewDecision: record.reviewDecision || (record.status === 'published' ? 'approved' : 'pending'),
  };
}

export function reviewReport(inbox) {
  const records = inbox.discoveries;
  const counts = Object.fromEntries(['approved', 'pending', 'rejected'].map(decision =>
    [decision, records.filter(record => record.reviewDecision === decision).length]));
  const lines = [
    '# Event review log', '',
    `${records.length} discoveries: ${counts.approved} approved for the calendar, ${counts.pending} pending, ${counts.rejected} rejected. Separately, ${records.filter(record => record.placementReviews?.scroll?.decision === 'approved').length} discoveries are approved for the scrolling strip.`, '',
    'This is the retained research ledger, not the total number of events on the website. Previously published events are also checked during deduplication. Coverage notes and held series remain in event-discovery-review-2026-09-30.md.', '',
    'Never delete a rejected discovery. Record each owner decision in reviewHistory with its date and reason. Reopen it only at the owner’s request. New annual occurrences and possible date changes require separate review. Calendar approval and homepage-strip placement are separate.', '',
    '| # | Date (Pacific) | Event | Calendar decision | Scrolling strip |', '|---|---|---|---|---|',
    ...records.map((record, index) => `| ${index + 1} | ${record.start || 'Unconfirmed'} | [${record.title.replaceAll('|', ' / ')}](${record.sourceUrl}) | ${record.reviewDecision} | ${record.placementReviews?.scroll?.decision || '—'} |`),
    '', '## Arts program review history', '',
    ...records.filter(record => record.reviewGroup === 'arts-options').flatMap(record => [
      `**${records.indexOf(record) + 1}. [${record.title}](${record.sourceUrl}) — ${record.reviewDecision}**`, '', record.description || 'Description pending.', '',
    ]),
  ];
  return lines.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const inboxPath = new URL('../docs/event-discovery-inbox.json', import.meta.url);
  const inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf8'));
  if (process.argv[2]) {
    const candidates = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    const records = [...inbox.discoveries, ...(inbox.dismissed || []), ...events];
    console.log(JSON.stringify([candidates].flat().map(candidate => ({ title: candidate.title, ...classifyCandidate(candidate, records, inbox.reviewPolicy) })), null, 2));
  } else {
    const report = reviewReport(inbox);
    fs.writeFileSync(new URL('../docs/event-review-log.md', import.meta.url), report);
    console.log(report.split('\n')[2]);
  }
}
