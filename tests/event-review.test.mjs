import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCandidate, sourceKey } from '../scripts/event-review.mjs';

const rejected = { id: 'a', title: 'Film Night', organizationIds: ['cinema'], start: '2026-10-10T18:00:00-07:00', sourceUrl: 'https://example.org/events', reviewDecision: 'rejected' };

test('rejected occurrence stays excluded across changed links and start times', () => {
  const candidate = { ...rejected, id: 'new-id', sourceUrl: 'https://tickets.example/film', start: '2026-10-10T19:00:00-07:00' };
  assert.equal(classifyCandidate(candidate, [rejected]).action, 'skip-rejected');
});

test('shared listings URL does not suppress another event', () => {
  assert.equal(classifyCandidate({ ...rejected, id: 'new', title: 'Another Film' }, [rejected]).action, 'new-draft');
});

test('a new date or annual occurrence needs review instead of inheriting a decision', () => {
  assert.equal(classifyCandidate({ ...rejected, id: 'next-year', start: '2027-10-10' }, [rejected]).action, 'review-possible-change');
});

test('candidate checking preserves owner corrections and review history', () => {
  const approved = { ...rejected, reviewDecision: 'approved', manualCorrections: { start: rejected.start } };
  const original = structuredClone(approved);
  assert.equal(classifyCandidate({ ...approved, start: '2026-10-10T05:00:00-07:00' }, [approved]).action, 'already-recorded');
  assert.deepEqual(approved, original);
});

test('URL normalization removes tracking but preserves event identifiers', () => {
  assert.equal(sourceKey('https://example.org/event?id=1&utm_source=email#top'), 'https://example.org/event?id=1');
  assert.notEqual(sourceKey('https://example.org/event?id=1'), sourceKey('https://example.org/event?id=2'));
});

test('routine cinema films are excluded while community programs and approved exceptions remain', () => {
  const policy = { routineFilmScreenings: { excludeByDefault: true, organizationIds: ['cinema'], sourceHosts: ['digitalgym.org'], reason: 'Owner preference' } };
  const film = { ...rejected, id: 'new-film', sourceUrl: 'https://digitalgym.org/movies/new-film/' };
  assert.equal(classifyCandidate(film, [], policy).action, 'skip-routine-film');
  assert.equal(classifyCandidate({ ...film, id: 'next-year', start: '2027-10-10' }, [film], policy).action, 'skip-routine-film');
  assert.equal(classifyCandidate({ ...film, sourceUrl: 'https://digitalgym.org/community-workshop/' }, [], policy).action, 'new-draft');
  assert.equal(classifyCandidate(film, [{ ...film, reviewDecision: 'approved' }], policy).action, 'already-recorded');
  assert.equal(classifyCandidate({ ...film, editorialRelevance: 'Editor verified a community cultural discussion.' }, [], policy).action, 'new-draft');
});
