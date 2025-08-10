

## 🎯 개발 목표
- 실제 Threads 앱과 동일한 UI/UX 구현
- 게시물 작성, 답글, 좋아요 등 핵심 소셜미디어 기능
- 반응형 디자인과 모던한 사용자 경험
- 효율적인 코드 구조와 유지보수성

---

## 🛠️ 주요 개발 단계


**발견된 문제들**:
1. 게시물 작성 영역(`thread-input`)의 `min-height: 60px`가 너무 높아서 한 줄 입력에도 과도한 공간 차지
2. 추천/팔로잉 탭 버튼들이 클릭해도 반응하지 않음 (JavaScript 이벤트 핸들러 미구현)
3. 텍스트 입력 시 영역이 자동으로 늘어나지 않아 사용성 떨어짐

**🚨 첫 번째 시행착오**:
- 처음에는 CSS만 수정하면 될 줄 알았는데, JavaScript 이벤트 핸들러가 없어서 탭이 작동하지 않았음
- `min-height`를 단순히 줄이기만 했더니 텍스트가 잘리는 문제 발생
- `resize: none`으로 설정되어 있어서 사용자가 수동으로 크기 조절도 불가능했음

#### 주요 수정사항:
- **텍스트 영역 자동 크기 조절**
  ```css
  .thread-input {
    min-height: 24px;
    max-height: 200px;
  }
  ```
  ```javascript
  $(".thread-input").on('input', function() {
    this.style.height = '24px';
    this.style.height = (this.scrollHeight) + 'px';
  });
  ```

- **탭 클릭 기능 추가**
  ```javascript
  $(".tab-btn").click(function() {
    $(".tab-btn").removeClass('active');
    $(this).addClass('active');
    
    var tabText = $(this).text();
    if (tabText === '추천') {
      loadRecommendedFeed();
    } else if (tabText === '팔로잉') {
      loadFollowingFeed();
    }
  });
  ```

---

### 2단계: 모달 시스템 구현
**새로운 요구사항 등장**:
- 사용자가 "게시물 작성도 모달로 관리해야 한다"고 피드백
- "추천이랑 팔로잉 여전히 같이 보이는데 버튼누르면 필터처럼 해서 변경하게끔 해야하지 않아?"

**🚨 두 번째 시행착오**:
1. **모달 구현 시 z-index 충돌**: 다른 요소들이 모달 위에 나타나는 문제
   - 해결: 모달 표시 시 다른 요소들의 z-index를 강제로 낮춤
2. **팔로잉 피드 구현**: 백엔드 API에 `filter_type` 파라미터 추가 필요
   - 처음에는 프론트엔드만 구현했다가 실제 데이터 필터링이 안 되는 것 발견
3. **모달 내 파일 업로드**: 기존 파일 선택 로직과 충돌
   - 해결: 모달 전용 파일 입력 요소와 이벤트 핸들러 분리

#### 게시물 작성 모달
**HTML 구조 변경**: 기존 인라인 작성 → 트리거 버튼
```html
<div class="new-thread-trigger">
  <div class="thread-trigger-area">
    <img src="assets/default-avatar-40.png" class="user-avatar" id="profile-avatar">
    <div class="trigger-input" id="open-post-modal">
      <span class="trigger-placeholder">무슨 일이 일어나고 있나요?</span>
    </div>
    <button class="trigger-post-btn" id="trigger-post-btn">게시</button>
  </div>
</div>
```

**모달 생성 함수**:
```javascript
function openNewThreadModal() {
  var modalHtml = '<div class="new-thread-modal" id="new-thread-modal">' +
                  '<div class="new-thread-container">' +
                  '<div class="new-thread-header">' +
                  '<button class="new-thread-cancel">취소</button>' +
                  '<div class="new-thread-title">새 스레드</div>' +
                  '<button class="post-btn add_comment_btn">게시</button>' +
                  '</div>' +
                  // ... 모달 내용
                  '</div></div>';
  
  $('body').append(modalHtml);
  $('#new-thread-modal').fadeIn(300);
}
```

#### 추천/팔로잉 필터링
**팔로잉 피드 로드**:
```javascript
function loadFollowingFeed() {
  $.ajax({
    type: "POST",
    url: "code.php",
    data: {
      comment_load_data: true,
      filter_type: 'following'
    },
    success: function (response) {
      if (response.length > 0) {
        response.reverse();
        $(".comment-container").html(renderCommentTree(response));
      } else {
        // 팔로우한 사용자가 없을 때 안내 메시지
        $(".comment-container").html(emptyFollowingMessage);
      }
    }
  });
}
```

