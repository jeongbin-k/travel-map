import { useEffect, useRef, useState } from "react";
import { type ProjectItem } from "../data/Pin";
import "./DetailPanel.css";

interface DetailPanelProps {
  project: ProjectItem | null;
  show: boolean;
  onClose: () => void;
  location: string;
}

const FLIP_FRAMES = ["——", "██", "▓▓", "▒▒", "░░"];

function useFlipper(target: string, trigger: boolean, delay: number) {
  const [value, setValue] = useState("——");

  useEffect(() => {
    if (!trigger || !target) {
      setValue("——");
      return;
    }
    let i = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setValue(FLIP_FRAMES[i % FLIP_FRAMES.length]);
        i++;
        if (i >= FLIP_FRAMES.length) {
          clearInterval(interval);
          setValue(target);
        }
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [trigger, target, delay]);

  return value;
}

function ProgressBar({
  label,
  target,
  animate,
  delay,
}: {
  label: string;
  target: number;
  animate: boolean;
  delay: number;
}) {
  const [current, setCurrent] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) {
      setTimeout(() => {
        setCurrent(0);
        setWidth(0);
      }, 0);
      return;
    }
    const t = setTimeout(() => {
      setWidth(target);
      let cur = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        cur = Math.min(cur + step, target);
        setCurrent(cur);
        if (cur >= target) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [animate, target, delay]);

  return (
    <div className="dp-prog-row">
      <span className="dp-prog-label">{label}</span>
      <div className="dp-prog-track">
        <div className="dp-prog-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="dp-prog-val">{current}%</span>
    </div>
  );
}

function DetailPanel({ project, show, onClose, location }: DetailPanelProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const typeVal = useFlipper(project?.type?.toUpperCase() ?? "", show, 300);
  const yearVal = useFlipper(project?.date ?? "", show, 500);
  const locVal = useFlipper(location.toUpperCase(), show, 700);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      className={`dp-overlay${show ? " dp-overlay--visible" : ""}`}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={`dp-panel${show ? " dp-panel--visible" : ""}`}>
        {/* flip ticker */}
        <div className="dp-ticker">
          <div className="dp-flip">
            <div className="dp-flip-top">type</div>
            <div className="dp-flip-val">{typeVal}</div>
          </div>
          <span className="dp-sep">/</span>
          <div className="dp-flip">
            <div className="dp-flip-top">year</div>
            <div className="dp-flip-val">{yearVal}</div>
          </div>
          <span className="dp-sep">/</span>
          <div className="dp-flip">
            <div className="dp-flip-top">loc</div>
            <div className="dp-flip-val">{locVal}</div>
          </div>
          <button className="dp-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* title */}
        <div className="dp-header">
          <h2 className="dp-title">{project.title}</h2>
          {/* <p className="dp-sub">
            {project.date} · {project.tags.join(" · ")}
          </p> */}
        </div>

        {/* screenshot */}
        {project.image ? (
          <div className="dp-img-wrap">
            <img src={project.image} alt={project.title} className="dp-img" />
          </div>
        ) : (
          <div className="dp-img-empty">
            <span>[ screenshot ]</span>
          </div>
        )}

        {/* tech stack */}
        {project.tags.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-label">tech stack</div>
            <div className="dp-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="dp-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* proficiency */}
        {project.proficiency && project.proficiency.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-label">proficiency</div>
            {project.proficiency.map((p, i) => (
              <ProgressBar
                key={p.label}
                label={p.label}
                target={p.value}
                animate={show}
                delay={600 + i * 150}
              />
            ))}
          </div>
        )}

        {/* description */}
        <div className="dp-section dp-desc">{project.description}</div>

        {/* footer links */}
        <div className="dp-footer">
          {project.link && (
            <a
              className="dp-link"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              live demo →
            </a>
          )}
          {project.github && (
            <a
              className="dp-link"
              href={project.github}
              target="_blank"
              rel="noreferrer"
            >
              github →
            </a>
          )}
          <span className="dp-esc">ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;
