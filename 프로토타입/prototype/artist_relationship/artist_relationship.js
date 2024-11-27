document.addEventListener("DOMContentLoaded", () => {
    // 모든 버튼을 가져옵니다.
    const buttons = document.querySelectorAll(".action-button");
    // iframe 요소를 가져옵니다.
    const iframe = document.getElementById("graph-iframe");
  
    // 각 버튼에 클릭 이벤트 추가
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault(); // 기본 동작(페이지 이동) 방지
  
        const newSrc = button.getAttribute("data-src"); // data-src 값 읽기
  
        console.log("Changing iframe src to:", newSrc); // 디버깅용 로그
        iframe.src = newSrc; // iframe의 src 속성 변경
      });
    });
  });
  