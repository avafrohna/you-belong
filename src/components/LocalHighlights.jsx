import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { currentHighlights } from "../data/local-highlights.js";
import { sanDiegoDay } from "../lib/events.js";

export function LocalHighlights() {
  const [paused, setPaused] = useState(false);
  const [today, setToday] = useState(null);
  useEffect(() => {
    const update = () => setToday(sanDiegoDay());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);
  const highlights = currentHighlights(today);
  const viewport = useRef(null);
  function toggleScrolling() {
    if (paused && viewport.current) viewport.current.scrollLeft = 0;
    setPaused(!paused);
  }
  return (
    <aside className={`local-highlights${paused ? " is-paused" : ""}`} aria-label="San Diego local events">
      <div className="local-highlights-window" id="local-highlights-list" ref={viewport} onBlur={(event) => {
        if (!paused && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0;
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
      <button className="local-highlights-toggle" type="button" onClick={toggleScrolling} aria-label={paused ? "Resume scrolling local events" : "Pause scrolling local events"} aria-controls="local-highlights-list" title={paused ? "Resume scrolling" : "Pause scrolling"}>
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </aside>
  );
}
