import { useCallback, type RefObject } from "react";
import * as d3 from "d3";
import type { GeoProjection } from "d3";
import { pins, type PinData } from "../data/Pin";
import "./PinCard.css";

interface PinCardProps {
  projection: GeoProjection | null;
  zoomTransform: { k: number; x: number; y: number };
  svgSelectionRef: RefObject<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>;
  zoomBehaviorRef: RefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlayingRef: RefObject<boolean>;
  currentPage: "world" | "project" | "detail";
  onPageChange: (page: "world" | "project" | "detail") => void;
  activePin: PinData | null;
  onActivePinChange: (pin: PinData | null) => void;
  onShowPanelChange: (show: boolean) => void;
}

const ZOOM_SCALE = 19;
const CARD_WIDTH = 210;
const CARD_HEIGHT = 180;

export default function PinCard({
  projection,
  zoomTransform,
  svgSelectionRef,
  zoomBehaviorRef,
  audioRef,
  isPlayingRef,
  currentPage,
  onPageChange,
  activePin,
  onActivePinChange,
  onShowPanelChange,
}: PinCardProps) {
  const getScreenPos = useCallback(
    (coords: [number, number]) => {
      if (!projection) return { x: 0, y: 0 };
      const projected = projection(coords);
      if (!projected) return { x: 0, y: 0 };
      const [px, py] = projected;
      return {
        x: px * zoomTransform.k + zoomTransform.x,
        y: py * zoomTransform.k + zoomTransform.y,
      };
    },
    [projection, zoomTransform],
  );

  const getCardPos = (
    screenX: number,
    screenY: number,
    offset: { x: number; y: number },
  ) => {
    let left = screenX + offset.x - CARD_WIDTH / 2;
    let top = screenY + offset.y;
    if (left < 8) left = 8;
    if (left + CARD_WIDTH > window.innerWidth - 8)
      left = window.innerWidth - CARD_WIDTH - 8;
    if (top < 8) top = 8;
    if (top + CARD_HEIGHT > window.innerHeight - 8)
      top = window.innerHeight - CARD_HEIGHT - 8;
    return { left, top };
  };

  const getLineEndPoint = (
    pinX: number,
    pinY: number,
    cardLeft: number,
    cardTop: number,
  ) => {
    const cardCenterX = cardLeft + CARD_WIDTH / 2;
    const cardCenterY = cardTop + CARD_HEIGHT / 2;
    const dx = pinX - cardCenterX;
    const dy = pinY - cardCenterY;
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: dx > 0 ? cardLeft + CARD_WIDTH : cardLeft, y: cardCenterY };
    } else {
      return { x: cardCenterX, y: dy > 0 ? cardTop + CARD_HEIGHT : cardTop };
    }
  };

  const resetZoom = useCallback(() => {
    const svg = svgSelectionRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    svg
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .call(zoom.transform, d3.zoomIdentity);
  }, [svgSelectionRef, zoomBehaviorRef]);

  const handlePinClick = useCallback(
    (e: React.MouseEvent, pin: PinData) => {
      e.stopPropagation();

      if (activePin?.id === pin.id) {
        onActivePinChange(null);
        onShowPanelChange(false);
        onPageChange("world");
        resetZoom();
        return;
      }

      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.5;
        audioRef.current
          .play()
          .catch((e) => console.log("사운드 재생 실패:", e));
      }

      onActivePinChange(pin);
      onPageChange("project");
      onShowPanelChange(false);

      const svg = svgSelectionRef.current;
      const zoom = zoomBehaviorRef.current;
      if (!projection || !svg || !zoom) return;

      const projected = projection(pin.coords);
      if (!projected) return;

      const [px, py] = projected;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const tx = w / 2 - ZOOM_SCALE * px;
      const ty = h / 2 - ZOOM_SCALE * py + 60;

      svg
        .transition()
        .duration(1200)
        .ease(d3.easePolyOut.exponent(3))
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(ZOOM_SCALE),
        );

      setTimeout(() => {
        onShowPanelChange(true);
      }, 1400);
    },
    [
      activePin,
      projection,
      svgSelectionRef,
      zoomBehaviorRef,
      resetZoom,
      audioRef,
      isPlayingRef,
      onPageChange,
      onActivePinChange,
      onShowPanelChange,
    ],
  );

  return (
    <>
      <svg className="pin-svg">
        {pins
          .filter((pin) => currentPage === "world" || pin.id === activePin?.id)
          .map((pin) => {
            const pos = getScreenPos(pin.coords);
            const isActive = activePin?.id === pin.id;
            const { left, top } = getCardPos(pos.x, pos.y, pin.cardOffset);
            const lineEnd = getLineEndPoint(pos.x, pos.y, left, top);
            return (
              <g key={pin.id}>
                <line
                  className={`pin-line${isActive ? " pin-line--active" : ""}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={lineEnd.x}
                  y2={lineEnd.y}
                />
                <circle
                  className="pin-dot"
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  onClick={(e) => handlePinClick(e, pin)}
                />
              </g>
            );
          })}
      </svg>

      {pins
        .filter((pin) => currentPage === "world" || pin.id === activePin?.id)
        .map((pin) => {
          const pos = getScreenPos(pin.coords);
          const { left, top } = getCardPos(pos.x, pos.y, pin.cardOffset);
          return (
            <div
              key={pin.id}
              className="pin-card"
              style={{ left, top }}
              onClick={(e) => handlePinClick(e, pin)}
            >
              <div className="pin-card_top">
                <h1 className="pin-card_location">{pin.location1}</h1>
                <span className="pin-card_country">{pin.country}</span>
                <h1 className="pin-card_location">{pin.location2}</h1>
              </div>
              <div className="pin-card_divider" />
              {pin.projects.map((project, i) => (
                <div key={i} className="pin-card_meta">
                  <div className="pin-card_meta-inner">
                    <div className="pin-card_meta-front">
                      <span className="pin-card_title">{project.title}</span>
                      <span className="pin-card_date">{project.date}</span>
                    </div>
                    <div className="pin-card_meta-back">
                      <span className="pin-card_title">{project.title}</span>
                      <span className="pin-card_date">{project.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
    </>
  );
}
