import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  ExternalLink,
  HandHeart,
  HeartHandshake,
  Mail,
  MapPin,
  Menu,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { categories, featuredListings, getCategory, listings, regions } from "./data/listings.js";

const email = "info@youbelongsandiego.org";

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function useRoute() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onChange = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onChange);
    window.addEventListener("app:navigate", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("app:navigate", onChange);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [path]);

  return path;
}

function navigate(href) {
  const next = new URL(href, window.location.origin);
  window.history.pushState({}, "", `${next.pathname}${next.search}${next.hash}`);
  window.dispatchEvent(new Event("app:navigate"));
  if (next.hash) {
    requestAnimationFrame(() => {
      document.querySelector(next.hash)?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function Link({ href, className, children, onClick, ...props }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          href.startsWith("mailto:") ||
          href.startsWith("http")
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function App() {
  const path = useRoute();

  return (
    <>
      <SiteHeader currentPath={path} />
      <main>
        {path === "/" && <HomePage />}
        {path === "/directory" && <DirectoryPage />}
        {path === "/about" && <AboutPage />}
        {path === "/community/north-park-newcomers" && <CommunityPage />}
        {!["/", "/directory", "/about", "/community/north-park-newcomers"].includes(path) && (
          <NotFoundPage />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function SiteHeader({ currentPath }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const navItems = [
    { href: "/#categories", label: "Start here" },
    { href: "/directory", label: "Directory" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="brand" href="/" onClick={close} aria-label="You Belong San Diego home">
          <span className="brand-main">you belong</span>
          <span className="brand-sub">SAN DIEGO</span>
        </Link>

        <div className="desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={currentPath === item.href ? "nav-link active" : "nav-link"}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <a className="nav-cta" href={`mailto:${email}`}>
            <Mail size={16} aria-hidden="true" />
            Contact
          </a>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <a href={`mailto:${email}`} onClick={close}>
            Contact
          </a>
        </div>
      )}
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            Welcome to San Diego
          </div>
          <h1>
            Find your <span>community</span> in San Diego.
          </h1>
          <p>
            You just moved here. Let's find your people. Explore local groups, values-led small
            businesses, volunteer opportunities, and gatherings that turn a brand-new city into home.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/directory">
              Start exploring
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button secondary" href="/#categories">
              How it works
            </Link>
          </div>
          <div className="trust-row">
            <span>501(c) non-profit in progress</span>
            <span>Always free to use</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="People meeting at a sunny San Diego gathering">
          <img src="/assets/community-hero.png" alt="" />
          <div className="hero-note">
            <div className="avatar-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <strong>Your people are out here.</strong>
          </div>
        </div>
      </section>

      <section id="categories" className="section-shell section-block">
        <SectionIntro
          label="Start somewhere"
          title="Where do you want to begin?"
          text="Four ways into the city. Pick the one that feels like you; there is no wrong door."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.id} className="category-card" href={`/directory?category=${category.id}`}>
              <CategoryIcon id={category.id} />
              <h3>{category.label}</h3>
              <p>{category.description}</p>
              <span>
                Explore
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell section-block">
        <SectionIntro
          label="Editor's picks"
          title="Handpicked for newcomers"
          text="A few sample listings to show the shape of the directory while you gather the real links."
          action={<Link href="/directory">See all</Link>}
        />
        <div className="featured-grid">
          {featuredListings.map((listing) => (
            <ListingFeatureCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="callout-band">
        <div className="section-shell callout-content">
          <div>
            <h2>Just landed in San Diego?</h2>
            <p>
              Filter by what you are into: surfing, board games, mutual aid, faith communities,
              small businesses, volunteer shifts, or simply a place to show up this week.
            </p>
          </div>
          <Link className="button light" href="/directory">
            Browse the directory
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

function DirectoryPage() {
  const params = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [region, setRegion] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesCategory = category === "all" || listing.category === category;
      const matchesRegion = region === "all" || listing.region === region;
      const haystack = `${listing.name} ${listing.neighborhood} ${listing.region} ${listing.blurb} ${listing.tags.join(
        " ",
      )}`.toLowerCase();
      return matchesCategory && matchesRegion && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, query, region]);

  return (
    <>
      <section className="directory-hero section-shell">
        <div className="eyebrow">The directory</div>
        <h1>Everything worth showing up to.</h1>
        <p>
          Communities, causes, events, restaurants, and local gathering spots across San Diego,
          curated for people looking for belonging and good values.
        </p>
      </section>

      <section className="section-shell directory-controls" aria-label="Directory filters">
        <label className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, neighborhood, or interest"
          />
        </label>
        <div className="filter-group">
          <span>Category</span>
          <div className="filter-buttons">
            <FilterButton active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterButton>
            {categories.map((item) => (
              <FilterButton
                key={item.id}
                active={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </FilterButton>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span>Region</span>
          <div className="filter-buttons">
            <FilterButton active={region === "all"} onClick={() => setRegion("all")}>
              All regions
            </FilterButton>
            {regions.map((item) => (
              <FilterButton key={item} active={region === item} onClick={() => setRegion(item)}>
                {item}
              </FilterButton>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell results-section">
        <div className="results-meta">{filtered.length} results</div>
        <div className="results-grid">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>No matches yet</h2>
            <p>Try clearing a filter, or send us a community you think belongs here.</p>
            <a href={`mailto:${email}`}>Suggest a listing</a>
          </div>
        )}
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <section className="about-hero section-shell">
        <div className="eyebrow">Our mission</div>
        <h1>Everyone deserves to feel at home in San Diego.</h1>
        <p>
          You Belong San Diego is a non-profit project with one job: helping people who are new here
          find the communities, causes, local businesses, and gatherings where they actually fit.
        </p>
        <Link className="button primary" href="/directory">
          Browse the directory
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <section className="section-shell split-section">
        <div className="photo-panel">
          <img src="/assets/community-hero.png" alt="" />
        </div>
        <div>
          <h2>Why we built this</h2>
          <p>
            Moving to a new city can be lonely in a way nobody really warns you about. San Diego is
            full of welcoming people and good causes, but when you first arrive, it is hard to know
            where any of it is.
          </p>
          <p>
            This site is meant to become one trustworthy place to look. Every listing should be
            added with care because it is genuinely welcoming, values-aligned, useful, or locally
            rooted.
          </p>
        </div>
      </section>

      <section className="section-shell section-block">
        <h2 className="center-heading">What makes us different</h2>
        <div className="value-grid">
          <ValueCard
            icon={<HeartHandshake />}
            title="Curated, not pay-to-play"
            text="The goal is a useful local guide, not an ad wall. Listings should earn their place by being genuinely good for the community."
          />
          <ValueCard
            icon={<MapPin />}
            title="Neighborhood-level"
            text="San Diego is more than one downtown radius. The directory can grow across North County, South Bay, East County, coastal, and central neighborhoods."
          />
          <ValueCard
            icon={<HandHeart />}
            title="Non-profit-minded"
            text="The organization is being built as a 501(c) non-profit, with the directory free for newcomers and locals to use."
          />
        </div>
      </section>

      <section className="callout-band">
        <div className="section-shell callout-content">
          <div>
            <h2>Help us grow the map.</h2>
            <p>
              Suggest a community, volunteer opportunity, restaurant, small business, or local group
              that helps people feel like they belong.
            </p>
          </div>
          <a className="button light" href={`mailto:${email}`}>
            Email us
            <Mail size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}

function CommunityPage() {
  const listing = listings.find((item) => item.id === "north-park-newcomers");
  const related = listings.filter((item) => item.category === listing.category && item.id !== listing.id).slice(0, 3);

  return (
    <>
      <section className="detail-hero section-shell">
        <div>
          <Link className="breadcrumb" href="/directory">
            Directory
          </Link>
          <div className="eyebrow">Community · {listing.neighborhood}</div>
          <h1>{listing.name}</h1>
          <p>{listing.blurb}</p>
          <div className="button-row">
            <a className="button primary" href={listing.website} target="_blank" rel="noreferrer">
              Visit website
              <ExternalLink size={18} aria-hidden="true" />
            </a>
            <Link className="button secondary" href="/directory">
              Back to directory
            </Link>
          </div>
        </div>
        <div className="photo-panel detail-photo">
          <img src="/assets/community-hero.png" alt="" />
        </div>
      </section>

      <section className="section-shell fact-grid">
        <Fact label="Meets" value={listing.cadence} />
        <Fact label="Where" value={`${listing.neighborhood}, ${listing.region}`} />
        <Fact label="Cost" value={listing.cost} />
        <Fact label="Good for" value={listing.goodFor} />
      </section>

      <section className="section-shell detail-body">
        <article>
          <h2>About this group</h2>
          <p>{listing.details}</p>
          <h3>Why it belongs here</h3>
          <ul>
            {listing.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </article>
        <aside className="aside-panel">
          <h2>Listing tags</h2>
          <div className="tag-list">
            {listing.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <a href={`mailto:${email}`}>Suggest an edit</a>
        </aside>
      </section>

      <section className="section-shell section-block">
        <SectionIntro title="More like this" action={<Link href="/directory">All communities</Link>} />
        <div className="featured-grid">
          {related.map((item) => (
            <ListingFeatureCard key={item.id} listing={item} />
          ))}
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="section-shell not-found">
      <h1>That page is not here yet.</h1>
      <p>The base frame is ready for it, though.</p>
      <Link className="button primary" href="/">
        Go home
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

function SectionIntro({ label, title, text, action }) {
  return (
    <div className="section-intro">
      <div>
        {label && <div className="eyebrow">{label}</div>}
        {title && <h2>{title}</h2>}
      </div>
      <div className="intro-side">
        {text && <p>{text}</p>}
        {action && <div className="text-link">{action}</div>}
      </div>
    </div>
  );
}

function CategoryIcon({ id }) {
  const icons = {
    community: <Users size={25} />,
    volunteer: <HandHeart size={25} />,
    events: <CalendarDays size={25} />,
    places: <Coffee size={25} />,
  };
  return <div className={`category-icon ${id}`}>{icons[id]}</div>;
}

function ListingFeatureCard({ listing }) {
  const category = getCategory(listing.category);
  return (
    <Link className="feature-card" href={listing.url}>
      <div className="feature-media">
        <CategoryIcon id={listing.category} />
      </div>
      <div className="feature-body">
        <span style={{ color: category.color }}>{category.singular}</span>
        <h3>{listing.name}</h3>
        <p>{listing.blurb}</p>
        <strong>
          Visit
          <ArrowRight size={16} aria-hidden="true" />
        </strong>
      </div>
    </Link>
  );
}

function ListingCard({ listing }) {
  const category = getCategory(listing.category);
  return (
    <Link className="listing-card" href={listing.url}>
      <div className="listing-top">
        <span className="dot" style={{ background: category.color }} />
        <span className="listing-type" style={{ color: category.color }}>
          {category.singular}
        </span>
        <span>{listing.region}</span>
      </div>
      <h2>{listing.name}</h2>
      <p className="listing-location">{listing.neighborhood}</p>
      <p>{listing.blurb}</p>
      <div className="listing-bottom">
        <div className="tag-list">
          {listing.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <ArrowRight size={18} aria-hidden="true" />
      </div>
    </Link>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button className={active ? "filter-button active" : "filter-button"} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div className="value-card">
      <div className="value-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="fact-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div>
          <div className="footer-brand">
            <span>you belong</span>
            <small>SAN DIEGO</small>
          </div>
          <p>
            A non-profit project helping people new to San Diego find the communities, causes,
            small businesses, and gatherings where they belong.
          </p>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/#categories">Start here</Link>
          <Link href="/directory">Directory</Link>
          <Link href="/about">About</Link>
        </div>
        <div>
          <h2>Get involved</h2>
          <a href={`mailto:${email}?subject=Suggest%20a%20community`}>Suggest a community</a>
          <a href={`mailto:${email}?subject=Volunteer%20with%20You%20Belong`}>Volunteer with us</a>
          <a href={`mailto:${email}`}>Contact</a>
        </div>
      </div>
      <div className="footer-bottom section-shell">
        <span>© 2026 You Belong San Diego</span>
        <span>youbelongsandiego.org</span>
      </div>
    </footer>
  );
}

export default App;
