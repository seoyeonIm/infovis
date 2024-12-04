document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const artistName = urlParams.get("artist");

  if (artistName) {
    // artist.json 데이터 로드
    fetch("js/artist.json")
      .then((response) => response.json())
      .then((data) => {
        const artistData = data.find(
          (artist) => artist.artist_name === artistName
        );

        if (artistData) {
          document.querySelector(".title").textContent = artistData.artist_name;
          document.querySelector(
            ".title-section .label:nth-child(3)"
          ).textContent = artistData.artist_namechin;
          document.querySelector(
            ".info-box .info-row:nth-child(1) div:nth-child(2)"
          ).textContent = artistData.period;
          document.querySelector(
            ".info-box .info-row:nth-child(2) .tag"
          ).textContent = artistData.occupation;

          const styleTags = artistData.artist_style
            .split(",")
            .map((style) => `<div class="tag">${style.trim()}</div>`)
            .join("");
          document.querySelector(
            ".info-box .info-row:nth-child(3)"
          ).innerHTML += styleTags;

          const techniqueTags = artistData.artist_technique
            .split(",")
            .map((technique) => `<div class="tag">${technique.trim()}</div>`)
            .join("");
          document.querySelector(
            ".info-box .info-row:nth-child(4)"
          ).innerHTML += techniqueTags;
        }
      });

    // 관계도 로드
    fetch("js/artist_relationship.json")
      .then((response) => response.json())
      .then((data) => {
        const nodes = data.nodes;
        const edges = data.edges;

        // 필터링된 엣지 추출
        const filteredEdges = edges.filter(
          (edge) => edge.source === artistName || edge.target === artistName
        );

        // 연결된 노드 추출
        const connectedNodeKeys = new Set(
          filteredEdges.flatMap((edge) => [edge.source, edge.target])
        );

        const filteredNodes = nodes.filter((node) =>
          connectedNodeKeys.has(node.key)
        );

        drawGraph(filteredNodes, filteredEdges); // 그래프 그리기
      })
      .catch((error) => {
        console.error("관계도 데이터 로드 오류:", error);
      });
  }

  // 그래프 그리기 함수
  function drawGraph(nodes, edges) {
    const width = 600;
    const height = 400;

    // SVG 및 줌/드래그 설정
    const svg = d3
      .select(".content-section")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(
        d3
          .zoom()
          .scaleExtent([0.5, 5]) // 줌 배율 설정
          .on("zoom", (event) => {
            g.attr("transform", event.transform); // 그래프 이동 및 확대/축소
          })
      );

    const g = svg.append("g");

    // SVG 화살표 마커 정의
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) // 화살표가 노드에 닿는 위치 조정
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5") // 화살표 모양
      .attr("fill", "black"); // 화살표 색상

    // 링크(엣지) 그리기
    const link = g
      .selectAll(".link")
      .data(edges)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1.5)
      .attr("fill", "none") // 경로 내부 색상 제거
      .attr("marker-end", "url(#arrow)") // 화살표 추가
      .attr("d", (d) => {
        // 시작점과 끝점을 연결하는 경로 설정
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

    // 엣지 라벨 표시
    const linkLabels = g
      .selectAll(".link-label")
      .data(edges)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .attr("font-size", "8px")
      .attr("fill", "#555")
      .text((d) => d.attributes.label);

    const nodeColors = {
      문인서화가: "#815854",
      화원: "#1D4173",
      화사: "#A5193E",
    };

    // 노드(원) 그리기
    const node = g
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .attr(
        "fill",
        (d) => nodeColors[d.attributes.직업] || "rgba(204, 204, 204, 0.8)"
      )
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

    // 노드 라벨 표시
    const nodeLabels = g
      .selectAll(".node-label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .attr("stroke", "white")
      .attr("stroke-width", "2")
      .attr("paint-order", "stroke")
      .attr("text-anchor", "middle")
      .attr("dy", "15")
      .text((d) => d.attributes.label);

    // Force Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => d.key)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
      link.attr("d", (d) => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      linkLabels
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      nodeLabels.attr("x", (d) => d.x).attr("y", (d) => d.y - 15);
    });
  }
});