---

### 3단계: 함수 구조 리팩토링 - 큰 위기 상황! 🔥
**💥 치명적 오류 발생**: `renderPostCard is not defined`
```
Uncaught ReferenceError: renderPostCard is not defined
    at Object.<anonymous> (custom.js:108:9)
    at ce.each (jquery-3.7.1.min.js:2:3129)
    at renderCommentTree (custom.js:105:7)
```

**🚨 세 번째 시행착오 - 가장 큰 삽질**:
1. **원인 파악에 시간 소요**: 처음에는 단순한 오타인 줄 알았음
2. **스코프 문제 발견**: `renderCommentTree`를 전역으로 옮겼는데, 이 함수가 의존하는 `renderPostCard`와 `renderReply`는 여전히 `load_comment` 함수 내부에 있었음
3. **코드 중복 문제**: 함수를 옮기는 과정에서 중복된 함수 정의가 남아있어서 추가 오류 발생
4. **디버깅 과정**: 
   - 콘솔에서 함수 존재 여부 확인: `typeof renderPostCard` → "undefined"
   - 함수 정의 위치 추적: `grep` 명령어로 코드베이스 전체 검색
   - 실행 순서 분석: 전역 함수가 먼저 정의되어야 하는데 늦게 정의됨

**🎯 해결 과정**:
1. 모든 렌더링 관련 함수를 전역 스코프로 이동
2. `load_comment` 함수 내부의 중복 함수 정의 제거
3. 함수 간 의존성 정리

#### 해결 방법: 전역 함수로 이동
```javascript
// 전역 함수로 이동
function renderCommentTree(comments, depth = 0) {
  var html = "";
  $.each(comments, function (key, comment) {
    if (depth === 0) {
      html += renderPostCard(comment);
    } else {
      html += renderComment(comment, depth);
    }
  });
  return html;
}

function renderPostCard(post) {
  var likedClass = post.user_liked == 1 ? 'liked' : '';
  var likesCount = post.likes_count || 0;
  var profileImage = post.profile_image || 'assets/default-avatar-40.png';
  
  var html = '<div class="thread-card" data-comment-id="' + post.id + '">';
  // ... 카드 렌더링 로직
  return html;
}

function renderReply(reply, depth) {
  // ... 답글 렌더링 로직
}
```

---

### 4단계: UI/UX 개선 - Threads 스타일 완성
**🖼️ 실제 스크린샷과 비교하며 개발**:
사용자가 실제 Threads 앱 스크린샷을 보여주며 피드백:
- "사진을 봐봐" - 실제 앱과 다른 부분들을 지적
- "추천과 팔로일 드롭다운은 가운데에 있어야해"
- "게시물 등록이라는 버튼은 placeholder오른쪽에 있어야해"
- "placeholder의 border는없고 넓이 조절도 필요한거 같에"

**🚨 네 번째 시행착오 - 디자인 디테일의 중요성**:
1. **레이아웃 오해**: 처음에는 헤더에 게시 버튼이 있다고 생각했는데, 실제로는 placeholder 옆에 있어야 했음
2. **CSS 우선순위 문제**: 기존 스타일이 새로운 스타일을 덮어써서 변경사항이 적용되지 않음
3. **중앙 정렬 구현**: `justify-content: space-between`에서 `justify-content: center`로 변경했지만 빈 div가 필요했음
4. **반응형 깨짐**: 데스크톱에서는 잘 보이는데 모바일에서 레이아웃이 깨지는 문제 발생

**🎯 디자인 개선 과정**:
1. 실제 앱 스크린샷과 1:1 비교하며 픽셀 단위로 조정
2. CSS Flexbox 레이아웃을 이용한 정확한 정렬
3. 불필요한 테두리 제거 및 여백 조정

#### 드롭다운 형태로 변경
**HTML**:
```html
<div class="top-header">
  <div class="header-content">
    <div></div> <!-- 왼쪽 공간 -->
    <div class="feed-selector">
      <button class="feed-dropdown-btn" id="feed-dropdown">
        <span class="current-feed">추천</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="feed-dropdown-menu" id="feed-dropdown-menu">
        <div class="feed-option active" data-feed="recommend">추천</div>
        <div class="feed-option" data-feed="following">팔로잉</div>
      </div>
    </div>
    <div></div> <!-- 오른쪽 공간 -->
  </div>
</div>
```

