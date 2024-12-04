// 글로벌 변수 선언
window.currentArtistName = null;

export async function createTimeline(containerId, dataUrl) {
  const response = await fetch(dataUrl);
  const data = await response.json();

  function showPopup(artistName) {
    const popup = document.getElementById("popup-container");
    const frame = document.getElementById("popup-frame");
    // 작가 이름을 URL에 전달
    const artistFileName = `https://seoyeonIm.github.io/infovis/artist_popup.html?artist=${encodeURIComponent(
      artistName
    )}`;
    frame.src = artistFileName; // iframe의 src 설정
    popup.classList.remove("hidden");
    popup.classList.add("visible");

    // 디버깅: 현재 작가 이름 확인
    console.log("Popup opened for artist:", artistName);
  }
  function hidePopup() {
    const popup = document.getElementById("popup-container");
    popup.classList.remove("visible");
    popup.classList.add("hidden");

    // 글로벌 변수 초기화
    window.currentArtistName = null;
  }

  document.getElementById("popup-close").addEventListener("click", hidePopup);

  // 색상 매핑 정의
  const colorMap = {
    문인서화가: "#815854",
    화원: "#1D4173",
    화사: "#A5193E",
  };

  // 데이터 준비
  const parseDate = d3.timeParse("%Y-%m-%d");
  data.forEach((d) => {
    d.birthDate = d.birth ? parseDate(d.birth) : null;
    d.deathDate = d.death ? parseDate(d.death) : new Date();
  });

  // 그룹 배정: 충돌 감지
  const groups = [];
  data.forEach((d) => {
    const groupIndex = groups.findIndex((group) =>
      group.every(
        (member) =>
          d.deathDate <= member.birthDate || d.birthDate >= member.deathDate
      )
    );

    if (groupIndex === -1) {
      groups.push([d]); // 새로운 그룹 생성
    } else {
      groups[groupIndex].push(d); // 기존 그룹에 추가
    }
  });

  // 각 데이터에 그룹 번호 할당
  data.forEach((d) => {
    d.group = groups.findIndex((group) => group.includes(d));
  });

  // SVG 설정
  const margin = { top: 20, right: 20, bottom: 0, left: 60 };
  const width = 1350 - margin.left - margin.right;
  const height = groups.length * 50; // 그룹 수에 따라 높이 동적 설정

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X축: 시간
  const x = d3
    .scaleTime()
    .domain(d3.extent(data.flatMap((d) => [d.birthDate, d.deathDate])))
    .range([0, width * 1.5]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(d3.timeYear.every(10))
    .tickValues(x.ticks(d3.timeYear.every(10)).filter((_, i) => i % 2 === 0));

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  // Y축: 그룹
  const y = d3
    .scaleBand()
    .domain(groups.map((_, i) => i))
    .range([0, height])
    .padding(0.3);

  const yAxis = d3.axisLeft(y);
  svg.append("g").attr("class", "y axis").call(yAxis);

  // 타임라인 바 생성
  const bars = svg
    .selectAll(".timeline")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "timeline")
    .attr("x", (d) => (d.birthDate ? x(d.birthDate) : 0))
    .attr("y", (d) => y(d.group))
    .attr("width", (d) =>
      d.birthDate && d.deathDate ? x(d.deathDate) - x(d.birthDate) : 0
    )
    .attr("height", y.bandwidth())
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", (d) => colorMap[d.job] || "#cccccc")
    .on("click", (event, d) => {
      showPopup(d.name); // 클릭 시 해당 작가명을 전달
    });

  const formatYear = d3.timeFormat("%Y");

  //각 바 안에 이름과 생몰년도 표시
  svg
    .selectAll(".name-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "name-label")
    .attr("x", (d) => (d.birthDate ? x(d.birthDate) + 5 : 5))
    .attr("y", (d) => y(d.group) + y.bandwidth() / 2)
    .style("dominant-baseline", "middle")
    .style("text-anchor", "start")
    .style("font-size", "12px")
    .style("fill", "white")
    .text((d) => {
      const birthYear = d.birthDate ? formatYear(d.birthDate) : "Unknown";
      const deathYear = d.deathDate ? formatYear(d.deathDate) : "Present";
      return `${d.name} ${birthYear}-${deathYear}`;
    })
    .on("click", (event, d) => {
      showPopup(d.name); // 텍스트 클릭 시 팝업 열기
    });

  // 범례 생성 코드 (svg 정의 이후)
  const legendData = [
    { job: "문인서화가", color: "#815854" },
    { job: "화원", color: "#1D4173" },
    { job: "화사", color: "#A5193E" },
  ];

  const legendItemWidth = 150;
  const legendWidth = legendData.length * legendItemWidth;

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${(width - legendWidth) / 2 + 400}, ${height + 50})`
    );

  legend
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * legendItemWidth}, 0)`);

  legend
    .selectAll(".legend-item")
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => d.color);

  legend
    .selectAll(".legend-item")
    .append("text")
    .attr("x", 30)
    .attr("y", 15)
    .style("font-size", "14px")
    .style("dominant-baseline", "middle")
    .text((d) => d.job);

  // 마우스오버 이벤트 추가
  bars
    .on("mouseenter", function (event, d) {
      d3.select(this)
        .attr("fill", "#ffa500")
        .attr("height", y.bandwidth() * 1.2)
        .attr("y", y(d.group) - y.bandwidth() * 0.1);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this)
        .attr("fill", colorMap[d.job])
        .attr("height", y.bandwidth())
        .attr("y", y(d.group));
    });
}
