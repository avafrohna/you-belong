import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Search,
  Store,
  Users,
  X,
} from "lucide-react";
import { updatePageMeta, SITE_URL } from "./seo.js";
import { organizations, organizationPath } from "./data/organizations.js";
import {
  CalendarPage,
  OrganizationEvents,
} from "./components/Events.jsx";

const email = "info@youbelongsandiego.org";
const sections = [
  {
    id: "united-neighborhoods",
    href: "/united-neighborhoods",
    name: "United Neighborhoods",
    description:
      "Connect across San Diego’s diverse neighborhoods and discover the strength we build together.",
    focus: [
      "Connections across diverse neighborhoods",
      "Welcoming spaces for newcomers and longtime locals",
      "Neighborhood initiatives rooted in shared values",
    ],
    status: "Meet the organizations",
    icon: Users,
  },
  {
    id: "global-impact",
    href: "/global-impact",
    name: "Global Impact",
    description:
      "Engage with foreign policy, contact local officials, and advocate for universal human rights.",
    focus: [
      "Foreign policy and its connections to our community",
      "Ways to contact local officials",
      "Advocacy for universal human rights and peace",
    ],
    status: "Meet the organizations",
    icon: Globe,
  },
  {
    id: "rights-action",
    href: "/rights-action",
    name: "Rights & Action",
    description:
      "Defend free speech, organize marches, and find legal support for grassroots activism.",
    focus: [
      "Free speech, privacy, and free expression",
      "Community-organized marches",
      "Legal support resources for grassroots activism",
    ],
    status: "Meet the organizations",
    icon: Megaphone,
  },
  {
    id: "businesses-give-back",
    href: "/businesses-give-back",
    name: "Businesses That Give Back",
    description:
      "Discover local businesses that support their communities and lift up marginalized groups.",
    focus: [
      "Local businesses that go beyond profit",
      "Support for communities and marginalized groups",
      "Commerce and conscience, hand in hand",
    ],
    status: "Help this guide grow",
    icon: Store,
  },
];

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";
function useRoute(initialPath) {
  const [location, setLocation] = useState(
    () =>
      initialPath ||
      (typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  useEffect(() => {
    const update = () =>
      setLocation(window.location.pathname + window.location.search);
    update();
    window.addEventListener("popstate", update);
    window.addEventListener("app:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("app:navigate", update);
    };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      if (hash)
        document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);
  return location;
}
function Link({ href, children, onClick, ...props }) {
  const url = new URL(href, SITE_URL);
  const resolvedHref = href.startsWith("/")
    ? `${url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`}${url.search}${url.hash}`
    : href;
  return (
    <a
      href={resolvedHref}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          !href.startsWith("/") ||
          props.target ||
          props.download
        )
          return;
        event.preventDefault();
        const next = new URL(resolvedHref, window.location.origin);
        window.history.pushState(
          {},
          "",
          next.pathname + next.search + next.hash,
        );
        window.dispatchEvent(new Event("app:navigate"));
        if (next.hash)
          requestAnimationFrame(() =>
            document
              .getElementById(decodeURIComponent(next.hash.slice(1)))
              ?.scrollIntoView(),
          );
      }}
    >
      {children}
    </a>
  );
}
function App({ initialPath }) {
  const location = useRoute(initialPath);
  const path = normalizePath(location.split("?")[0]);
  const params = location.split("?")[1] || "";
  const activeSection = sections.find((section) => section.href === path);
  const organization = organizations.find(
    (item) => organizationPath(item) === path,
  );
  const previousPath = useRef(path);
  useEffect(() => {
    updatePageMeta(path);
    if (previousPath.current !== path)
      document.getElementById("main-content")?.focus({ preventScroll: true });
    previousPath.current = path;
  }, [path]);
  let page;
  if (path === "/") page = <HomePage />;
  else if (path === "/explore") page = <ExplorePage />;
  else if (path === "/about") page = <AboutPage />;
  else if (path === "/calendar")
    page = <CalendarPage key={location} Link={Link} initialParams={params} />;
  else if (path === "/directory")
    page = <OrganizationDirectoryPage key={location} initialParams={params} />;
  else if (organization)
    page = <OrganizationDetailPage organization={organization} />;
  else if (activeSection)
    page = activeSection.id === "businesses-give-back"
      ? <ComingSoonPage section={activeSection} />
      : <OrganizationDirectoryPage key={location} section={activeSection} initialParams={params} />;
  else page = <NotFoundPage />;
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader currentPath={path} />
      <main id="main-content" tabIndex={-1}>
        {page}
      </main>
      <SiteFooter />
    </>
  );
}
function Brand({ footer = false }) {
  return (
    <Link
      className={`brand${footer ? " footer-brand" : ""}`}
      href="/"
      aria-label="You Belong San Diego home"
    >
      <img src="/assets/logo-mark-white.svg" width="54" height="35" alt="" />
      <span>
        <strong>you belong</strong>
        <small>SAN DIEGO</small>
      </span>
    </Link>
  );
}
function SiteHeader({ currentPath }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);
  const nav = [
    { href: "/explore", label: "Explore" },
    { href: "/directory", label: "Local directory" },
    { href: "/calendar", label: "Calendar" },
    { href: "/about", label: "Our story" },
  ];
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="nav-shell">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          ref={toggle}
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        className="mobile-nav"
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={currentPath === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
function HomePage() {
  return (
    <>
      <section className="hero section-shell" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="little-sun" aria-hidden="true">
              ✳
            </span>{" "}
            Where community meets conscience.
          </div>
          <h1 id="home-title">
            Find your people.
            <br />
            <em>Put down roots.</em>
          </h1>
          <p>
            San Diego is more than sunshine and coastlines. It’s a city of
            people who care. Whether you’ve just arrived or been here for years,
            connect with others who believe change starts locally and ripples
            globally.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/explore">
              Find your starting point{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" href="/about">
              Get to know us <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="small-dot" /> A growing community project. Always
            free to explore.
          </div>
        </div>
        <figure className="hero-visual">
          <div className="photo-frame">
            <img
              src="/assets/san-diego-real.jpg"
              alt="California Tower above the gardens at Balboa Park in San Diego"
              width="960"
              height="1280"
              fetchPriority="high"
            />
            <span className="photo-label">
              <MapPin size={15} aria-hidden="true" /> A little corner of San
              Diego
            </span>
          </div>
          <figcaption>
            <span>Good things start close to home.</span>
            <a
              href="https://commons.wikimedia.org/wiki/File:California_tower_gardens_at_Balboa_Park_2022.jpg"
              target="_blank"
              rel="noreferrer"
            >
              Photo credit <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </figcaption>
        </figure>
      </section>
      <div className="welcome-strip">
        <div className="section-shell">
          <span>New here? Lived here forever?</span>
          <strong>There’s room for you.</strong>
          <HeartHandshake size={24} aria-hidden="true" />
        </div>
      </div>
      <section
        id="explore"
        className="section-shell section-block"
        aria-labelledby="explore-title"
      >
        <div className="section-intro">
          <div>
            <div className="eyebrow">Big city. Small starting points.</div>
            <h2 id="explore-title">What brings you here?</h2>
          </div>
          <p>
            Four ways to connect, share your values, and make a difference—from
            your own neighborhood to the wider world.
          </p>
        </div>
        <div className="category-grid">
          {sections.map((section, index) => (
            <Link
              className={`category-card category-${index}`}
              href={section.href}
              key={section.id}
            >
              <div className="card-top">
                <section.icon size={25} strokeWidth={1.5} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{section.name}</h3>
              <p>{section.description}</p>
              <div className="card-bottom">
                <span>{section.status}</span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mission-section section-shell">
        <div>
          <div className="eyebrow">Compassion meets action</div>
          <h2>
            A city feels different
            <br />
            when you <em>belong.</em>
          </h2>
        </div>
        <div className="mission-copy">
          <p>
            We’re a community built on shared values: celebrating diversity,
            defending human rights, protecting privacy and free expression, and
            working toward peace, near and far.
          </p>
          <p>
            From neighborhood initiatives to global causes, we bring people,
            stories, and movements together. We also shine a light on local
            businesses that go beyond profit, give back, and lift up
            marginalized communities.
          </p>
          <p>
            Newcomers find their people. Locals deepen their roots. Everyone
            finds a way to make a difference. <strong>Welcome home.</strong>
          </p>
          <Link className="text-link" href="/about">
            More about our mission <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <Callout />
    </>
  );
}
function ExplorePage() {
  return (
    <>
      <section className="page-hero section-shell">
        <div className="eyebrow">Local roots. Global reach.</div>
        <h1>
          Find your way to
          <br />
          <em>make a difference.</em>
        </h1>
        <p>
          Belonging grows when shared values become shared action. These four
          parts of You Belong San Diego connect neighborhood life with the
          causes and communities that matter, near and far.
        </p>
      </section>
      <section
        className="section-shell explore-section"
        aria-label="Our four areas of focus"
      >
        <div className="explore-grid">
          {sections.map((section, index) => (
            <article
              className={`explore-card category-${index}`}
              key={section.id}
            >
              <div className="card-top">
                <section.icon size={27} strokeWidth={1.5} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h2>{section.name}</h2>
              <p>{section.description}</p>
              <h3>What we’re building</h3>
              <ul>
                {section.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="explore-card-footer">
                <span>{section.status}</span>
                <Link
                  className="text-link"
                  href={section.href}
                  aria-label={`Explore ${section.name}`}
                >
                  {section.id === "businesses-give-back"
                    ? "Help shape this guide"
                    : "Explore this area"}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Callout />
    </>
  );
}
function Callout() {
  return (
    <section className="callout-band">
      <div className="section-shell callout-content">
        <div className="callout-symbol" aria-hidden="true">
          ✳
        </div>
        <div>
          <div className="eyebrow">Help shape what comes next</div>
          <h2>Know a little local good?</h2>
          <p>
            A welcoming group. A business that gives back. A cause worth showing
            up for. We’d love to hear about it.
          </p>
        </div>
        <a
          className="button light"
          href={`mailto:${email}?subject=A%20local%20recommendation`}
        >
          Share a recommendation <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
function OrganizationDirectoryPage({ initialParams = "", section }) {
  const params = new URLSearchParams(initialParams);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(
    section?.id || (sections.some((item) => item.id === params.get("section")) ? params.get("section") : "all"),
  );
  const filtered = useMemo(() => organizations.filter((organization) =>
    (category === "all" || organization.sectionIds.includes(category)) &&
    `${organization.name} ${organization.description} ${organization.organizationType}`.toLowerCase().includes(query.trim().toLowerCase()),
  ), [query, category]);
  const reset = () => { setQuery(""); setCategory(section?.id || "all"); };
  return (
    <>
      <section className="page-hero section-shell">
        <div className="eyebrow">Local roots. Shared purpose.</div>
        <h1>{section ? section.name : <>Find your people.<br /><em>Make a little good.</em></>}</h1>
        <p>{section?.description || "Meet the organizations connecting San Diego, standing up for human rights, and making a difference near and far. Find their work, their websites, and their upcoming events."}</p>
        {section && <Link className="text-link listing-detail-link" href="/directory">Browse all organizations <ArrowRight size={17} aria-hidden="true" /></Link>}
      </section>
      <section className="section-shell directory-section" aria-label="Organization directory">
        <div className="directory-controls">
          <label className="search-label" htmlFor="directory-search">Find a cause or a community</label>
          <div className="search-field">
            <Search size={20} aria-hidden="true" />
            <input id="directory-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try arts, refugees, or an organization name" />
          </div>
          {!section && <div className="filters-row"><fieldset>
            <legend>Explore by section</legend>
            <div className="filter-buttons">
              <FilterButton active={category === "all"} onClick={() => setCategory("all")}>All organizations</FilterButton>
              {sections.map((item) => <FilterButton key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>{item.name}</FilterButton>)}
            </div>
          </fieldset></div>}
        </div>
        <div className="results-meta">
          <span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "organization" : "organizations"}</span>
          {(query || category !== (section?.id || "all")) && <button type="button" className="clear-filters" onClick={reset}>Clear filters <X size={15} aria-hidden="true" /></button>}
        </div>
        <div className="results-grid">
          {filtered.map((organization) => <article className="listing-card organization-card" key={organization.id}>
            <div className="listing-top">{organization.organizationType}</div>
            <h2><Link href={organizationPath(organization)}>{organization.name}</Link></h2>
            <p>{organization.description}</p>
            <div className="tag-list">{organization.sectionIds.map((id) => <span key={id}>{sections.find((item) => item.id === id)?.name}</span>)}</div>
            <Link className="text-link listing-detail-link" href={organizationPath(organization)}>Meet the organization & see events <ArrowRight size={16} aria-hidden="true" /></Link>
          </article>)}
        </div>
        {!filtered.length && <div className="empty-state">
          <Search size={28} aria-hidden="true" />
          <h2>{category === "businesses-give-back" && !query ? "A little local good, coming soon." : "No matches this time."}</h2>
          <p>{category === "businesses-give-back" && !query ? "We’re gathering recommendations for businesses that give back. Know one that belongs here? Share it below." : "Try another search or clear your filters."}</p>
          <button type="button" className="button primary" onClick={reset}>Clear filters</button>
        </div>}
      </section>
      <Callout />
    </>
  );
}
function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`filter-button${active ? " active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function AboutPage() {
  return (
    <>
      <section className="page-hero section-shell about-hero">
        <div className="eyebrow">Welcome to You Belong San Diego</div>
        <h1>
          Everyone deserves
          <br />
          <em>a place to belong.</em>
        </h1>
        <p>
          Where community meets conscience. A space for newcomers and longtime
          locals to connect through shared values, deepen their roots, and make
          a difference, here in San Diego and beyond.
        </p>
      </section>
      <section className="section-shell about-story">
        <div className="story-heading">
          <span className="little-sun" aria-hidden="true">
            ✳
          </span>
          <h2>
            Local roots.
            <br />
            Shared values.
          </h2>
        </div>
        <div>
          <p>
            San Diego is more than sunshine and coastlines—it’s a city of people
            who care. Whether you’ve just arrived or you’ve been here for years,
            this is your space to connect with others who believe that
            meaningful change starts locally and ripples globally.
          </p>
          <p>
            We’re a community built on shared values: celebrating diversity,
            defending human rights, protecting privacy and free expression, and
            working toward peace both near and far. From neighborhood
            initiatives to global causes, we bring together the people, stories,
            and movements that make San Diego a place where compassion meets
            action.
          </p>
          <p>
            We also shine a spotlight on local businesses that go beyond profit:
            those that give back, lift up marginalized communities, and show
            that commerce and conscience can go hand in hand.
          </p>
          <p>
            This is where newcomers find their people, locals deepen their
            roots, and everyone finds a way to make a difference.{" "}
            <strong>Welcome home.</strong>
          </p>
        </div>
      </section>
      <section className="section-shell section-block">
        <div className="section-intro">
          <div>
            <div className="eyebrow">What brings us together</div>
            <h2>Shared values. Meaningful action.</h2>
          </div>
        </div>
        <div className="value-grid">
          <ValueCard
            icon={Users}
            title="Diversity & belonging"
            text="Connect across San Diego’s diverse neighborhoods and build a community where newcomers and longtime locals can feel at home."
          />
          <ValueCard
            icon={Globe}
            title="Human rights & peace"
            text="Defend human rights, privacy, and free expression, and turn local compassion into action for peace near and far."
          />
          <ValueCard
            icon={HeartHandshake}
            title="Commerce & conscience"
            text="Shine a spotlight on businesses that go beyond profit, give back to their communities, and lift up marginalized groups."
          />
        </div>
      </section>
      <Callout />
    </>
  );
}
function ValueCard({ icon: Icon, title, text }) {
  return (
    <article className="value-card">
      <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function OrganizationDetailPage({ organization }) {
  return (
    <>
      <section className="page-hero section-shell organization-hero">
        <Link className="text-link breadcrumb" href="/directory">← Back to the local directory</Link>
        <div className="eyebrow">{organization.organizationType}</div>
        <h1>{organization.name}</h1>
        <p>{organization.description}</p>
        <div className="organization-website">
          <a className="button primary" href={organization.website} target="_blank" rel="noopener noreferrer">
            Visit their website <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <span>{new URL(organization.website).hostname.replace(/^www\./, "")}</span>
        </div>
        {organization.programWebsite && <a className="text-link listing-detail-link" href={organization.programWebsite} target="_blank" rel="noopener noreferrer">{organization.programWebsiteLabel} <ArrowUpRight size={17} aria-hidden="true" /></a>}
        <div className="organization-sections" aria-label="Areas of focus">
          {organization.sectionIds.map((id) => <Link key={id} className={`event-section-tag section-${id}`} href={`/${id}`}>{sections.find((item) => item.id === id)?.name}</Link>)}
        </div>
      </section>
      <OrganizationEvents organization={organization} Link={Link} />
      <Callout />
    </>
  );
}
function ComingSoonPage({ section }) {
  return (
    <>
      <section className="page-hero section-shell">
        <div className="eyebrow">Taking root</div>
        <h1>{section.name}</h1>
        <p>{section.description}</p>
      </section>
      <section className="section-shell coming-soon">
        <section.icon size={36} strokeWidth={1.5} aria-hidden="true" />
        <h2>Help us bring this to life.</h2>
        <p>
          This part of the guide is still being built. Know a local group,
          initiative, or resource that belongs here? Your recommendation is a
          great place to start.
        </p>
        <div className="button-row">
          <a
            className="button primary"
            href={`mailto:${email}?subject=${encodeURIComponent(`A recommendation for ${section.name}`)}`}
          >
            Share a recommendation <Mail size={17} aria-hidden="true" />
          </a>
          <Link className="text-link" href="/explore">
            Explore the project <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
function NotFoundPage() {
  return (
    <section className="page-hero section-shell not-found">
      <div className="eyebrow">404 · A little off the path</div>
      <h1>
        Let’s get you
        <br />
        <em>back home.</em>
      </h1>
      <p>This page may have moved, or the link may be incorrect.</p>
      <Link className="button primary" href="/">
        Back to the homepage <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div>
          <Brand footer />
          <p>
            More connection.
            <br />
            More compassion.
            <br />A San Diego where you belong.
          </p>
        </div>
        <div>
          <h2>Find your way</h2>
          <Link href="/explore">Explore the project</Link>
          <Link href="/directory">Local directory</Link>
          <Link href="/calendar">Community calendar</Link>
          <Link href="/about">Our story</Link>
        </div>
        <div>
          <h2>Let’s build this together</h2>
          <a href={`mailto:${email}`}>{email}</a>
          <span className="footer-note">
            An independent community project.
            <br />
            Made for neighbors, near and new.
          </span>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© {new Date().getFullYear()} You Belong San Diego</span>
        <span>
          {new URL(SITE_URL).hostname} <span aria-hidden="true">·</span>{" "}
          Everyone welcome.
        </span>
      </div>
    </footer>
  );
}
export default App;
