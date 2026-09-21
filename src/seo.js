import { organizations, organizationPath } from "./data/organizations.js";
import { events } from "./data/events.js";
import { exampleEventTemplates } from "./data/example-events.js";
import { publicEvents } from "./lib/events.js";

// Keep this origin aligned with GitHub Pages and both CNAME files.
// Confirm ownership and DNS before changing the site's primary domain.
export const SITE_URL = "https://youbelongsandiego.org";
export const SITE_NAME = "You Belong San Diego";

const previewRobots = "noindex, follow";

export const routeMetadata = {
  "/": {
    title: "You Belong San Diego | Where Community Meets Conscience",
    description:
      "Where community meets conscience. Connect across San Diego neighborhoods, support local good, and help advance human rights through local and global action.",
    robots: "index, follow, max-image-preview:large",
  },
  "/explore": {
    title: "Explore Our Mission | You Belong San Diego",
    description:
      "Explore our mission to connect San Diego neighborhoods, support businesses that give back, and turn shared values into local and global action.",
    robots: "index, follow, max-image-preview:large",
  },
  "/about": {
    title: "About Us | You Belong San Diego",
    description:
      "Learn about You Belong San Diego, our commitment to community and human rights, and how to get involved in building a more connected San Diego.",
    robots: "index, follow, max-image-preview:large",
  },
  "/calendar": {
    title: "Community Events Calendar | You Belong San Diego",
    description:
      "Explore the San Diego community calendar. Browse by month and filter events by the causes you care about and the organizations you follow.",
    robots: publicEvents(events).length
      ? "index, follow, max-image-preview:large"
      : previewRobots,
  },
  ...Object.fromEntries(
    organizations.map((organization) => [
      organizationPath(organization),
      {
        title: `${organization.name}${organization.isExample ? " · Example" : ""} | You Belong San Diego`,
        description: organization.isExample
          ? "A fictional organization profile with sample events, showing how the You Belong San Diego directory and calendar will work."
          : organization.description,
        robots: organization.isExample
          ? previewRobots
          : "index, follow, max-image-preview:large",
      },
    ]),
  ),
  ...Object.fromEntries(
    [
      ...exampleEventTemplates.map((event) => ({ ...event, isExample: true })),
      ...publicEvents(events),
    ].map((event) => [
      `/events/${event.id}`,
      {
        title: `${event.title}${event.isExample ? " · Example" : ""} | You Belong San Diego`,
        description: event.isExample
          ? "A fictional event for the You Belong San Diego calendar preview. This is an illustrative example, not a real gathering or booking."
          : event.description,
        robots: event.isExample
          ? previewRobots
          : "index, follow, max-image-preview:large",
      },
    ]),
  ),
  "/businesses-give-back": {
    title: "Community Directory Preview | You Belong San Diego",
    description:
      "Explore an early preview of the You Belong San Diego community directory. Listings are illustrative while we gather verified local recommendations.",
    robots: previewRobots,
  },
  "/directory": {
    title: "Community Directory Preview | You Belong San Diego",
    description:
      "Explore an early preview of the You Belong San Diego community directory. Listings are illustrative while we gather verified local recommendations.",
    robots: previewRobots,
  },
  "/united-neighborhoods": {
    title: "United Neighborhoods | You Belong San Diego",
    description:
      "Help shape United Neighborhoods, a developing space for community connections and neighborhood resources from You Belong San Diego.",
    robots: previewRobots,
  },
  "/global-impact": {
    title: "Global Impact | You Belong San Diego",
    description:
      "Help shape a space for understanding foreign policy, contacting local officials, and advocating for universal human rights from San Diego.",
    robots: previewRobots,
  },
  "/rights-action": {
    title: "Rights & Action | You Belong San Diego",
    description:
      "Help shape a space for free speech, community marches, and connections to legal support for grassroots activism in San Diego.",
    robots: previewRobots,
  },
};

export function getPageMeta(path = "/") {
  const normalizedPath = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const metadata = routeMetadata[normalizedPath] ?? {
    title: "Page Not Found | You Belong San Diego",
    description:
      "This page could not be found. Return to You Belong San Diego to find your way.",
    robots: "noindex, follow",
  };
  return {
    ...metadata,
    canonical: `${SITE_URL}${normalizedPath === "/" ? "/" : `${normalizedPath}/`}`,
  };
}

export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        email: "info@youbelongsandiego.org",
        logo: `${SITE_URL}/assets/favicon.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

// Keep metadata accurate after navigation without a full page reload.
export function updatePageMeta(path) {
  if (typeof document === "undefined") return;
  const metadata = getPageMeta(path);
  document.title = metadata.title;

  const setMeta = (attribute, key, content) => {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.setAttribute("content", content);
  };

  setMeta("name", "description", metadata.description);
  setMeta("name", "robots", metadata.robots);
  setMeta("property", "og:title", metadata.title);
  setMeta("property", "og:description", metadata.description);
  setMeta("property", "og:url", metadata.canonical);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:locale", "en_US");
  setMeta("name", "twitter:card", "summary");
  setMeta("name", "twitter:title", metadata.title);
  setMeta("name", "twitter:description", metadata.description);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = metadata.canonical;
}
