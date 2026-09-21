import { listings } from "./listings.js";

// Add verified, real organizations here. See docs/events.md for the format.
export const communityOrganizations = [];

// Existing directory examples remain explicitly fictional and are excluded
// from the calendar's organization filters and published event records.
export const organizations = [
  ...communityOrganizations,
  ...listings.map((listing) => ({
    ...listing,
    description: listing.blurb,
    sectionIds: ["businesses-give-back"],
    isExample: true,
    profilePath: `/business/${listing.id}`,
  })),
];

export const organizationPath = (organization) =>
  organization.profilePath || `/organizations/${organization.id}`;
export const getOrganization = (id) =>
  organizations.find((organization) => organization.id === id);
