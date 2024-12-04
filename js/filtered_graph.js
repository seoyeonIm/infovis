export function createFilteredGraph(graphData, clickedNodeLabel, containerId) {
  // 컨테이너 초기화
  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove(); // 기존 그래프 삭제

  // 필터링된 데이터 생성
  const filteredLinks = graphData.edges.filter(
    (link) =>
      link.source === clickedNodeLabel || link.target === clickedNodeLabel
  );

  const nodeKeys = new Set();
  filteredLinks.forEach((link) => {
    nodeKeys.add(link.source);
    nodeKeys.add(link.target);
  });

  const filteredNodes = graphData.nodes.filter((node) =>
    nodeKeys.has(node.key)
  );

  // 부모 컨테이너 크기 가져오기
  const containerWidth = container.node().clientWidth;
  const containerHeight = container.node().clientHeight;

  // SVG 및 줌 그룹 생성
  const svg = container
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  const zoomGroup = svg.append("g"); // 줌이 적용될 그룹

  svg.call(
    d3
      .zoom()
      .scaleExtent([0.5, 5]) // 줌 범위 설정
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
      })
  );

  const simulation = d3
    .forceSimulation(filteredNodes)
    .force(
      "link",
      d3
        .forceLink(filteredLinks)
        .id((d) => d.key)
        .distance(150) // 거리 유지
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2))
    .force("collision", d3.forceCollide(30));

  const link = zoomGroup
    .selectAll("line")
    .data(filteredLinks)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 4); // 엣지 두께

  const linkLabels = zoomGroup
    .selectAll(".link-label")
    .data(filteredLinks)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text((d) => d.attributes?.label || ""); // 라벨 데이터 바인딩

  const node = zoomGroup
    .selectAll("circle")
    .data(filteredNodes)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("fill", (d) => d.attributes.color || "blue")
    .attr("class", (d) => {
      // 초록색 작가 노드에만 클래스 추가
      return d.attributes.color === "green" && d.attributes.label === "작가"
        ? "clickable-node"
        : "";
    })
    .on("mouseover", function (event, d) {
      if (d.attributes.color === "green" && d.attributes.label === "작가") {
        d3.select(this).style("cursor", "pointer"); // 포인터 커서 설정
      }
    })
    .on("mouseout", function () {
      d3.select(this).style("cursor", "default"); // 기본 커서 복원
    })
    .call(
      d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  zoomGroup
    .selectAll(".node-label")
    .data(filteredNodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", -10)
    .attr("fill", "#333")
    .text((d) => d.attributes.label)
    .style("font-size", "20px")
    .style("font-weight", "bold");

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    linkLabels
      .attr("x", (d) => (d.source.x + d.target.x) / 2) // 엣지 중간 지점
      .attr("y", (d) => (d.source.y + d.target.y) / 2);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    zoomGroup
      .selectAll(".node-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 25);
  });
}
