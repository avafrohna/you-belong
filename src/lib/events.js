export const EVENT_TIME_ZONE = "America/Los_Angeles";
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const pad = (n) => String(n).padStart(2, "0");

export function sanDiegoDay(value = new Date()) {
  const parts = Object.fromEntries(
    dayFormatter
      .formatToParts(new Date(value))
      .map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function shiftDay(day, offset) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
export function shiftMonth(month, offset) {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}
export function monthLabel(month) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
}
export function dayLabel(day) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}
export function monthDays(month) {
  const first = `${month}-01`;
  const offset = new Date(`${first}T12:00:00Z`).getUTCDay();
  return Array.from({ length: 42 }, (_, index) =>
    shiftDay(first, index - offset),
  );
}
export function eventDays(event) {
  return event.allDay
    ? { first: event.start, last: shiftDay(event.end, -1) }
    : {
        first: sanDiegoDay(event.start),
        last: sanDiegoDay(new Date(Date.parse(event.end) - 1)),
      };
}
export function occursOn(event, day) {
  const { first, last } = eventDays(event);
  return first <= day && last >= day;
}
export function occursInMonth(event, month) {
  const { first, last } = eventDays(event);
  return first < `${shiftMonth(month, 1)}-01` && last >= `${month}-01`;
}
export function publicEvents(records) {
  return records
    .filter((event) => ["published", "cancelled"].includes(event.status))
    .sort(
      (a, b) =>
        eventDays(a).first.localeCompare(eventDays(b).first) ||
        (a.allDay === b.allDay
          ? Date.parse(a.start) - Date.parse(b.start)
          : a.allDay
            ? -1
            : 1) ||
        a.title.localeCompare(b.title),
    );
}
export function filterEvents(
  records,
  { sectionIds = [], organizationIds = [], query = "" } = {},
  organizations = [],
) {
  const search = query.trim().toLocaleLowerCase();
  return records.filter(
    (event) =>
      (!sectionIds.length ||
        event.sectionIds.some((id) => sectionIds.includes(id))) &&
      (!organizationIds.length ||
        event.organizationIds.some((id) => organizationIds.includes(id))) &&
      (!search ||
        [
          event.title,
          event.description,
          event.location,
          ...event.organizationIds.map(
            (id) => organizations.find((org) => org.id === id)?.name || "",
          ),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(search)),
  );
}
export function upcomingEvents(records, organizationId, now = new Date()) {
  return publicEvents(records).filter(
    (event) =>
      event.organizationIds.includes(organizationId) &&
      (event.allDay
        ? event.end > sanDiegoDay(now)
        : Date.parse(event.end) > new Date(now).getTime()),
  );
}
export function eventTime(event) {
  if (event.allDay) return "All day";
  const format = (value) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: EVENT_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  return `${format(event.start)} – ${format(event.end)} PT`;
}
export function eventDateLabel(event) {
  const { first, last } = eventDays(event);
  return first === last
    ? dayLabel(first)
    : `${dayLabel(first)} – ${dayLabel(last)}`;
}

export function validateEventData(records, organizations, sections) {
  const ids = new Set();
  const orgIds = new Set();
  const sectionIds = new Set(sections.map((section) => section.id));
  const fail = (message) => {
    throw new Error(message);
  };
  const validDay = (value) =>
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  const validUrl = (value) => {
    try {
      return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  };
  for (const org of organizations) {
    if (
      typeof org.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(org.id) ||
      orgIds.has(org.id)
    )
      fail(`Invalid or duplicate organization id: ${org.id}`);
    orgIds.add(org.id);
    if (
      !org.name ||
      !org.description ||
      !org.sectionIds?.length ||
      org.sectionIds.some((id) => !sectionIds.has(id))
    )
      fail(`Incomplete organization: ${org.id}`);
    if (!org.isExample && !validUrl(org.website))
      fail(`Organization needs a public website: ${org.id}`);
  }
  for (const event of records) {
    const label = event.id || "(missing id)";
    if (
      typeof event.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id) ||
      ids.has(event.id)
    )
      fail(`Invalid or duplicate event id: ${label}`);
    ids.add(event.id);
    if (event.id.startsWith("example-") || event.isExample)
      fail(`Real event records cannot use the example namespace: ${label}`);
    if (!["draft", "published", "cancelled"].includes(event.status))
      fail(`Invalid status: ${label}`);
    if (
      ![event.title, event.description, event.location, event.cost].every(
        (value) => typeof value === "string" && value.trim(),
      )
    )
      fail(`Missing event details: ${label}`);
    if (typeof event.allDay !== "boolean") fail(`Specify allDay: ${label}`);
    if (event.allDay) {
      if (
        !validDay(event.start) ||
        !validDay(event.end) ||
        event.end <= event.start
      )
        fail(`Invalid all-day dates (end is exclusive): ${label}`);
    } else {
      const timestamp =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/;
      if (
        ![event.start, event.end].every(
          (value) =>
            timestamp.test(value) &&
            validDay(value.slice(0, 10)) &&
            Number.isFinite(Date.parse(value)),
        ) ||
        Date.parse(event.end) <= Date.parse(event.start)
      )
        fail(`Timed events need valid start/end with UTC offsets: ${label}`);
    }
    if (
      !event.sectionIds?.length ||
      event.sectionIds.some((id) => !sectionIds.has(id))
    )
      fail(`Unknown or missing section: ${label}`);
    if (
      !event.organizationIds?.length ||
      event.organizationIds.some((id) => !orgIds.has(id))
    )
      fail(`Unknown or missing organization: ${label}`);
    if (
      event.status !== "draft" &&
      event.organizationIds.some(
        (id) => organizations.find((org) => org.id === id).isExample,
      )
    )
      fail(`Fictional organizations cannot publish events: ${label}`);
    if (!validUrl(event.sourceUrl) || !validDay(event.verifiedAt))
      fail(`Source URL and review date required: ${label}`);
    if (!["manual", "website", "feed"].includes(event.sourceType))
      fail(`Invalid source type: ${label}`);
  }
}
