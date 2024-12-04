document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const artistName = urlParams.get("artist");

  if (artistName) {
    fetch("js/artist.json")
      .then((response) => response.json())
      .then((data) => {
        const artistData = data.find(
          (artist) => artist.artist_name === artistName
        );

        if (artistData) {
          // 화풍 태그 추가
          const styleRow = document.querySelector(".info-row:nth-child(3)"); // 화풍 행 선택
          while (
            styleRow.lastChild &&
            !styleRow.lastChild.classList.contains("info-label")
          ) {
            styleRow.removeChild(styleRow.lastChild); // 기존 태그 제거
          }

          if (artistData.artist_style && artistData.artist_style.trim()) {
            const uniqueStyles = [
              ...new Set(artistData.artist_style.split(",")),
            ]; // 중복 제거
            uniqueStyles.forEach((style) => {
              const tag = document.createElement("div");
              tag.className = "tag";
              tag.textContent = style.trim();
              styleRow.appendChild(tag);
            });
          }

          // 화법 태그 추가
          const techniqueRow = document.querySelector(".info-row:nth-child(4)"); // 화법 행 선택
          while (
            techniqueRow.lastChild &&
            !techniqueRow.lastChild.classList.contains("info-label")
          ) {
            techniqueRow.removeChild(techniqueRow.lastChild); // 기존 태그 제거
          }

          if (
            artistData.artist_technique &&
            artistData.artist_technique.trim()
          ) {
            const uniqueTechniques = [
              ...new Set(artistData.artist_technique.split(",")),
            ]; // 중복 제거
            uniqueTechniques.forEach((technique) => {
              const tag = document.createElement("div");
              tag.className = "tag";
              tag.textContent = technique.trim();
              techniqueRow.appendChild(tag);
            });
          }
        }
      });
  }
});
