import { addHoverEffect } from "https://seoyeonIm.github.io/infovis/js/hover_highlight_place.js";

// SVG 크기 설정
const width = 1000;
const height = 800;

// 노드 크기 범위 설정
const minNodeSize = 30;
const maxNodeSize = 100;

// SVG 생성 및 크기 조정
const svg = d3
  .select(".iframe-container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("background", "#fff");

// 줌 기능 추가
const zoomGroup = svg.append("g");

const zoom = d3.zoom().on("zoom", (event) => {
  zoomGroup.attr("transform", event.transform);
});

svg.call(zoom);

// 전역에서 simulation 변수 선언
let simulation;

// JSON 데이터 불러오기
d3.json("https://seoyeonIm.github.io/infovis/js/place.json")
  .then((data) => {
    console.log(data); // JSON 데이터 로드 확인
    if (!data.nodes || !data.edges) {
      console.error("Invalid JSON format: Missing 'nodes' or 'edges'");
      return;
    }

    // 노드 크기 및 색상 설정
    data.nodes.forEach((node) => {
      node.id = node.key; // id 필드 추가
      node.label = node.attributes.label;
      node.color = node.attributes.color || "#000";
    });

    // 엣지 크기 설정
    data.edges.forEach((edge) => {
      edge.size = edge.attributes?.weight || 1;
    });

    // 노드 연결 개수 계산
    const degreeMap = {};
    data.edges.forEach((edge) => {
      degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
      degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
    });

    // 노드 크기 스케일링
    const sizeScale = d3
      .scaleLinear()
      .domain([1, d3.max(Object.values(degreeMap)) || 1])
      .range([minNodeSize, maxNodeSize]);

    // 링크 추가
    const link = zoomGroup
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.edges)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", (d) => d.size || 1.5);

    // 노드 추가
    const node = zoomGroup
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(degreeMap[d.id] || 1))
      .attr("fill", (d) => d.color || "blue")
      .style("cursor", "pointer") // 커서 스타일 추가
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // 라벨 추가
    const label = zoomGroup
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .style("font-size", (d) => `${sizeScale(degreeMap[d.id]) / 2}px`)
      .style("cursor", "pointer") // 마우스 커서 변경
      .text((d) => d.label);

    // 강조 효과 추가
    addHoverEffect(svg, zoomGroup, node, link, label);

    // 힘 기반 시뮬레이션 설정
    simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        label.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });

    // SVG의 경계 및 초기 줌 설정
    const bounds = zoomGroup.node().getBBox(); // 그래프의 전체 경계 계산
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;

    // 초기 확대 비율 계산 (여백 포함)
    const scale = Math.min(width / fullWidth, height / fullHeight) * 0.2; // 화면 크기에 맞게 조정
    const translateX = (width - fullWidth * scale) / 2 - bounds.x * scale; // X축 중앙 정렬
    const translateY = (height - fullHeight * scale) / 2 - bounds.y * scale; // Y축 중앙 정렬

    // 초기 줌 변환 설정
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  })
  .catch((error) => {
    console.error("Error loading JSON file:", error);
  });

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.1).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