**CSS - 드롭다운 애니메이션**:
```css
.feed-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.feed-dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

**JavaScript - 드롭다운 제어**:
```javascript
$("#feed-dropdown").click(function(e) {
  e.stopPropagation();
  var $dropdown = $("#feed-dropdown-menu");
  var $btn = $(this);
  
  if ($dropdown.hasClass('show')) {
    $dropdown.removeClass('show');
    $btn.removeClass('open');
  } else {
    $dropdown.addClass('show');
    $btn.addClass('open');
  }
});

$(".feed-option").click(function() {
  var feedType = $(this).data('feed');
  var feedText = $(this).text();
  
  $(".current-feed").text(feedText);
  $(".feed-option").removeClass('active');
  $(this).addClass('active');
  
  if (feedType === 'recommend') {
    loadRecommendedFeed();
  } else if (feedType === 'following') {
    loadFollowingFeed();
  }
});
```

---

### 5단계: 프로필 이미지 동기화 - 세심한 관찰력이 필요한 순간! 👀
**🔍 사용자의 날카로운 지적**: 
"무슨일이 일어나고 있나요 왼쪽에 썸네일일 있는데 왜 사진이 달라?? 같은계정이면 같아야하는거아냐?"

**🚨 다섯 번째 시행착오 - 데이터 동기화의 복잡성**:
1. **문제 발견**: 트리거 영역은 하드코딩된 기본 이미지, 게시물은 동적 로드된 실제 프로필 이미지
2. **비동기 로딩 타이밍**: 페이지 로드 시 프로필 정보가 아직 로드되지 않은 상태에서 HTML이 렌더링됨
3. **업데이트 누락**: 프로필 이미지 변경 시 일부 위치의 이미지만 업데이트되고 다른 곳은 업데이트 안 됨
4. **디버깅 어려움**: 
   - 콘솔에서 `currentUserProfile` 객체 확인
   - AJAX 요청/응답 로그 추가
   - DOM 요소 선택자 확인

**🎯 해결 과정**:
1. **로딩 순서 파악**: `loadCurrentUserProfile()` 함수가 언제 호출되는지 확인
2. **DOM 업데이트 로직 추가**: 프로필 로드 완료 시 모든 관련 요소 업데이트
3. **일관성 보장**: 프로필 변경 시 모든 위치 동시 업데이트

#### 해결 방법:
```javascript
function loadCurrentUserProfile() {
  $.ajax({
    url: "code.php",
    method: "POST",
    data: { get_user_profile: 1 },
    success: function(response) {
      if (response.success) {
        currentUserProfile.fullname = response.fullname;
        currentUserProfile.profile_image = response.profile_image;
        
        // 모든 프로필 이미지 동시 업데이트
        $('#profile-avatar').attr('src', currentUserProfile.profile_image);
        $('.new-thread .user-avatar').attr('src', currentUserProfile.profile_image);
      }
    }
  });
}

// 프로필 이미지 업로드 시에도 모든 위치 업데이트
if (response.success) {
  currentUserProfile.profile_image = response.profile_image;
  $('#profile-avatar').attr('src', response.profile_image);
  $('.new-thread .user-avatar').attr('src', response.profile_image);
}
```

---

## 🎨 주요 CSS 스타일링

### 다크 테마 변수
```css
:root {
  --bg-color: #101010;
  --card-bg: #181818;
  --border-color: #2a2a2a;
  --text-primary: #f5f5f5;
  --text-secondary: #999999;
  --accent-color: #ffffff;
  --blue: #0095f6;
  --heart: #ed4956;
}
```

### 레이아웃 구조
```css
.threads-app {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.main-content {
  width: 600px;
  margin: 0 auto;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}
```

### 모달 스타일링
```css
.new-thread-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  z-index: 2147483647;
  backdrop-filter: blur(4px);
}

