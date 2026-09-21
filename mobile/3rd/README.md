# 포트폴리오 웹사이트 사용 가이드

## 📋 목차
1. [시작하기](#시작하기)
2. [콘텐츠 수정하기](#콘텐츠-수정하기)
3. [디자인 커스터마이징](#디자인-커스터마이징)
4. [반응형 확인](#반응형-확인)
5. [배포하기](#배포하기)

---

## 🚀 시작하기

### 파일 구조
```
mobile/3rd/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── script.js       # JavaScript 파일
├── images/             # 이미지 폴더
│   └── README.md       # 이미지 가이드
└── README.md           # 이 파일
```

### 브라우저에서 열기
1. `index.html` 파일을 더블클릭하거나
2. 브라우저로 드래그 앤 드롭

---

## ✏️ 콘텐츠 수정하기

### 1. 개인 정보 수정 (index.html)

#### Hero 섹션 (라인 33-45)
```html
<h1 class="hero-title">안녕하세요,<br><span class="highlight">홍길동</span>입니다</h1>
<p class="hero-subtitle">Full Stack Developer | UI/UX Enthusiast</p>
<p class="hero-description">
    사용자 중심의 웹 애플리케이션을 개발하고,
    최신 기술을 활용하여 혁신적인 솔루션을 제공합니다.
</p>
```
👉 이름, 직함, 소개 문구를 수정하세요.

#### About 섹션 (라인 63-82)
```html
<h3>저를 소개합니다</h3>
<p>
    5년 이상의 경력을 가진 풀스택 개발자로...
</p>
```
👉 자기소개 내용을 수정하세요.

#### 통계 수치 수정 (라인 83-96)
```html
<span class="stat-number">5+</span>
<span class="stat-label">Years Experience</span>
```
👉 경력, 프로젝트 수, 클라이언트 수를 수정하세요.

---

### 2. 기술 스택 수정 (index.html)

#### 스킬 바 수정 (라인 110-185)
```html
<div class="skill-item">
    <div class="skill-header">
        <span class="skill-name">HTML/CSS</span>
        <span class="skill-percentage">95%</span>
    </div>
    <div class="skill-bar">
        <div class="skill-progress" style="width: 95%"></div>
    </div>
</div>
```
👉 기술 이름과 숙련도(%)를 수정하세요.

#### 기술 스택 표 수정 (라인 195-228)
```html
<tr>
    <td>Frontend</td>
    <td>React, Vue.js, TypeScript</td>
    <td><span class="badge badge-expert">Expert</span></td>
    <td>5년</td>
</tr>
```
👉 카테고리, 기술, 숙련도, 경험 기간을 수정하세요.

**숙련도 배지 종류:**
- `badge-expert` (전문가 - 녹색)
- `badge-advanced` (상급 - 파란색)
- `badge-intermediate` (중급 - 노란색)

---

### 3. 프로젝트 수정 (index.html)

#### 프로젝트 카드 (라인 235-270)
```html
<div class="project-card">
    <div class="project-image">
        <img src="images/project1.jpg" alt="Project 1">
        <div class="project-overlay">
            <a href="#" class="project-link">View Details</a>
        </div>
    </div>
    <div class="project-content">
        <h3 class="project-title">E-Commerce Platform</h3>
        <p class="project-description">
            React와 Node.js를 활용한 풀스택 이커머스 플랫폼.
        </p>
        <div class="project-tags">
            <span class="tag">React</span>
            <span class="tag">Node.js</span>
            <span class="tag">MongoDB</span>
        </div>
    </div>
</div>
```
👉 프로젝트 제목, 설명, 기술 태그를 수정하세요.
👉 `images/` 폴더에 프로젝트 이미지를 추가하세요.

---

### 4. 경력 및 교육 수정 (index.html)

#### 타임라인 항목 (라인 339-369)
```html
<div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
        <span class="timeline-date">2021 - Present</span>
        <h3 class="timeline-title">Senior Full Stack Developer</h3>
        <h4 class="timeline-company">Tech Company Inc.</h4>
        <p class="timeline-description">
            웹 애플리케이션 아키텍처 설계 및 개발 리드.
        </p>
        <ul class="timeline-achievements">
            <li>팀 생산성 30% 향상</li>
            <li>코드 리뷰 프로세스 개선</li>
        </ul>
    </div>
</div>
```
👉 날짜, 직책, 회사명, 업무 내용, 성과를 수정하세요.

---

### 5. 연락처 정보 수정 (index.html)

#### Contact 섹션 (라인 432-484)
```html
<div class="contact-text">
    <h4>Email</h4>
    <p>your.email@example.com</p>
</div>
```
👉 이메일, 전화번호, 위치, 소셜 링크를 수정하세요.

---

## 🎨 디자인 커스터마이징

### 색상 변경 (css/style.css)

#### 메인 색상 변경 (라인 10-21)
```css
:root {
    --primary-color: #2563eb;      /* 메인 색상 */
    --secondary-color: #1e40af;    /* 보조 색상 */
    --accent-color: #3b82f6;       /* 강조 색상 */
    --dark-color: #1e293b;         /* 다크 색상 */
    --light-color: #f8fafc;        /* 밝은 배경 */
}
```
👉 원하는 색상 코드로 변경하세요.

**추천 색상 팔레트:**
- 파란색: `#2563eb` (현재)
- 보라색: `#8b5cf6`
- 초록색: `#10b981`
- 빨간색: `#ef4444`
- 주황색: `#f97316`

### 폰트 변경 (index.html)

#### Google Fonts 링크 (라인 8-9)
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
👉 [Google Fonts](https://fonts.google.com/)에서 원하는 폰트를 선택하세요.

---

## 📱 반응형 확인

### 브레이크포인트
- **PC (Desktop)**: 1024px 이상
- **태블릿 (Tablet)**: 768px ~ 1024px
- **모바일 (Mobile)**: 768px 이하
- **작은 모바일**: 480px 이하

### 테스트 방법

#### 1. Chrome DevTools
1. F12 키를 눌러 개발자 도구 열기
2. Ctrl + Shift + M (윈도우) 또는 Cmd + Shift + M (맥)
3. 다양한 디바이스 크기로 테스트

#### 2. 반응형 디자인 체크리스트
- [ ] 모바일에서 햄버거 메뉴가 잘 작동하는가?
- [ ] 텍스트가 작은 화면에서도 읽기 쉬운가?
- [ ] 이미지가 화면 크기에 맞게 조절되는가?
- [ ] 버튼과 링크를 터치하기 쉬운가?
- [ ] 표가 작은 화면에서 스크롤되는가?

---

## 🌐 배포하기

### 1. GitHub Pages (무료, 추천)

```bash
# 1. GitHub 저장소 생성
# 2. 코드 푸시
git add .
git commit -m "포트폴리오 사이트 추가"
git push origin main

# 3. GitHub 저장소 설정
# Settings > Pages > Source: main branch
```

### 2. Netlify (무료)
1. [Netlify](https://www.netlify.com/) 접속
2. "New site from Git" 선택
3. GitHub 연동 후 배포

### 3. Vercel (무료)
1. [Vercel](https://vercel.com/) 접속
2. "Import Project" 선택
3. GitHub 연동 후 배포

---

## 💡 추가 기능 아이디어

### 1. 다크 모드
`js/script.js` 파일 하단의 주석을 해제하세요 (라인 215-237).

### 2. 애니메이션 라이브러리
- [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- [GSAP](https://greensock.com/gsap/)

### 3. 연락 폼 백엔드
- [Formspree](https://formspree.io/)
- [EmailJS](https://www.emailjs.com/)
- [Netlify Forms](https://www.netlify.com/products/forms/)

### 4. 블로그 통합
- [Medium](https://medium.com/)
- [Dev.to](https://dev.to/)
- [Gatsby](https://www.gatsbyjs.com/)

---

## 🐛 문제 해결

### 이미지가 표시되지 않아요
- `images/` 폴더에 이미지 파일이 있는지 확인
- 파일 이름이 HTML의 경로와 일치하는지 확인
- 이미지 파일 확장자가 올바른지 확인 (jpg, png, webp)

### 모바일 메뉴가 작동하지 않아요
- `js/script.js` 파일이 올바르게 연결되었는지 확인
- 브라우저 콘솔(F12)에서 에러 메시지 확인

### 스타일이 적용되지 않아요
- `css/style.css` 파일 경로 확인
- 캐시 삭제 후 새로고침 (Ctrl + F5)

### 폼 제출이 작동하지 않아요
- 현재는 알림창만 표시되는 데모 버전입니다
- 실제 이메일 전송을 위해서는 백엔드 서비스 연동 필요

---

## 📞 도움이 필요하신가요?

- HTML/CSS/JavaScript 기초: [MDN Web Docs](https://developer.mozilla.org/)
- 반응형 디자인: [CSS-Tricks](https://css-tricks.com/)
- 웹 접근성: [WCAG 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] 모든 개인 정보를 실제 정보로 수정했나요?
- [ ] 모든 이미지를 추가했나요?
- [ ] PC, 태블릿, 모바일에서 테스트했나요?
- [ ] 모든 링크가 올바르게 작동하나요?
- [ ] 오타나 문법 오류가 없나요?
- [ ] 브라우저 콘솔에 에러가 없나요?

---

**제작일**: 2024년
**버전**: 1.0
**라이선스**: MIT

포트폴리오 제작에 행운을 빕니다! 🚀
