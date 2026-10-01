import { useEffect, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { newsletterSignupUrl } from "../data/newsletter.js";

export function NewsletterSignup() {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV) setPreview(true);
  }, []);

  if (!newsletterSignupUrl && !preview) return null;

  return (
    <section className="newsletter-band" aria-labelledby="newsletter-title">
      <div className="section-shell newsletter-signup">
        <Mail size={28} aria-hidden="true" />
        <div className="newsletter-copy">
          <h2 id="newsletter-title">Sign up to our monthly newsletter</h2>
          <p>Local events, community stories, and ways to get involved. One email a month.</p>
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
              <small id="newsletter-preview-note">Design preview · signup is not connected yet.</small>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
