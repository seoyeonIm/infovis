export function addHoverEffect(svg, zoomGroup, node, link, label) {
  let selectedNodeId = null; // 선택된 노드의 ID

  // 마우스 오버 이벤트 핸들러
  function handleMouseOver(event, d) {
    if (selectedNodeId) return; // 선택된 상태에서는 마우스 오버 무시
    applyHighlight(d);
  }

  // 마우스 아웃 이벤트 핸들러
  function handleMouseOut() {
    if (selectedNodeId) return; // 선택된 상태에서는 마우스 아웃 무시
    resetHighlight();
  }

  function handleClick(event, d) {
    if (selectedNodeId === d.id) {
      // 이미 선택된 노드 클릭 시 선택 해제
      selectedNodeId = null;
      resetHighlight();
    } else {
      // 새로운 노드 선택
      selectedNodeId = d.id;
      applyHighlight(d);

      // 추가: artwork_pattern.js의 함수 호출
      if (d.attributes?.class === "작품유형") {
        const label = d.attributes.label;
        console.log("작품유형 노드가 클릭되었습니다. 라벨:", label);
        updateRightBoxContent(label); // 오른쪽 박스 업데이트
      }
    }
  }

  // 오른쪽 박스 업데이트 함수
  function updateRightBoxContent(typeKey) {
    // 클릭된 노드의 데이터를 콘솔에 출력
    console.log(`클릭된 노드의 ID: ${typeKey}`);

    const wordCloudPath = `https://seoyeonIm.github.io/infovis/type_pattern_wordcloud/${typeKey}_wordcloud.png`;
    const barChartPath = `https://seoyeonIm.github.io/infovis/type_artist_bar_graph/${typeKey}_bar_graph.png`;

    console.log(`워드클라우드 경로: ${wordCloudPath}`);
    console.log(`막대 그래프 경로: ${barChartPath}`);

    const wordCloudImg = document.getElementById("wordcloud-img");
    const barChartImg = document.getElementById("barchart-img");

    if (wordCloudImg && barChartImg) {
      wordCloudImg.src = wordCloudPath;
      wordCloudImg.style.display = "block";

      barChartImg.src = barChartPath;
      barChartImg.style.display = "block";
    } else {
      console.error("오른쪽 박스에 이미지 DOM 요소를 찾을 수 없습니다.");
    }
  }

  // 하이라이트 적용 함수
  function applyHighlight(selectedNode) {
    const connectedNodes = new Set();
    connectedNodes.add(selectedNode.id);

    link
      .filter(
        (edge) =>
          edge.source.id === selectedNode.id ||
          edge.target.id === selectedNode.id
      )
      .each((edge) => {
        connectedNodes.add(edge.source.id);
        connectedNodes.add(edge.target.id);
      });

    link
      .style("stroke", (edge) =>
        connectedNodes.has(edge.source.id) && connectedNodes.has(edge.target.id)
          ? "#FFD700"
          : "rgba(150, 150, 150, 0.1)"
      )
      .style("stroke-width", (edge) =>
        connectedNodes.has(edge.source.id) && connectedNodes.has(edge.target.id)
          ? 2
          : 1
      );

    node.style("opacity", (node) => (connectedNodes.has(node.id) ? 1 : 0.1));

    label
      .style("opacity", (node) => (connectedNodes.has(node.id) ? 1 : 0.1))
      .style("font-weight", (node) =>
        connectedNodes.has(node.id) ? "900" : "normal"
      ); // 텍스트 굵게 설정
  }

  // 하이라이트 해제 함수
  function resetHighlight() {
    link.style("stroke", "rgba(150, 150, 150, 0.5)").style("stroke-width", 1.5);

    node.style("opacity", 1);

    label.style("opacity", 1).style("font-weight", "normal"); // 텍스트 굵기 원래 상태로 복원
  }

  // 이벤트 바인딩
  node
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);

  label
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);

  // 그래프 배경 클릭 시 선택 해제
  svg.on("click", (event) => {
    if (!event.target.closest(".nodes")) {
      selectedNodeId = null;
      resetHighlight();
    }
  });
}
