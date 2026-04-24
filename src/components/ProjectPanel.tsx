import { useState, useEffect } from "react";
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
  const fullCity = activePin ? activePin.location1 + activePin.location2 : "";

  useEffect(() => {
    if (!showPanel) {
      setDisplayedCity("");
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

  if (currentPage !== "project" || !activePin) return null;

  return (
    <div
      className={`project-panel${showPanel ? " project-panel--visible" : ""}`}
    >
      <button className="project-panel_back" onClick={onBack}>
        <div className="back-text-top">back to</div>
        <div className="back-text-bottom">world</div>
      </button>

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

      <div className="project-panel_list">
        {activePin.projects.map((project, i) => (
          <div
            key={i}
            className="project-panel_item"
            onClick={() => onProjectClick(project)}
          >
            <div className="project-panel_item-left">
              <span className="project-panel_name">{project.title}</span>
              <span className="project-panel_type">{project.type}</span>
            </div>
            <div className="project-panel_item-right">
              <span className="project-panel_tags">
                {project.tags.join(" · ")}
              </span>
              <span className="project-panel_date">{project.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectPanel;
