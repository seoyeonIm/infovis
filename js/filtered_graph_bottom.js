export function createFilteredGraphBottom(
  graphData,
  clickedArtist,
  containerId
) {
  const filteredLinks = graphData.edges.filter((link) => {
    const sourceKey =
      typeof link.source === "object" ? link.source.key : link.source;
    const targetKey =
      typeof link.target === "object" ? link.target.key : link.target;

    const isSourceMatch = sourceKey === clickedArtist;
    const isTargetMatch = targetKey === clickedArtist;

    const relatedNodeKey = isSourceMatch ? targetKey : sourceKey;
    const relatedNode = graphData.nodes.find(
      (node) => node.key === relatedNodeKey
    );
    return (
      (isSourceMatch || isTargetMatch) &&
      relatedNode?.attributes?.class === "장소"
    );
  });

  const nodeKeys = new Set();
  filteredLinks.forEach((link) => {
    nodeKeys.add(
      typeof link.source === "object" ? link.source.key : link.source
    );
    nodeKeys.add(
      typeof link.target === "object" ? link.target.key : link.target
    );
  });

  const filteredNodes = graphData.nodes.filter((node) =>
    nodeKeys.has(node.key)
  );

  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove(); // 기존 내용을 삭제
  const width = 500;
  const height = 500;

  // SVG 및 줌 그룹 생성
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const zoomGroup = svg.append("g"); // 줌이 적용될 그룹

  // 줌 및 드래그 설정
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
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = zoomGroup
    .selectAll("line")
    .data(filteredLinks)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2);

  const linkLabels = zoomGroup
    .selectAll(".link-label")
    .data(filteredLinks)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("dy", -10)
    .attr("fill", "#333")
    .text((d) => d.attributes?.label || "") // 엣지 라벨 설정
    .style("font-size", "12px");

  const node = zoomGroup
    .selectAll("circle")
    .data(filteredNodes)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("fill", (d) => d.attributes.color || "blue")
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

  node.on("click", (event, d) => {
    if (d.attributes.class === "작가") {
      const artistName = d.attributes.label; // 작가명 가져오기
      showPopup(artistName); // 팝업 열기
    } else if (d.attributes.class === "장소") {
      const nodeLabel = d.attributes.label;
      window.updateMapPin(nodeLabel); // 장소 노드 클릭 처리
    }
  });

  zoomGroup
    .selectAll(".node-label")
    .data(filteredNodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", 0)
    .attr("fill", "#333")
    .text((d) => d.attributes.label)
    .style("font-size", "14px")
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
      .attr("y", (d) => d.y - 15);
  });
}
