import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function EventRequest() {
  const [prepared, setPrepared] = useState(false);
  const prepareEmail = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = data.get("title").trim();
    const link = data.get("link").trim();
    if (!title) {
      form.elements.title.setCustomValidity("Please enter the event name.");
      form.reportValidity();
      return;
    }
    let publicLink = false;
    try {
      const url = new URL(link);
      publicLink = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    } catch { /* The browser also checks the URL input. */ }
    if (!publicLink) {
      form.elements.link.setCustomValidity("Please use an http:// or https:// event link without login details.");
      form.reportValidity();
      return;
    }
    const type = data.get("type");
    const body = [
      `Request: ${type}`,
      `Event name: ${title}`,
      `Event link: ${link}`,
      `Organization: ${data.get("organization").trim() || "Not provided"}`,
      `Date: ${data.get("date") || "Not provided"}`,
      "",
      "Details or corrections:",
      data.get("details").trim() || "Please see the event link.",
      "",
      "Please review this request before publishing.",
    ].join("\n");
    window.location.href = `mailto:info@youbelongsandiego.org?subject=${encodeURIComponent(`[Event request] ${type}: ${title}`)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  };

  return (
    <section className="section-shell event-request" aria-labelledby="event-request-title">
      <div>
        <span className="eyebrow">Make room for one more</span>
        <h2 id="event-request-title">Have an event to share?</h2>
        <p>Suggest a gathering or help us correct a listing. All requests are reviewed before appearing on the site.</p>
      </div>
      <details className="event-request-panel">
        <summary>Suggest an event or a correction</summary>
        <form onSubmit={prepareEmail} onChange={() => setPrepared(false)}>
          <p id="event-request-help">An event name and link are all we need to start. Add any other details you know.</p>
          <div className="event-request-fields">
            <label>What would you like to do?
              <select name="type" defaultValue="Add an event">
                <option>Add an event</option>
                <option>Correct an event</option>
                <option>Report a cancellation</option>
              </select>
            </label>
            <label>Event name (required)
              <input name="title" required maxLength={140} onInput={(event) => event.target.setCustomValidity("")} />
            </label>
            <label className="event-request-wide">Event or registration link (required)
              <input name="link" type="url" required maxLength={500} placeholder="https://" aria-describedby="event-request-help" onInput={(event) => event.target.setCustomValidity("")} />
            </label>
            <label>Organization (optional)
              <input name="organization" maxLength={120} />
            </label>
            <label>Event date (optional)
              <input name="date" type="date" />
            </label>
            <label className="event-request-wide">Details or corrections (optional)
              <textarea name="details" rows={4} maxLength={800} placeholder="Time, location, or what needs to change…" />
            </label>
          </div>
          <p className="event-request-note">This opens a prepared email to info@youbelongsandiego.org. You’ll need to send it from your email app. Please leave out private or sensitive information.</p>
          <button className="button primary" type="submit">Continue in email <ArrowUpRight size={17} aria-hidden="true" /></button>
          {prepared && <p role="status" className="event-request-status">Your email draft is ready to open. Send it from your email app to complete the request. If nothing opened, email the details to <a href="mailto:info@youbelongsandiego.org">info@youbelongsandiego.org</a>. Your entries are still here.</p>}
        </form>
      </details>
    </section>
  );
}
