// Organizer sources checked 2026-09-30. These are discovery links, not calendar events.
// Keep annual festivals undated until a future edition has a confirmed schedule.
export const localHighlights = [
  { name: "The Fly · Digital Gym Cinema", schedule: "Oct 10 · 6:30pm", through: "2026-10-10", url: "https://digitalgym.org/movies/dgc-screen-gems-the-fly/" },
  { name: "Adams Halloween Haunt", schedule: "Oct 24", through: "2026-10-24", url: "https://www.adamsavenuebusiness.com/event-info/halloween-haunt/" },
  { name: "Stockton Halloween Haunt", schedule: "Oct 30 · 3:30–6pm", through: "2026-10-30", url: "https://www.sandiego.gov/event/halloween-haunt-stockton-recreation-center" },
  { name: "Spooky Shakespeare · SD Museum of Art", schedule: "Oct 31 · 1pm & 2:30pm", through: "2026-10-31", url: "https://www.sdmart.org/event/san-diego-shakespeare-society-at-sdma-spooky-shakespeare/" },
  { name: "Little Italy Mercato", schedule: "Wednesdays & Saturdays", url: "https://www.littleitalysd.com/events/mercato" },
  { name: "Ocean Beach Farmers Market", schedule: "Wednesdays", url: "https://oceanbeachsandiego.com/attractions/annual-events/farmers-market-wednesdays" },
  { name: "North Park Farmers Market", schedule: "Thursdays", url: "https://www.northparkfarmersmarket.com/" },
  { name: "Hillcrest Farmers Market", schedule: "Sundays", url: "https://hillcrestfarmersmarket.com/" },
  { name: "Mission Fed ArtWalk", schedule: "Annual arts festival", url: "https://www.artwalksandiego.org/missionfed/" },
  { name: "Adams Avenue Street Fair", schedule: "Annual music festival", url: "https://www.adamsavenuebusiness.com/adams-avenue-street-fair/" },
];

export function currentHighlights(today) {
  // Hide dated items until the visitor's San Diego date is known, so static
  // prerendered pages never promote an expired event before hydration.
  return localHighlights.filter((item) => !item.through || (today && item.through >= today));
}
