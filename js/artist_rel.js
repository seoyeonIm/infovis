document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".action-button");
  const sections = document.querySelectorAll(".graph-section");

  // 기본 섹션 활성화
  const defaultSection = document.getElementById("style");
  if (defaultSection) {
    defaultSection.classList.add("active");
  }

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault(); // 기본 동작 방지, 페이지 이동 안 함
      console.log("Button clicked:", button); // 버튼 클릭 확인용

      // 모든 섹션 숨김
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      // 클릭된 섹션 표시
      const targetId = button.getAttribute("data-target");
      console.log("Target section ID:", targetId); // 클릭된 섹션 ID 확인
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
        console.log("Showing section:", targetId); // 섹션 표시 확인용

        // Sigma.js 컨테이너 크기 재계산 (if needed)
        const iframe = targetSection.querySelector("iframe");
        if (iframe) {
          iframe.contentWindow.dispatchEvent(new Event("resize"));
        }
      }
    });

    // 마우스 오버 시 색상 변경
    button.addEventListener("mouseover", () => {
      console.log("Mouse over on button:", button); // 마우스 오버 확인용
      button.style.backgroundColor = "#8FBFC9"; // hover 시 색상 변경
    });

    // 마우스 아웃 시 색상 복원
    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#EBEFB2"; // 원래 색상으로 복원
    });
  });
});
