import { useState, useCallback } from "react";
import type { GeoProjection } from "d3";
import { pins, type PinData } from "../data/Pin";
import "./PinCard.css";

interface PinCardProps {
  projection: GeoProjection | null;
  zoomTransform: { k: number; x: number; y: number };
}

export default function PinCard({ projection, zoomTransform }: PinCardProps) {
  const [activePin, setActivePin] = useState<PinData | null>(null);

  const handlePinClick = useCallback((e: React.MouseEvent, pin: PinData) => {
    e.stopPropagation();
    setActivePin((prev) => (prev?.id === pin.id ? null : pin));
  }, []);

  const handleOverlayClick = useCallback(() => {
    setActivePin(null);
  }, []);

  // coords [lng, lat] → 줌 transform 반영한 실제 화면 픽셀 좌표
  const getScreenPos = (coords: [number, number]) => {
    if (!projection) return { x: 0, y: 0 };
    const projected = projection(coords);
    if (!projected) return { x: 0, y: 0 };
    const [px, py] = projected;
    return {
      x: px * zoomTransform.k + zoomTransform.x,
      y: py * zoomTransform.k + zoomTransform.y,
    };
  };

  // 카드가 화면 밖으로 나가지 않도록 위치 보정
  const getCardPos = (screenX: number, screenY: number) => {
    const cardW = 210;
    const cardH = 180;
    const gap = 16; // 핀과 카드 사이 간격

    let left = screenX - cardW / 2;
    let top = screenY - cardH - gap;

    if (left < 8) left = 8;
    if (left + cardW > window.innerWidth - 8)
      left = window.innerWidth - cardW - 8;
    if (top < 8) top = screenY + gap; // 위 공간 없으면 아래로

    return { left, top, isBelow: top > screenY };
  };

  return (
    <>
      {/* 카드 닫기용 투명 오버레이 */}
      {activePin && (
        <div className="pin-overlay-bg" onClick={handleOverlayClick} />
      )}

      {/* SVG 레이어: 핀 점 + 연결선 */}
      <svg className="pin-svg">
        {pins.map((pin) => {
          const pos = getScreenPos(pin.coords);
          const isActive = activePin?.id === pin.id;

          // 연결선 끝점: 카드의 하단 중앙 (카드가 위에 있을 때)
          const { left, top, isBelow } = getCardPos(pos.x, pos.y);
          const lineEndX = left + 105;
          const lineEndY = isBelow ? top : top + 180;

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

      {/* 카드 레이어 */}
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
