import Sigma from "https://cdn.jsdelivr.net/npm/sigma/build/sigma.min.js";
import Graph from "https://cdn.jsdelivr.net/npm/graphology/dist/graphology.min.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. HTML에서 현재 작가 이름 가져오기
  const titleElement = document.querySelector(".title").innerText.trim();
  const jsonDataUrl = "https://raw.githubusercontent.com/seoyeonIm/infovis/main/js/artist_relationship.js"; // JSON 경로

  try {
    // 2. JSON 데이터 로드
    const response = await fetch(jsonDataUrl);
    const data = await response.json();

    // 3. 작가 이름을 기준으로 관계 필터링
    const filteredNodes = new Set();
    const edges = data.edges.filter((edge) => {
      const isRelevant =
        edge.source === titleElement || edge.target === titleElement;
      if (isRelevant) {
        filteredNodes.add(edge.source);
        filteredNodes.add(edge.target);
      }
      return isRelevant;
    });

    const nodes = data.nodes.filter((node) => filteredNodes.has(node.key));

    // 4. Graphology를 이용한 그래프 데이터 구성
    const graph = new Graph();
    nodes.forEach((node) => {
      graph.addNode(node.key, {
        label: node.attributes.label,
        size: parseFloat(node.attributes.size || 1),
        x: parseFloat(node.attributes.x || Math.random() * 10),
        y: parseFloat(node.attributes.y || Math.random() * 10),
        color: node.attributes.color || "#000",
      });
    });
    edges.forEach((edge) => {
      graph.addEdge(edge.source, edge.target, {
        label: edge.attributes.label || "",
        color: edge.attributes.color || "#ccc",
        size: parseFloat(edge.attributes.size || 1),
      });
    });

    // 5. Sigma.js를 이용해 그래프 렌더링
    const container = document.getElementById("sigma-container");
    container.innerHTML = ""; // 기존 내용 초기화
    const renderer = new Sigma(graph, container);
  } catch (error) {
    console.error("Error loading or processing JSON data:", error);
  }
});
