//hover_highlight.js

export function addHoverEffect(svg, zoomGroup, node, link, label) {
  // 마우스 오버 이벤트 핸들러
  function handleMouseOver(event, d) {
    const connectedNodes = new Set();
    connectedNodes.add(d.id);

    link
      .filter(
        (edge) => edge.source.id === d.id || edge.target.id === d.id
      )
      .each((edge) => {
        connectedNodes.add(edge.source.id);
        connectedNodes.add(edge.target.id);
      });

    link
      .style("stroke", (edge) =>
        connectedNodes.has(edge.source.id) &&
        connectedNodes.has(edge.target.id)
          ? "#FFD700"
          : "rgba(150, 150, 150, 0.1)"
      )
      .style("stroke-width", (edge) =>
        connectedNodes.has(edge.source.id) &&
        connectedNodes.has(edge.target.id)
          ? 2
          : 1
      );

    node.style("opacity", (node) =>
      connectedNodes.has(node.id) ? 1 : 0.1
    );

    label.style("opacity", (node) =>
      connectedNodes.has(node.id) ? 1 : 0.1
    );
  }

  function handleMouseOut() {
    link
      .style("stroke", "rgba(150, 150, 150, 0.5)")
      .style("stroke-width", 1.5);

    node.style("opacity", 1);
    label.style("opacity", 1);
  }

  node.on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);

  label
    .on("mouseover", (event, d) => {
      handleMouseOver(event, d);
    })
    .on("mouseout", () => {
      handleMouseOut();
    });
}
