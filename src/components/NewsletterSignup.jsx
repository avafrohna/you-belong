import { ArrowUpRight, HeartHandshake, Mail } from "lucide-react";
import { newsletterSignupUrl } from "../data/newsletter.js";

export function NewsletterSignup({ welcome = false }) {
  return (
    <section className={`newsletter-band${welcome ? " welcome-newsletter" : ""}`} aria-labelledby="newsletter-title">
      <div className="section-shell newsletter-signup">
        {!welcome && <Mail size={28} aria-hidden="true" />}
        <div className="newsletter-copy">
          {welcome ? (
            <>
              <span className="newsletter-kicker">New here? Lived here forever?</span>
              <h2 id="newsletter-title">There’s room for you. <HeartHandshake size={34} aria-hidden="true" /></h2>
              <p>Sign up to our monthly newsletter for local events, community stories, and ways to get involved. One email a month.</p>
            </>
          ) : (
            <>
              <h2 id="newsletter-title">Sign up to our monthly newsletter</h2>
              <p>Local events, community stories, and ways to get involved. One email a month.</p>
            </>
          )}
        </div>
        <div className="newsletter-action">
          {newsletterSignupUrl ? (
            <a className="button primary" href={newsletterSignupUrl}>
              Sign me up <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ) : (
            <>
              <button className="button primary" type="button" disabled aria-describedby="newsletter-preview-note">
                Sign me up <ArrowUpRight size={17} aria-hidden="true" />
              </button>
              <small id="newsletter-preview-note">Coming soon — signup opens shortly.</small>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
