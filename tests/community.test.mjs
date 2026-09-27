import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { events } from '../src/data/events.js';
import { organizations } from '../src/data/organizations.js';
import { eventSections } from '../src/data/event-sections.js';
import { validateEventData } from '../src/lib/events.js';

test('published collection uses real organizations and reviewed standalone events', () => {
  validateEventData(events, organizations, eventSections);
  assert.ok(organizations.length > 0);
  assert.ok(organizations.every((org) => !org.isExample));
  assert.ok(!organizations.some((org) => org.id === 'house-of-palestine'));
  assert.ok(organizations.some((org) => org.id === 'house-of-pacific-relations'));
  assert.ok(organizations.some((org) => org.id === 'san-diego-foundation'));
  assert.ok(events.every((event) => !event.isExample && !event.rrule && !event.recurrence));
});

test('calendar and list event links are external; former event URLs render the 404', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { EventList, CalendarPage } = await server.ssrLoadModule('/src/components/Events.jsx');
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    const Link = (props) => React.createElement('a', props);
    const list = renderToStaticMarkup(React.createElement(EventList, { items: events, Link }));
    const calendar = renderToStaticMarkup(React.createElement(CalendarPage, { initialParams: 'month=2026-10', Link }));
    assert.ok(calendar.includes('October 2026'));
    for (const html of [list, calendar]) {
      assert.ok(!html.includes('href="/events/'));
      assert.ok(!html.includes('Example event'));
    }
    const links = [...calendar.matchAll(/<a\b[^>]*class="calendar-event [^"]*"[^>]*href="([^"]+)"[^>]*>/g)];
    assert.ok(links.length > 0, 'calendar must render linked events');
    assert.ok(links.every((match) => match[1].startsWith('https://')));
    for (const event of events) {
      assert.ok(list.includes(`href="${event.sourceUrl.replaceAll('&', '&amp;')}"`));
    }
    const minimal = { ...events[0], id: "minimal-event" };
    for (const key of ["start", "end", "description", "location", "cost"]) delete minimal[key];
    const minimalHtml = renderToStaticMarkup(React.createElement(EventList, { items: [minimal], Link }));
    assert.ok(minimalHtml.includes("Date to be announced"));
    assert.ok(!minimalHtml.includes("Invalid Date"));
    assert.ok(minimalHtml.includes(`href="${minimal.sourceUrl}"`));
    const dateOnlyHtml = renderToStaticMarkup(React.createElement(EventList, { items: [{ ...minimal, start: "2026-10-04", dateOnly: true }], Link }));
    assert.ok(dateOnlyHtml.includes("Time to be announced"));
    assert.ok(!dateOnlyHtml.includes("All day"));
    const oldPage = renderToStaticMarkup(React.createElement(App, { initialPath: '/events/wac-france-2026/' }));
    assert.ok(oldPage.includes('A little off the path'));
  } finally {
    await server.close();
  }
});
