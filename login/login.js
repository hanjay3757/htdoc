/**
 * JWT 로그인 시스템 - 클라이언트 사이드 JavaScript
 */

// DOM이 완전히 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조 가져오기
  const id = document.querySelector("#id"); // 아이디 입력 필드
  const pw = document.querySelector("#pw"); // 비밀번호 입력 필드
  const btn = document.querySelector("#login_btn"); // 로그인 버튼

  // 로그인 버튼 클릭 이벤트 리스너 등록
  btn.addEventListener("click", async (e) => {
    e.preventDefault();


    // 1. 빈 값 체크
    if (id.value == "" || pw.value == "") {
      alert("아이디와 비밀번호를 입력해주세요.");
      id.focus(); // 아이디 필드에 포커스 이동
      return false;
    }

    // 2. 최소 길이 체크 (4자 이상)
    if (id.value.length < 4 || pw.value.length < 4) {
      alert("아이디와 비밀번호는 4자 이상 입력해주세요.");
      id.focus();
      return false;
    }

    // ===== AJAX 로그인 요청 =====

    try {
      // fetch API를 사용한 비동기 HTTP 요청
      const res = await fetch("login_ok.php", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          id: id.value, // 아이디
          pw: pw.value, // 비밀번호
        }),
      });

      // 서버 응답을 JSON 형태로 파싱
      const data = await res.json();

      // ===== 로그인 성공 처리 =====
      if (res.ok && data.token) {

        localStorage.setItem("jwt", data.token);

        document.cookie = "jwt=" + data.token + "; path=/";

        alert("JWT 로그인 성공!");

        window.location.href = "member.php";
      } else {
        // ===== 로그인 실패 처리 =====
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      // ===== 네트워크 오류 처리 =====
      console.error("로그인 요청 오류:", err);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  });
});
