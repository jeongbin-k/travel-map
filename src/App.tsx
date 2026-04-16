import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
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
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#1d1d1d")
      .style("shape-rendering", "geometricPrecision");

    const g = svg.append("g");

    const projection = d3
      .geoMercator()
      .scale((width / (2 * Math.PI)) * 0.9)
      .translate([width / 2, height * 0.6]);

    const pathGenerator = d3.geoPath().projection(projection);

    const margin = 0;
    const extent: [[number, number], [number, number]] = [
      [-width * margin, -height * margin],
      [width * (1 + margin), height * (1 + margin)],
    ];

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent(extent)
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // 1. d3.json의 리턴 타입을 지정합니다. (FeatureCollection 사용)
    d3.json<FeatureCollection<Geometry, GeoJsonProperties>>(
      "/world.geojson",
    ).then((data) => {
      if (!data) return;

      // 2. data.features는 이미 Feature[] 타입으로 인식됩니다.
      const features = data.features.filter(
        (d) => d.properties?.name !== "Antarctica",
      );

      g.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        // 3. d 파라미터에 Feature 타입을 명시합니다.
        .attr("d", (d) => pathGenerator(d))
        .attr("fill", "#2a2a2a")
        .attr("stroke", "#1d1d1d")
        .attr("stroke-width", 0.2)
        .attr("fill-rule", "evenodd")
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this).transition().duration(200).attr("fill", "#3a3a3a");
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("fill", "#2a2a2a");
        });
    });

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      svg.attr("width", newWidth).attr("height", newHeight);
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