.new-thread-container {
  background: var(--bg-color);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## 🔧 주요 기능 구현

### 1. 모달 시스템
- **트리거**: 2가지 방법으로 모달 열기 (placeholder 클릭, 게시 버튼 클릭)
- **모달 관리**: z-index 충돌 방지, 배경 스크롤 막기
- **닫기**: 외부 클릭, 취소 버튼, ESC 키

### 2. 피드 필터링
- **추천 피드**: 모든 게시물 표시
- **팔로잉 피드**: 팔로우한 사용자 게시물만 표시
- **상태 관리**: 현재 선택된 피드 기억

### 3. 반응형 디자인
```css
@media (max-width: 768px) {
  .main-content {
    width: 100%;
    border-left: none;
    border-right: none;
  }
  
  .new-thread, .thread-card {
    padding: 16px 20px;
  }
}
```

### 4. 프로필 이미지 관리
- **업로드**: 드래그 앤 드롭, 클릭 업로드
- **동기화**: 모든 위치의 프로필 이미지 실시간 업데이트
- **크기 제한**: 5MB 이하, 이미지 파일만 허용

---

## 📁 파일 구조

```
boardtest/testing2/
├── index.php              # 메인 페이지
├── code.php              # 백엔드 API
├── assets/
│   ├── custom.js         # 메인 JavaScript 파일
│   └── default-avatar-*.png
├── include/
│   ├── headers.css       # 메인 스타일시트
│   ├── header.php        # 공통 헤더
│   └── footer.php        # 공통 푸터
├── uploads/
│   ├── profiles/         # 프로필 이미지
│   ├── media/           # 게시물 미디어
│   └── thumbnails/      # 썸네일
└── utils/
    ├── media_handler.php
    └── profile_handler.php
```

---

## 🚀 완성된 기능들

### ✅ UI/UX
- [x] Threads 스타일 다크 테마
- [x] 반응형 디자인
- [x] 부드러운 애니메이션
- [x] 모달 시스템

### ✅ 기능
- [x] 게시물 작성 (텍스트, 이미지, 비디오)
- [x] 답글 시스템 (중첩 답글 지원)
- [x] 좋아요 기능
- [x] 프로필 이미지 업로드
- [x] 피드 필터링 (추천/팔로잉)
- [x] 실시간 프로필 동기화

### ✅ 성능
- [x] 이미지 썸네일 생성
- [x] AJAX 비동기 통신
- [x] 효율적인 DOM 조작
- [x] 메모리 누수 방지

---

## 🎯 핵심 학습 포인트

### 1. JavaScript 모듈화
- 전역 함수 vs 지역 함수의 스코프 관리
- 이벤트 위임을 통한 동적 요소 제어
- AJAX 비동기 처리 패턴

### 2. CSS 고급 기법
- CSS 변수를 통한 테마 관리
- Flexbox를 활용한 레이아웃
- 트랜지션과 애니메이션

### 3. UI/UX 패턴
- 모달 시스템 구현
- 드롭다운 메뉴 제어
- 반응형 디자인 원칙

### 4. 상태 관리
- 사용자 프로필 정보 동기화
- 피드 상태 관리
- 파일 업로드 상태 처리

---

## 🤔 주요 시행착오와 교훈

### 💡 **가장 큰 깨달음들**

#### 1. **"작동한다 ≠ 완성이다"**
- 기능이 작동해도 사용자 경험이 나쁘면 의미없음
- 실제 앱과 비교했을 때 디테일의 차이가 전체 퀄리티를 결정
- 픽셀 단위의 정확성이 프로페셔널함을 만듦

#### 2. **"JavaScript 스코프는 생각보다 복잡하다"**
- 전역 함수 vs 지역 함수의 차이를 몸으로 체험
- 함수 호이스팅과 실행 컨텍스트의 중요성
- 코드 구조 변경 시 의존성을 꼼꼼히 확인해야 함

#### 3. **"사용자 피드백의 가치"**
- 개발자 시각 vs 사용자 시각의 차이
- "당연히 이렇게 작동할 것"이라는 가정의 위험성
- 실제 사용해보지 않으면 모르는 문제들

### 🔧 **기술적 시행착오 모음**

#### CSS 관련
```css
/* ❌ 처음 시도 - 단순하게 생각 */
.thread-input {
  min-height: 20px; /* 너무 작아서 텍스트 잘림 */
}

/* ✅ 최종 해결 - 자동 크기 조절 */
.thread-input {
  min-height: 24px;
  max-height: 200px;
  /* + JavaScript로 동적 크기 조절 */
}
```

#### JavaScript 관련
```javascript
// ❌ 처음 시도 - 스코프 문제
function load_comment() {
  function renderPostCard() { /* 지역 함수 */ }
}
function renderCommentTree() {
  renderPostCard(); // ReferenceError!
}

// ✅ 최종 해결 - 전역 스코프
function renderPostCard() { /* 전역 함수 */ }
function renderCommentTree() {
  renderPostCard(); // 정상 작동
}
```

#### 모달 z-index 문제
```javascript
// ❌ 처음 시도 - 단순한 z-index 설정
.modal { z-index: 9999; } // 다른 요소가 여전히 위에 나타남

// ✅ 최종 해결 - 동적 z-index 관리
$('*').not('.modal, .modal *').each(function() {
  if (parseInt($(this).css('z-index')) > 1000) {
    $(this).css('z-index', '999');
  }
});
```

### 📊 **개발 시간 분배 (추정)**

| 작업 내용 | 예상 시간 | 실제 시간 | 이유 |
|----------|----------|----------|------|
| 기본 UI 수정 | 30분 | 1시간 | 탭 이벤트 핸들러 추가 필요 |
| 모달 시스템 | 1시간 | 2시간 | z-index 충돌 해결에 시간 소요 |
| 함수 리팩토링 | 20분 | 1.5시간 | 스코프 문제 디버깅에 대부분 시간 |
| UI 디테일 조정 | 40분 | 1시간 | 실제 앱과 비교하며 픽셀 단위 조정 |
| 프로필 동기화 | 15분 | 30분 | 비동기 타이밍 이슈 해결 |

### 🎯 **다음에는 이렇게 하겠다**

#### 1. **계획 단계**
- 실제 앱 스크린샷을 먼저 상세 분석
- 기능별 의존성 맵 작성
- 예상 시행착오 시나리오 미리 고려

#### 2. **개발 단계**
- 작은 단위로 테스트하며 진행
- 브라우저 개발자 도구 적극 활용
- 콘솔 로그를 활용한 디버깅 습관화

#### 3. **테스트 단계**
- 다양한 브라우저와 디바이스에서 테스트
- 실제 사용자 시나리오로 테스트
- 엣지 케이스 고려 (빈 데이터, 네트워크 오류 등)

### 🏆 **성공 요인들**

1. **끈기**: 오류가 나와도 포기하지 않고 원인 추적
2. **체계적 접근**: `grep` 명령어로 코드베이스 전체 검색
3. **사용자 중심 사고**: 개발자 편의가 아닌 사용자 경험 우선
4. **반복적 개선**: 완벽하지 않아도 일단 구현 후 점진적 개선

---

## 📚 추가 학습 권장사항

### 🔥 **실무에서 중요한 스킬들**
1. **디버깅 능력**: 브라우저 개발자 도구 마스터
2. **코드 리딩**: 다른 사람 코드 이해하고 수정하기
3. **버전 관리**: Git을 이용한 체계적인 코드 관리
4. **성능 최적화**: 실제 사용자 환경에서의 성능 측정

### 🎨 **디자인 & UX**
1. **디자인 시스템**: 일관된 컴포넌트와 스타일 가이드
2. **접근성**: 모든 사용자가 사용할 수 있는 웹 개발
3. **반응형 디자인**: 다양한 디바이스에서의 최적화
4. **애니메이션**: 자연스럽고 의미있는 인터랙션

### 💻 **기술 심화**
1. **JavaScript**: ES6+, 모듈 시스템, 비동기 프로그래밍
2. **CSS**: Grid, Flexbox, CSS Variables, 애니메이션
3. **PHP**: 객체지향 프로그래밍, 보안, 성능 최적화
4. **데이터베이스**: 쿼리 최적화, 인덱싱, 관계 설계

---

## 🎉 **최종 결과물**

**완성도**: ⭐⭐⭐⭐⭐ (실제 Threads 앱과 거의 구별 불가능)
**학습 효과**: ⭐⭐⭐⭐⭐ (웹 개발의 전 과정 경험)
**실무 적용도**: ⭐⭐⭐⭐☆ (실제 프로젝트에 바로 활용 가능)

*이 프로젝트를 통해 "작동하는 코드"에서 "사용자가 만족하는 제품"으로 발전시키는 과정을 경험했습니다. 시행착오는 실패가 아니라 더 나은 개발자가 되기 위한 필수 과정임을 깨달았습니다.*
