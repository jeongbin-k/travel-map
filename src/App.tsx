import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Feature,
} from "geojson";
import "./App.css";
import Header from "./components/Header";

type Page = "world" | "project" | "detail";

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const airplaneAudioRef = useRef<HTMLAudioElement | null>(null);

  // 사운드 상태 제어를 위한 ref (d3 핸들러 내부에서 최신 상태 참조용)
  const isPlayingRef = useRef(true);
  const [currentPage, setCurrentPage] = useState<Page>("world");
  const [isPlaying, setIsPlaying] = useState(true);

  // 사운드 토글 핸들러
  const handleSoundtrackClick = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    isPlayingRef.current = nextState; // Ref도 함께 업데이트

    if (airplaneAudioRef.current) {
      if (!nextState) {
        airplaneAudioRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;
    // 초기 설정 값 정의 (재사용을 위해 변수로 관리)
    const initialScaleRatio = 0.78;
    const initialYOffset = 0.7;

    const audio = new Audio("/sounds/airplane.mp3");
    audio.load();
    airplaneAudioRef.current = audio;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "#181818")
      .style("width", "100%")
      .style("height", "100vh");

    const g = svg.append("g");

    // 2. 레이아웃 최적화 (북반구 확보)
    const projection = d3
      .geoMercator()
      .rotate([-10, 0])
      .scale((width / (2 * Math.PI)) * initialScaleRatio)
      .translate([width / 2, height * initialYOffset]);
    const pathGenerator = d3.geoPath().projection(projection);
    const mapMargin = 0.05;
    const getExtent = (
      w: number,
      h: number,
    ): [[number, number], [number, number]] => [
      [-w * mapMargin, -h * mapMargin],
      [w * (1 + mapMargin), h * (1 + mapMargin)],
    ];
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent(getExtent(width, height))
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior).on("dblclick.zoom", null);

    // 3. 국가 클릭 핸들러
    function clicked(
      event: React.MouseEvent | MouseEvent,
      d: Feature<Geometry, GeoJsonProperties>,
    ) {
      const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d);

      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }

      const svgNode = svg.node();
      if (!svgNode) return;

      const transform = d3.zoomTransform(svgNode);
      const isZoomedOut = transform.k > 1.1;

      if (isZoomedOut) {
        svg
          .transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .call(zoomBehavior.transform, d3.zoomIdentity);
      } else {
        // 사운드 재생 (켜져 있을 때만)
        if (airplaneAudioRef.current && isPlayingRef.current) {
          airplaneAudioRef.current.currentTime = 0;
          airplaneAudioRef.current.volume = 0.5;
          airplaneAudioRef.current
            .play()
            .catch((e) => console.log("재생 차단됨:", e));
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;

        // 확대 배율 계산 (더 꽉 차게 0.85 적용)
        const scale = Math.max(
          1,
          Math.min(12, 0.85 / Math.max(dx / width, dy / height)),
        );
        const translate: [number, number] = [
          width / 2 - scale * x,
          height / 2 - scale * y,
        ];

        svg
          .transition()
          .duration(2000)
          .ease(d3.easePolyOut.exponent(3)) // 쫀득한 이동
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
          );
      }
    }

    // 4. 지도 데이터 로드 및 그리기
    d3.json<FeatureCollection<Geometry, GeoJsonProperties>>(
      "/world.geojson",
    ).then((data) => {
      if (!data) return;

      const features = data.features.filter(
        (d) => d.properties?.name !== "Antarctica",
      );

      g.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", (d) => pathGenerator(d))
        .attr("fill", "#2a2a2a")
        .attr("stroke", "#181818")
        .attr("stroke-width", 0.3)
        .attr("fill-rule", "evenodd")
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this).transition().duration(200).attr("fill", "#3a3a3a");
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("fill", "#2a2a2a");
        })
        .on("click", clicked);
    });

    // 배경 클릭 시 리셋
    svg.on("click", () => {
      svg
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    });
    const handleResize = () => {
      // 최신 창 크기 반영
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // 1. SVG 크기 및 viewBox 즉시 갱신
      svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);

      // 2. 투영법 재설정
      projection
        .scale((newWidth / (2 * Math.PI)) * initialScaleRatio)
        .translate([newWidth / 2, newHeight * initialYOffset]);

      // 3. 지도 경로 다시 그리기
      g.selectAll<SVGPathElement, Feature<Geometry, GeoJsonProperties>>(
        "path",
      ).attr("d", (d) => pathGenerator(d));

      // 4.중요: 줌 제한 구역(Extent)을 새 크기에 맞게 갱신
      const newExtent = getExtent(newWidth, newHeight);
      zoomBehavior.translateExtent(newExtent).extent([
        [0, 0],
        [newWidth, newHeight],
      ]);

      // 5.리사이즈 시 줌 상태를 강제로 리셋 (지도가 화면 밖으로 튕기는 현상 방지)
      svg.call(zoomBehavior.transform, d3.zoomIdentity);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="map-wrapper">
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isPlaying={isPlaying}
        onSoundtrackClick={handleSoundtrackClick}
      />
      <svg ref={svgRef} />
    </div>
  );
}

export default App;
