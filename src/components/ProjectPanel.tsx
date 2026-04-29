import { useState, useEffect, useRef } from "react";
import { type PinData, type ProjectItem } from "../data/Pin";
import "./ProjectPanel.css";

interface ProjectPanelProps {
  activePin: PinData | null;
  showPanel: boolean;
  currentPage: "world" | "project" | "detail";
  onBack: () => void;
  onProjectClick: (project: ProjectItem) => void;
}

function ProjectPanel({
  activePin,
  showPanel,
  currentPage,
  onBack,
  onProjectClick,
}: ProjectPanelProps) {
  const [displayedCity, setDisplayedCity] = useState("");
  const [current, setCurrent] = useState(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullCity = activePin ? activePin.location1 + activePin.location2 : "";

  useEffect(() => {
    if (!showPanel) {
      setDisplayedCity("");
      setCurrent(0);
      return;
    }
    let i = 0;
    setDisplayedCity("");
    const interval = setInterval(() => {
      setDisplayedCity(fullCity.slice(0, i + 1));
      i++;
      if (i >= fullCity.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [showPanel, fullCity]);

  const projects = activePin?.projects ?? [];

  // wheel navigation with throttle
  useEffect(() => {
    if (currentPage !== "project") return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelTimer.current) return;
      if (e.deltaY > 0) setCurrent((c) => (c + 1) % projects.length);
      else setCurrent((c) => (c - 1 + projects.length) % projects.length);
      wheelTimer.current = setTimeout(() => {
        wheelTimer.current = null;
      }, 500);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentPage, projects.length]);

  if (currentPage !== "project" || !activePin) return null;

  const activeProject = projects[current];

  function getCardStyle(i: number): React.CSSProperties {
    const offset = i - current;
    const abs = Math.abs(offset);
    if (abs > 2) return { display: "none" };

    const tx = offset * 180;
    const tz = -abs * 120;
    const ry = offset * -18;
    const scale = 1 - abs * 0.12;
    const opacity = 1 - abs * 0.35;
    const zIndex = 10 - abs;

    return {
      transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`,
      opacity,
      zIndex,
    };
  }

  return (
    <div
      className={`project-panel${showPanel ? " project-panel--visible" : ""}`}
    >
      {/* back button */}
      <button className="project-panel_back" onClick={onBack}>
        <div className="back-text-top">back to</div>
        <div className="back-text-bottom">world</div>
      </button>

      {/* header */}
      <div className="project-panel_header">
        <h1 className="project-panel_city">
          {displayedCity.split("").map((char, index) => (
            <span key={index} className="char">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <span className="project-panel_country">{activePin.country}</span>
      </div>

      {/* 3D carousel */}
      <div className="carousel-scene">
        <div className="carousel-track">
          {projects.map((project, i) => (
            <div
              key={i}
              className={`carousel-card carousel-card--${project.type}${
                i === current ? " carousel-card--active" : ""
              }`}
              style={getCardStyle(i)}
              onClick={() => {
                if (i === current) onProjectClick(project);
                else setCurrent(i);
              }}
            >
              <div className="carousel-card_type">{project.type}</div>
              <div className="carousel-card_title">{project.title}</div>
              <div className="carousel-card_footer">
                <div className="carousel-card_tags">
                  {project.tags.join(" · ")}
                </div>
                <div className="carousel-card_date">{project.date}</div>
                {i === current && (
                  <div className="carousel-card_hint">click to open →</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dot nav */}
      <div className="carousel-dots">
        {projects.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? " carousel-dot--active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      {/* detail */}
      {activeProject && (
        <div className="carousel-detail">
          <div className="carousel-detail_title">{activeProject.title}</div>
          <div className="carousel-detail_desc">
            {activeProject.description}
          </div>
          {activeProject.link && (
            <a
              className="carousel-detail_link"
              href={activeProject.link}
              target="_blank"
              rel="noreferrer"
            >
              visit →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectPanel;
