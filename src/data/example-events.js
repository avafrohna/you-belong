import { shiftDay, shiftMonth, sanDiegoDay } from "../lib/events.js";

// Fictional examples only. They are separate from the real event collection,
// cannot be imported as live events, and have no booking or source links.
export const exampleEventTemplates = [
  {
    id: "example-neighborhood-coffee",
    title: "Meet your neighbors over coffee",
    organizationIds: ["luna-coffee-collective"],
    sectionIds: ["united-neighborhoods", "businesses-give-back"],
    month: 0,
    day: 24,
    hour: 10,
    location: "North Park · example venue",
    description:
      "A relaxed morning of introductions, conversation, and finding familiar faces in the neighborhood.",
    cost: "Free",
  },
  {
    id: "example-community-reading",
    title: "Stories without borders",
    organizationIds: ["fair-shake-books"],
    sectionIds: ["global-impact", "rights-action"],
    month: 0,
    day: 26,
    hour: 18,
    location: "Hillcrest · example venue",
    description:
      "An evening of reading and conversation about human rights, free expression, and our connections across borders.",
    cost: "Free",
  },
  {
    id: "example-community-table",
    title: "Around the community table",
    organizationIds: ["comida-con-corazon", "luna-coffee-collective"],
    sectionIds: ["united-neighborhoods", "businesses-give-back"],
    month: 0,
    day: 26,
    hour: 12,
    location: "Barrio Logan · example venue",
    description:
      "Share a meal, bring a friend, and get to know people doing good close to home.",
    cost: "Pay what you can",
  },
  {
    id: "example-coastal-cleanup",
    title: "A little care for the coast",
    organizationIds: ["sunrise-surf-exchange"],
    sectionIds: ["united-neighborhoods", "businesses-give-back"],
    month: 1,
    day: 3,
    hour: 9,
    location: "Oceanside · example meeting point",
    description:
      "A welcoming morning outdoors, picking up litter and connecting with other neighbors who care about the coast.",
    cost: "Free",
  },
  {
    id: "example-rights-reading",
    title: "The freedom to read",
    organizationIds: ["fair-shake-books"],
    sectionIds: ["rights-action"],
    month: 1,
    day: 10,
    hour: 17,
    location: "Hillcrest · example venue",
    description:
      "A community book conversation about free expression and whose stories get heard.",
    cost: "Free",
  },
  {
    id: "example-open-studio",
    title: "Movement for every body",
    organizationIds: ["all-bodies-strength"],
    sectionIds: ["united-neighborhoods", "businesses-give-back"],
    month: 1,
    day: 17,
    hour: 11,
    location: "La Mesa · example venue",
    description:
      "An inclusive introduction to movement, with room to join at your own pace.",
    cost: "Free",
  },
  {
    id: "example-giving-weekend",
    title: "A weekend of giving back",
    organizationIds: ["south-bay-growers", "moonlight-farm-stand"],
    sectionIds: ["global-impact", "businesses-give-back"],
    month: 1,
    day: 23,
    allDay: true,
    duration: 2,
    location: "San Diego County · example venues",
    description:
      "Two days of sharing fresh food and learning how local support can welcome newly arrived neighbors.",
    cost: "Free",
  },
  {
    id: "example-fresh-start",
    title: "Fresh starts, familiar faces",
    organizationIds: ["bloom-barbershop"],
    sectionIds: ["united-neighborhoods", "businesses-give-back"],
    month: 2,
    day: 7,
    hour: 10,
    location: "City Heights · example venue",
    description:
      "A neighborhood gathering to make connections and share resources for a fresh start.",
    cost: "Free",
  },
  {
    id: "example-shared-futures",
    title: "Local voices, shared futures",
    organizationIds: ["fair-shake-books", "luna-coffee-collective"],
    sectionIds: ["global-impact", "rights-action"],
    month: 2,
    day: 14,
    hour: 14,
    location: "North Park · example venue",
    description:
      "A conversation about peace, human rights, and ways to turn shared values into local action.",
    cost: "Free",
  },
];

export function getExampleEvents(today = sanDiegoDay()) {
  return exampleEventTemplates.map((template) => {
    const day = `${shiftMonth(today.slice(0, 7), template.month)}-${String(template.day).padStart(2, "0")}`;
    // Sample daytime events follow the actual Pacific offset for their date.
    const zone = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date(`${day}T12:00:00Z`))
      .find((part) => part.type === "timeZoneName").value;
    const offset = `-${String(Math.abs(Number(zone.replace("GMT", "")))).padStart(2, "0")}:00`;
    return {
      ...template,
      isExample: true,
      status: "published",
      allDay: Boolean(template.allDay),
      start: template.allDay
        ? day
        : `${day}T${String(template.hour).padStart(2, "0")}:00:00${offset}`,
      end: template.allDay
        ? shiftDay(day, template.duration)
        : `${day}T${String(template.hour + 2).padStart(2, "0")}:00:00${offset}`,
    };
  });
}
