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
const CARD_WIDTH = 210;
const CARD_HEIGHT = 180;

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

  // cardOffset 기반 카드 위치 계산 + 화면 밖 방지
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

  // 핀 위치 기준으로 카드의 가장 가까운 엣지 포인트 계산
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
      // 좌우가 더 멀 때 → 카드 좌/우 엣지 중앙
      return {
        x: dx > 0 ? cardLeft + CARD_WIDTH : cardLeft,
        y: cardCenterY,
      };
    } else {
      // 상하가 더 멀 때 → 카드 상/하 엣지 중앙
      return {
        x: cardCenterX,
        y: dy > 0 ? cardTop + CARD_HEIGHT : cardTop,
      };
    }
  };

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

  // 카드/핀 클릭 → 줌인 or 리셋
  const handlePinClick = useCallback(
    (e: React.MouseEvent, pin: PinData) => {
      e.stopPropagation();

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

  return (
    <>
      {/* 핀 점 + 연결선 SVG */}
      <svg className="pin-svg">
        {pins.map((pin) => {
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
                className={"pin-dot"}
                cx={pos.x}
                cy={pos.y}
                r={3}
                onClick={(e) => handlePinClick(e, pin)}
              />
            </g>
          );
        })}
      </svg>

      {/* 카드 - 항상 표시 */}
      {pins.map((pin) => {
        const pos = getScreenPos(pin.coords);
        const { left, top } = getCardPos(pos.x, pos.y, pin.cardOffset);
        const isActive = activePin?.id === pin.id;

        return (
          <div
            key={pin.id}
            className={`pin-card${isActive ? " pin-card--active" : ""}`}
            style={{ left, top }}
            onClick={(e) => handlePinClick(e, pin)}
          >
            <h1 className="pin-card__location">{pin.location1}</h1>
            <span className="pin-card__country">{pin.country}</span>
            <h1 className="pin-card__location">{pin.location2}</h1>
            <div className="pin-card__meta">
              <span className="pin-card__title">{pin.title}</span>
              <span className="pin-card__date">{pin.date}</span>
            </div>
            <div className="pin-card__divider" />
            <div className="pin-card__description">{pin.description}</div>
            <div className="pin-card__tags">
              {pin.tags.map((tag) => (
                <span key={tag} className="pin-card__tag">
                  {tag}
                </span>
              ))}
            </div>
            {pin.link && (
              <a
                href={pin.link}
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
      })}
    </>
  );
}
