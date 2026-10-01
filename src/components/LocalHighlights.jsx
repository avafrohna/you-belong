import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { currentHighlights } from "../data/local-highlights.js";
import { sanDiegoDay } from "../lib/events.js";

export function LocalHighlights() {
  const [today, setToday] = useState(null);
  useEffect(() => {
    const update = () => setToday(sanDiegoDay());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);
  const highlights = currentHighlights(today);
  return (
    <aside className="local-highlights" aria-label="San Diego local events">
      <div className="local-highlights-window" id="local-highlights-list" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0;
      }}>
        <div className="local-highlights-track" style={{ animationDuration: `${highlights.length * 17.5}s` }}>
          {[false, true].map((duplicate) => (
            <ul className={duplicate ? "local-highlights-copy" : undefined} key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {highlights.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined} aria-label={`${item.name} — ${item.schedule}. Opens in a new tab.`}>
                    <strong>{item.name}</strong><span>{item.schedule}</span><ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                  <span className="local-highlights-dot" aria-hidden="true">✳</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </aside>
  );
}
