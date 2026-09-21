import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { events } from "../data/events.js";
import { organizations, organizationPath } from "../data/organizations.js";
import { eventSections } from "../data/event-sections.js";
import {
  exampleEventTemplates,
  getExampleEvents,
} from "../data/example-events.js";
import {
  dayLabel,
  eventDateLabel,
  eventDays,
  eventTime,
  filterEvents,
  monthDays,
  monthLabel,
  occursInMonth,
  occursOn,
  publicEvents,
  sanDiegoDay,
  shiftMonth,
  upcomingEvents,
} from "../lib/events.js";

function useToday() {
  const [today, setToday] = useState(null);
  useEffect(() => {
    const update = () => setToday(sanDiegoDay());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);
  return today;
}
function useEventCollection(today) {
  return useMemo(
    () =>
      publicEvents(events).length
        ? publicEvents(events)
        : today
          ? publicEvents(getExampleEvents(today))
          : [],
    [today],
  );
}
export function ExampleEventsNotice() {
  return (
    <div className="event-preview-note">
      <CalendarDays size={22} aria-hidden="true" />
      <p>
        <strong>A little preview of what’s possible.</strong> These are
        fictional events from our example businesses, shown to help you explore
        the calendar. They aren’t real gatherings or bookings.
      </p>
    </div>
  );
}
export function EventList({ items, Link }) {
  return (
    <div className="event-list">
      {items.map((event) => {
        const first = eventDays(event).first;
        return (
          <article
            className={`event-card${event.status === "cancelled" ? " cancelled-event" : ""}`}
            key={event.id}
          >
            <div className="event-date-stamp" aria-hidden="true">
              <span>
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  timeZone: "UTC",
                }).format(new Date(`${first}T12:00:00Z`))}
              </span>
              <strong>{Number(first.slice(-2))}</strong>
            </div>
            <div className="event-card-copy">
              <div className="event-labels">
                {event.isExample && (
                  <span className="sample-badge">Example event</span>
                )}
                {event.status === "cancelled" && (
                  <strong className="cancelled-label">Cancelled</strong>
                )}
                {event.sectionIds.map((id) => (
                  <span className={`event-section-tag section-${id}`} key={id}>
                    {eventSections.find((section) => section.id === id)?.name}
                  </span>
                ))}
              </div>
              <h3>
                <Link href={`/events/${event.id}`}>{event.title}</Link>
              </h3>
              <p className="event-hosts">
                {event.organizationIds.map((id, index) => {
                  const org = organizations.find(
                    (organization) => organization.id === id,
                  );
                  return org ? (
                    <span key={id}>
                      {index > 0 && " + "}
                      <Link href={organizationPath(org)}>{org.name}</Link>
                    </span>
                  ) : null;
                })}
              </p>
              <p className="event-meta">
                <Clock size={15} aria-hidden="true" />
                <span>
                  {eventDateLabel(event)} · {eventTime(event)}
                </span>
              </p>
              <p className="event-meta">
                <MapPin size={15} aria-hidden="true" />
                <span>
                  {event.location} · {event.cost}
                </span>
              </p>
            </div>
            <Link
              className="event-open"
              href={`/events/${event.id}`}
              aria-label={`View ${event.title}`}
            >
              <ArrowUpRight size={22} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
const toggle = (values, value) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
export function CalendarPage({ Link, initialParams = "" }) {
  const today = useToday();
  const collection = useEventCollection(today);
  const exampleMode = !publicEvents(events).length;
  const params = new URLSearchParams(initialParams);
  const selectableOrgs = organizations.filter((org) =>
    exampleMode ? org.isExample : !org.isExample,
  );
  const initialMonth = params.get("month");
  const [chosenMonth, setChosenMonth] = useState(
    /^\d{4}-(0[1-9]|1[0-2])$/.test(initialMonth || "") &&
      Number(initialMonth.slice(0, 4)) >= 2000 &&
      Number(initialMonth.slice(0, 4)) <= 2100
      ? initialMonth
      : null,
  );
  const [sectionIds, setSectionIds] = useState(
    params
      .getAll("section")
      .filter((id) => eventSections.some((section) => section.id === id)),
  );
  const [organizationIds, setOrganizationIds] = useState(
    params
      .getAll("organization")
      .filter((id) => selectableOrgs.some((org) => org.id === id)),
  );
  const [query, setQuery] = useState("");
  const [orgQuery, setOrgQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const month = chosenMonth || today?.slice(0, 7);
  const filtered = filterEvents(
    collection,
    { sectionIds, organizationIds, query },
    organizations,
  );
  const monthEvents = month
    ? filtered.filter((event) => occursInMonth(event, month))
    : [];
  const shownEvents = selectedDay
    ? monthEvents.filter((event) => occursOn(event, selectedDay))
    : monthEvents;
  const hasFilters = sectionIds.length || organizationIds.length || query;
  const reset = () => {
    setSectionIds([]);
    setOrganizationIds([]);
    setQuery("");
    setOrgQuery("");
    setSelectedDay(null);
  };
  const changeMonth = (next) => {
    setChosenMonth(next);
    setSelectedDay(null);
  };
  const filteredOrgs = selectableOrgs.filter((org) =>
    org.name.toLowerCase().includes(orgQuery.trim().toLowerCase()),
  );
  return (
    <>
      <section className="page-hero section-shell calendar-hero">
        <div className="eyebrow">Good things happen together</div>
        <h1>
          Make room for <em>community.</em>
        </h1>
        <p>
          Find a gathering, follow a cause, or try something new. See what’s
          coming up across San Diego, all in one place.
        </p>
      </section>
      <section
        className="section-shell calendar-section"
        aria-label="Community events"
      >
        {exampleMode && <ExampleEventsNotice />}
        <div className="calendar-filters">
          <fieldset>
            <legend>What brings you here?</legend>
            <p className="filter-hint">Choose any combination of sections.</p>
            <div className="event-section-filters">
              {eventSections.map((section) => (
                <label
                  className={`event-filter-chip section-${section.id}${sectionIds.includes(section.id) ? " selected" : ""}`}
                  key={section.id}
                >
                  <input
                    type="checkbox"
                    checked={sectionIds.includes(section.id)}
                    onChange={() => {
                      setSectionIds(toggle(sectionIds, section.id));
                      setSelectedDay(null);
                    }}
                  />
                  <span>{section.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="calendar-search-row">
            <label className="calendar-search">
              <span>Search events</span>
              <span className="search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="An event, a neighborhood, a cause…"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedDay(null);
                  }}
                />
              </span>
            </label>
            <details
              className="organization-filter"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary").focus();
                }
              }}
            >
              <summary>
                {organizationIds.length
                  ? `${organizationIds.length} organization${organizationIds.length === 1 ? "" : "s"} selected`
                  : "All organizations"}
              </summary>
              <div className="organization-options">
                <label>
                  Find an organization
                  <input
                    type="search"
                    value={orgQuery}
                    onChange={(event) => setOrgQuery(event.target.value)}
                    placeholder="Search organizations"
                  />
                </label>
                <fieldset>
                  <legend className="sr-only">Choose organizations</legend>
                  {filteredOrgs.map((org) => (
                    <label key={org.id}>
                      <input
                        type="checkbox"
                        checked={organizationIds.includes(org.id)}
                        onChange={() => {
                          setOrganizationIds(toggle(organizationIds, org.id));
                          setSelectedDay(null);
                        }}
                      />
                      <span>{org.name}</span>
                    </label>
                  ))}
                </fieldset>
                {!filteredOrgs.length && (
                  <p>No organizations match that search.</p>
                )}
              </div>
            </details>
          </div>
          {Boolean(hasFilters) && (
            <div className="active-event-filters">
              <span>Showing matches across your selections.</span>
              <button className="clear-filters" type="button" onClick={reset}>
                Clear filters <X size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {month ? (
          <>
            <div className="calendar-toolbar">
              <div>
                <h2 id="calendar-month" aria-live="polite">
                  {monthLabel(month)}
                </h2>
                <p>
                  {monthEvents.length} {exampleMode ? "example " : ""}event
                  {monthEvents.length === 1 ? "" : "s"} · San Diego time (PT)
                </p>
              </div>
              <div className="month-controls">
                <button
                  type="button"
                  onClick={() => changeMonth(shiftMonth(month, -1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="this-month"
                  type="button"
                  onClick={() => changeMonth(today.slice(0, 7))}
                >
                  This month
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(shiftMonth(month, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <table className="month-calendar" aria-labelledby="calendar-month">
              <thead>
                <tr>
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day) => (
                    <th scope="col" key={day}>
                      <abbr title={day}>{day.slice(0, 3)}</abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, week) => (
                  <tr key={week}>
                    {monthDays(month)
                      .slice(week * 7, week * 7 + 7)
                      .map((day) => {
                        const inMonth = day.startsWith(month);
                        const dayEvents = inMonth
                          ? monthEvents.filter((event) => occursOn(event, day))
                          : [];
                        return (
                          <td
                            key={day}
                            className={`${inMonth ? "" : "outside-month "}${day === today ? "today-cell " : ""}${day === selectedDay ? "selected-day" : ""}`}
                          >
                            {inMonth ? (
                              <button
                                className="calendar-day"
                                type="button"
                                aria-current={
                                  day === today ? "date" : undefined
                                }
                                aria-pressed={day === selectedDay}
                                aria-label={`${dayLabel(day)}${day === today ? ", today" : ""}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                                onClick={() =>
                                  setSelectedDay(
                                    day === selectedDay ? null : day,
                                  )
                                }
                              >
                                <span>{Number(day.slice(-2))}</span>
                                <span className="day-dots" aria-hidden="true">
                                  {dayEvents.slice(0, 3).map((event) => (
                                    <i
                                      className={`section-${event.sectionIds[0]}`}
                                      key={event.id}
                                    />
                                  ))}
                                  {dayEvents.length > 3 && "+"}
                                </span>
                              </button>
                            ) : (
                              <span className="outside-day" aria-hidden="true">
                                {Number(day.slice(-2))}
                              </span>
                            )}
                            <div className="calendar-day-events">
                              {dayEvents.slice(0, 2).map((event) => (
                                <Link
                                  key={event.id}
                                  className={`calendar-event section-${event.sectionIds[0]}${event.status === "cancelled" ? " cancelled-event" : ""}`}
                                  href={`/events/${event.id}`}
                                >
                                  <span>
                                    {event.status === "cancelled"
                                      ? "Cancelled · "
                                      : ""}
                                    {event.title}
                                  </span>
                                </Link>
                              ))}
                              {dayEvents.length > 2 && (
                                <button
                                  type="button"
                                  className="more-day-events"
                                  onClick={() => setSelectedDay(day)}
                                  aria-label={`Show all ${dayEvents.length} events on ${dayLabel(day)}`}
                                >
                                  +{dayEvents.length - 2} more
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="calendar-help">
              Select a date to see its events below. Select it again to see the
              full month.
            </p>
            <div className="event-list-heading">
              <div>
                <span className="eyebrow">A reason to get together</span>
                <h2>
                  {selectedDay
                    ? dayLabel(selectedDay)
                    : `Coming up in ${monthLabel(month)}`}
                </h2>
              </div>
              {selectedDay && (
                <button
                  className="clear-filters"
                  type="button"
                  onClick={() => setSelectedDay(null)}
                >
                  Show full month
                </button>
              )}
            </div>
            <p className="sr-only" role="status">
              {shownEvents.length} events shown for{" "}
              {selectedDay ? dayLabel(selectedDay) : monthLabel(month)}
            </p>
            {shownEvents.length ? (
              <EventList items={shownEvents} Link={Link} />
            ) : (
              <div className="calendar-empty">
                <CalendarDays size={28} aria-hidden="true" />
                <h3>
                  {hasFilters
                    ? "No events match this combination."
                    : "A little room in the calendar."}
                </h3>
                <p>
                  {hasFilters
                    ? "Try another section or organization, or clear your filters."
                    : selectedDay
                      ? "There are no events listed for this day. Try another date or the full month."
                      : "There are no events listed for this month yet. Try a neighboring month."}
                </p>
                {Boolean(hasFilters) && (
                  <button
                    className="clear-filters"
                    type="button"
                    onClick={reset}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="calendar-loading" role="status">
            Loading the calendar…
          </p>
        )}
      </section>
    </>
  );
}
export function OrganizationEvents({ organization, Link }) {
  const today = useToday();
  const collection = organization.isExample
    ? today
      ? getExampleEvents(today)
      : []
    : events;
  const items = today ? upcomingEvents(collection, organization.id) : [];
  return (
    <section className="section-shell organization-events">
      <div className="event-list-heading">
        <div>
          <span className="eyebrow">Make a little time</span>
          <h2>
            {organization.isExample
              ? "Example upcoming events"
              : "Upcoming events"}
          </h2>
        </div>
        <Link
          className="text-link"
          href={`/calendar?organization=${organization.id}${items[0] ? `&month=${eventDays(items[0]).first.slice(0, 7)}` : ""}`}
        >
          View on the calendar <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      {organization.isExample && <ExampleEventsNotice />}
      {!today ? (
        <p role="status">Loading upcoming events…</p>
      ) : items.length ? (
        <EventList items={items} Link={Link} />
      ) : (
        <div className="calendar-empty">
          <h3>No upcoming events listed yet.</h3>
          <p>Check back as more gatherings are added.</p>
        </div>
      )}
    </section>
  );
}
export function EventDetailPage({ id, Link }) {
  const today = useToday();
  const realEvent = publicEvents(events).find((event) => event.id === id);
  const template = exampleEventTemplates.find((event) => event.id === id);
  const event =
    realEvent ||
    (today ? getExampleEvents(today).find((event) => event.id === id) : null);
  const title = realEvent?.title || template?.title;
  return (
    <>
      <section className="page-hero section-shell event-detail-hero">
        <Link
          className="text-link breadcrumb"
          href={
            event
              ? `/calendar?month=${eventDays(event).first.slice(0, 7)}`
              : "/calendar"
          }
        >
          ← Back to the calendar
        </Link>
        <div className="eyebrow">
          {template && !realEvent
            ? "Fictional calendar preview"
            : "A reason to get together"}
        </div>
        <h1>{title}</h1>
        <p>{realEvent?.description || template?.description}</p>
      </section>
      <section className="section-shell event-detail-content">
        {template && !realEvent && <ExampleEventsNotice />}
        {event ? (
          <>
            <div className="event-facts">
              <div>
                <Clock aria-hidden="true" />
                <h2>When</h2>
                <p>
                  {eventDateLabel(event)}
                  <br />
                  {eventTime(event)}
                </p>
              </div>
              <div>
                <MapPin aria-hidden="true" />
                <h2>Where</h2>
                <p>
                  {event.location}
                  <br />
                  {event.cost}
                </p>
              </div>
            </div>
            <div className="event-organizers">
              <h2>Brought together by</h2>
              {event.organizationIds.map((orgId) => {
                const org = organizations.find((item) => item.id === orgId);
                return (
                  org && (
                    <Link
                      className="organizer-link"
                      key={orgId}
                      href={organizationPath(org)}
                    >
                      <span>
                        {org.name}
                        <small>Meet the organization & see its events</small>
                      </span>
                      <ArrowRight size={21} aria-hidden="true" />
                    </Link>
                  )
                );
              })}
            </div>
            {event.status === "cancelled" ? (
              <p className="event-preview-note">
                <strong>This event has been cancelled.</strong>
              </p>
            ) : (
              !event.isExample && (
                <a
                  className="button primary"
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Event details & registration{" "}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              )
            )}
            {!event.isExample && (
              <p className="event-source-note">
                Details checked {event.verifiedAt}. Confirm arrangements with
                the organizer before you go.
              </p>
            )}
          </>
        ) : (
          <p role="status">Loading event details…</p>
        )}
      </section>
    </>
  );
}
