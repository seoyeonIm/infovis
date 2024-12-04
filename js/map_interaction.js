import { createFilteredGraph } from "https://seoyeonIm.github.io/infovis/js/filtered_graph.js"; // filtered_graph.js 가져오기
import { createFilteredGraphBottom } from "https://seoyeonIm.github.io/infovis/js/filtered_graph_bottom.js"; // filtered_graph_bottom.js 가져오기

// Leaflet 지도 설정
const map = L.map("map").setView([37.7749, -122.4194], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let geoJSONLayer; // GeoJSON 레이어를 전역에서 참조
let selectedLayer = null; // 이전에 선택된 레이어를 저장하기 위한 변수

// GeoJSON 데이터 불러오기
fetch(
  "https://raw.githubusercontent.com/seoyeonIm/prototype/main/place.geojson"
)
  .then((response) => response.json())
  .then((data) => {
    geoJSONLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 8,
          color: "#F361A6",
          weight: 1,
          fillOpacity: 0.7,
        });
      },
      onEachFeature: function (feature, layer) {
        layer.on({
          click: function () {
            // 이전 선택된 노드의 스타일 복구 (초기화)
            if (selectedLayer) {
              selectedLayer.setStyle({ color: "#F361A6", radius: 8 }); // 기존 스타일로 복구
              selectedLayer.closePopup();
            }

            // 현재 선택된 레이어 업데이트 및 스타일 변경
            selectedLayer = layer; // 선택된 레이어 저장
            layer.setStyle({ color: "red", radius: 12 }); // 선택된 레이어 스타일 변경

            console.log("지도에서 클릭된 노드:", feature.properties.name); // 디버깅용

            // 오른쪽 페이지 초기화 (상단 및 하단)
            const topContainer = document.getElementById("filtered-graph");
            const bottomContainer = document.getElementById(
              "filtered-graph-bottom"
            );

            if (topContainer) topContainer.innerHTML = ""; // 상단 그래프 초기화
            if (bottomContainer) bottomContainer.innerHTML = ""; // 하단 그래프 초기화

            // JSON 데이터를 새로 불러와 필터링 후 그래프 생성
            fetch("https://seoyeonIm.github.io/infovis/js/place.json") // 그래프 데이터를 새로 불러옴
              .then((response) => response.json())
              .then((graphData) => {
                createFilteredGraph(
                  graphData,
                  feature.properties.name,
                  "filtered-graph"
                ); // 상단 그래프 새로 생성
                bindArtistNodeClick(graphData); // 작가 노드 클릭 이벤트 다시 바인딩
              })
              .catch((error) =>
                console.error("Error loading graph data:", error)
              );
          },
        });

        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
        }
      },
    }).addTo(map);

    map.fitBounds(geoJSONLayer.getBounds());
  });

// 지도 핀 업데이트 함수
window.updateMapPin = function (label) {
  const layers = geoJSONLayer.getLayers(); // 지도 위의 모든 핀 가져오기

  layers.forEach((layer) => {
    const pinLabel = layer.feature.properties.name;

    if (pinLabel === label) {
      // 핀 스타일 업데이트
      layer.setStyle({ color: "green", radius: 12 });

      // 기존 라벨 방식으로 팝업 표시
      layer.bindPopup(`<strong>${pinLabel}</strong>`).openPopup();
    } else {
      // 기존 핀 스타일 복원
      layer.setStyle({ color: "#F361A6", radius: 8 });
      layer.closePopup(); // 다른 핀의 팝업 닫기
    }
  });
};

// "filtered-graph" 내 "작가" 노드 클릭 이벤트 바인딩
function bindArtistNodeClick(graphData) {
  // "filtered-graph" 내부의 SVG에서 circle 요소를 찾음
  const artistNodes = d3
    .select("#filtered-graph svg")
    .selectAll("circle")
    .filter((d) => d.attributes && d.attributes.class === "작가"); // "작가" 노드만 선택

  // 클릭 이벤트 추가
  artistNodes.on("click", (event, d) => {
    console.log("클릭된 작가:", d.attributes.label); // 디버깅용
    const clickedArtist = d.attributes.label; // "작가"의 라벨

    fetch("/js/place.json") // 그래프 데이터를 새로 불러옴
      .then((response) => response.json())
      .then((graphData) => {
        createFilteredGraphBottom(
          graphData,
          clickedArtist,
          "filtered-graph-bottom"
        ); // 하단 그래프 새로 생성
      })
      .catch((error) => console.error("Error loading graph data:", error));
  });
}
