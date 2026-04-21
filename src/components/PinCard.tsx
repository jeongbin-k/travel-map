// components/PinCard.tsx
import { useState, useCallback, type RefObject } from "react";
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
}

const ZOOM_SCALE = 6;

export default function PinCard({
  projection,
  zoomTransform,
  svgSelectionRef,
  zoomBehaviorRef,
  audioRef,
  isPlayingRef,
}: PinCardProps) {
  const [activePin, setActivePin] = useState<PinData | null>(null);

  // coords [lng, lat] → 줌 transform 반영한 실제 화면 픽셀 좌표
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

  // 줌 리셋
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

  // 핀 클릭: 줌인 + 카드 표시
  const handlePinClick = useCallback(
    (e: React.MouseEvent, pin: PinData) => {
      e.stopPropagation();

      // 같은 핀 다시 클릭 → 닫고 리셋
      if (activePin?.id === pin.id) {
        setActivePin(null);
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

      setActivePin(pin);

      // ref에서 직접 최신값 꺼내기
      const svg = svgSelectionRef.current;
      const zoom = zoomBehaviorRef.current;
      if (!projection || !svg || !zoom) return;

      const projected = projection(pin.coords);
      if (!projected) return;

      const [px, py] = projected;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const tx = w / 2 - ZOOM_SCALE * px;
      const ty = h / 2 - ZOOM_SCALE * py + 60; // 카드가 위에 뜨니까 살짝 아래로

      svg
        .transition()
        .duration(1200)
        .ease(d3.easePolyOut.exponent(3))
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(ZOOM_SCALE),
        );
    },
    [
      activePin,
      projection,
      svgSelectionRef,
      zoomBehaviorRef,
      resetZoom,
      audioRef,
      isPlayingRef,
    ],
  );

  // 오버레이 클릭 → 카드 닫고 줌 리셋
  const handleOverlayClick = useCallback(() => {
    setActivePin(null);
    resetZoom();
  }, [resetZoom]);

  // 카드 위치 계산 (화면 밖 방지)
  const getCardPos = (screenX: number, screenY: number) => {
    const cardW = 210;
    const gap = 20;
    let left = screenX - cardW / 2;
    let top = screenY - 180 - gap;
    if (left < 8) left = 8;
    if (left + cardW > window.innerWidth - 8)
      left = window.innerWidth - cardW - 8;
    if (top < 8) top = screenY + gap;
    return { left, top };
  };

  return (
    <>
      {activePin && (
        <div className="pin-overlay-bg" onClick={handleOverlayClick} />
      )}

      {/* 핀 점 + 연결선 SVG */}
      <svg className="pin-svg">
        {pins.map((pin) => {
          const pos = getScreenPos(pin.coords);
          const isActive = activePin?.id === pin.id;
          const { left, top } = getCardPos(pos.x, pos.y);
          const lineEndX = left + 105;
          const lineEndY = top > pos.y ? top : top + 180;

          return (
            <g key={pin.id}>
              {isActive && (
                <line
                  className="pin-line"
                  x1={pos.x}
                  y1={pos.y}
                  x2={lineEndX}
                  y2={lineEndY}
                />
              )}
              <circle
                className={`pin-dot${isActive ? " pin-dot--active" : ""}`}
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 6 : 4}
                onClick={(e) => handlePinClick(e, pin)}
              />
            </g>
          );
        })}
      </svg>

      {/* 카드 */}
      {activePin &&
        (() => {
          const pos = getScreenPos(activePin.coords);
          const { left, top } = getCardPos(pos.x, pos.y);
          return (
            <div
              className="pin-card"
              style={{ left, top }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`pin-card__type pin-card__type--${activePin.type.toLowerCase()}`}
              >
                {activePin.type}
              </div>
              <div className="pin-card__title">{activePin.title}</div>
              <div className="pin-card__meta">
                <span className="pin-card__location">{activePin.location}</span>
                <span className="pin-card__date">{activePin.date}</span>
              </div>
              <div className="pin-card__divider" />
              <div className="pin-card__description">
                {activePin.description}
              </div>
              <div className="pin-card__tags">
                {activePin.tags.map((tag) => (
                  <span key={tag} className="pin-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
              {activePin.link && (
                <a
                  href={activePin.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pin-card__link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Project →
                </a>
              )}
            </div>
          );
        })()}
    </>
  );
}
