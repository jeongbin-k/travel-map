import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Feature,
} from "geojson";
import "./App.css";

function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

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

    const projection = d3
      .geoMercator()
      .scale((width / (2 * Math.PI)) * 0.9)
      .translate([width / 2, height * 0.6]);

    const pathGenerator = d3.geoPath().projection(projection);

    const mapMargin = 0.05;
    const extent: [[number, number], [number, number]] = [
      [-width * mapMargin, -height * mapMargin],
      [width * (1 + mapMargin), height * (1 + mapMargin)],
    ];
    // 줌 동작 정의
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // 확대 배율 제한
      .translateExtent(extent) // ★ 이 코드가 지도가 무한정 나가는 걸 막아줍니다.
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior).on("dblclick.zoom", null);

    // ★ 클릭 시 확대/축소 로직
    function clicked(
      event: React.MouseEvent | MouseEvent,
      d: Feature<Geometry, GeoJsonProperties>,
    ) {
      const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d);

      // event에 stopPropagation이 있는지 확인 후 호출 (안전한 타입 가드)
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }

      // svg.node()의 타입을 명확히 하여 any 방지
      const svgNode = svg.node();
      if (!svgNode) return;

      const transform = d3.zoomTransform(svgNode);
      const isZoomedOut = transform.k > 1.1;

      if (isZoomedOut) {
        svg
          .transition()
          .duration(750)
          .call(zoomBehavior.transform, d3.zoomIdentity);
      } else {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;

        const scale = Math.max(
          1,
          Math.min(8, 0.7 / Math.max(dx / width, dy / height)), // 여백을 위해 0.7 권장
        );
        const translate: [number, number] = [
          width / 2 - scale * x,
          height / 2 - scale * y,
        ];

        svg
          .transition()
          .duration(750)
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
          );
      }
    }

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
        .attr("stroke-width", 0.2)
        .attr("fill-rule", "evenodd")
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this).transition().duration(200).attr("fill", "#3a3a3a");
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("fill", "#2a2a2a");
        })
        .on("click", clicked); // ★ 클릭 이벤트 연결
    });

    // 배경 클릭 시 리셋 (나라가 아닌 바다 클릭 시)
    svg.on("click", () => {
      svg
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    });

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="map-wrapper">
      <svg ref={svgRef} />
    </div>
  );
}

export default App;
