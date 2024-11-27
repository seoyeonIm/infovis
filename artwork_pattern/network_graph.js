//network_graph.js

import { addHoverEffect } from "./hover_highlight.js";

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

// JSON 데이터 불러오기
d3.json("/prototype/artwork_pattern/artwork_pattern.json")
  .then((data) => {
    if (!data.nodes || !data.edges) {
      console.error("Invalid JSON format: Missing 'nodes' or 'edges'");
      return;
    }

    // 노드 크기 및 색상 설정
    data.nodes.forEach((node) => {
      node.id = node.key;
      node.label = node.attributes.label;
      node.color = node.attributes.color || "#000";
    });

    // 엣지 크기 설정
    data.edges.forEach((edge) => {
      edge.source = edge.source;
      edge.target = edge.target;
      edge.size = edge.attributes?.weight || 1;
    });

    // 노드의 연결 개수 계산
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

    // 계층적 원형 배치 설정
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2.5; // 바깥쪽 원 반지름
    const innerRadius = outerRadius / 2; // 내부 원 반지름
    const angleStep = (2 * Math.PI) / data.nodes.length;

    // 노드를 중심에서 가까운 것부터 정렬
    const sortedNodes = data.nodes.sort(
      (a, b) => (degreeMap[b.id] || 0) - (degreeMap[a.id] || 0)
    );

    sortedNodes.forEach((node, index) => {
      const isOuter = index % 2 === 0; // 홀수 인덱스는 바깥쪽, 짝수 인덱스는 안쪽
      const radius = isOuter ? outerRadius : innerRadius;
      const angle = index * angleStep;

      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // 링크(엣지) 추가 (zoomGroup 내부로 추가)
    const link = zoomGroup
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.edges)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", (d) => d.size || 1.5);

    // 노드 추가 (zoomGroup 내부로 추가)
    const node = zoomGroup
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(degreeMap[d.id] || 1))
      .attr("fill", (d) => d.color || "blue")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // 라벨 추가 (zoomGroup 내부로 추가)
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
      .text((d) => d.label)
      .call(
        d3
          .drag()
          .on("start", dragstarted) // 드래그 시작 이벤트
          .on("drag", dragged) // 드래그 중 이벤트
          .on("end", dragended) // 드래그 끝 이벤트
      );

    // 힘 기반 시뮬레이션 설정
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3.forceLink(data.edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(-1500) // 노드 간 반발력
      )
      .force(
        "center",
        d3.forceCenter(width / 2, height / 2) // 그래프 중심
      )
      .on("tick", () => {
        // tick 이벤트: 시뮬레이션 업데이트 시 실행
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        label.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });

    // 강조 효과 추가
    addHoverEffect(svg, zoomGroup, node, link, label);
    
      // **초기 확대 상태 설정**
    const bounds = svg.node().getBBox(); // SVG 경계 계산
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;
    
    const scale = Math.min(width / fullWidth, height / fullHeight) * 0.2; // 적절한 축소 비율 계산
    const translateX = (width - fullWidth * scale) / 2 - bounds.x * scale; // 중앙 정렬 X
    const translateY = (height - fullHeight * scale) / 2 - bounds.y * scale; // 중앙 정렬 Y
    
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale) // 초기 확대 및 이동 설정
      );
    })
    .catch((error) => {
      console.error("Error loading JSON file:", error);
      });

  let simulation;
    
    // 드래그 이벤트 핸들러 정의
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
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
};

// 버튼 이벤트 추가
document.getElementById("view-graph-button").addEventListener("click", () => {
  window.open(
    "https://ouestware.gitlab.io/retina/beta/#/graph/?url=https%3A%2F%2Fgist.githubusercontent.com%2FseoyeonIm%2F7bcbe0b57151a7593dc40ed781d48a54%2Fraw%2F2e7392505117d3c0d942acfb5e9a1ab446655f89%2Fnetwork-3cff222d-882.gexf&nr=1.487&lt=10&ls=8&le=30",
    "_blank"
  );
});