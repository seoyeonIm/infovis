document.addEventListener("DOMContentLoaded", function () {
  // URL에서 artistName 매개변수 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const artistName = urlParams.get("artist");

  if (!artistName) {
    console.error("URL에서 작가 이름을 가져올 수 없습니다.");
    return;
  }

  console.log("현재 작가 이름 (artistName):", artistName);

  // JSON 파일 경로
  const jsonFilePath = "/js/artwork_link.json";

  fetch(jsonFilePath)
    .then((response) => response.json())
    .then((data) => {
      // artistName 기준으로 작품 필터링
      const filteredArtworks = data.filter(
        (item) => item["작가"] === artistName
      );

      if (!filteredArtworks.length) {
        console.warn(`작가 "${artistName}"에 해당하는 작품이 없습니다.`);
        return;
      }

      const imageGallery = document.querySelector(".image-gallery");

      filteredArtworks.forEach((artwork) => {
        const collectionNumber = artwork["﻿소장품번호"].trim();
        const artworkTitle = artwork["작품명"];
        const artworkLink = artwork["링크"];

        const imagePath = `artwork_images/${artistName}/${collectionNumber}/${collectionNumber}_0000.jpg`;

        const imageBox = document.createElement("div");
        imageBox.classList.add("image-box");
        imageBox.style.backgroundImage = `url('${imagePath}')`;

        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        const artworkTitleElement = document.createElement("div");
        artworkTitleElement.classList.add("artwork-title");
        artworkTitleElement.innerText = artworkTitle;

        overlay.appendChild(artworkTitleElement);
        imageBox.appendChild(overlay);

        imageBox.addEventListener("click", () => {
          window.open(artworkLink, "_blank");
        });

        imageGallery.appendChild(imageBox);
      });
    })
    .catch((error) => {
      console.error("JSON 파일을 로드하는 중 오류가 발생했습니다:", error);
    });
});
