# 포트폴리오 아이디어 관리 시스템

아이디어를 추가/수정/삭제하고 자동으로 JSON 파일에 저장하는 시스템입니다.

## 🚀 사용 방법

### 1️⃣ 서버 모드 (자동 저장 - 추천)

**설치:**
```bash
cd mobile/3rd
npm install
```

**서버 실행:**
```bash
npm start
```

**브라우저에서 접속:**
```
http://localhost:3000/idea.html
```

**특징:**
- ✅ 아이디어 추가/수정/삭제 시 **자동으로 ideas.json 파일에 저장**
- ✅ "파일 저장" 버튼 클릭 불필요
- ✅ 서버 실행 중에만 작동

---

### 2️⃣ 파일 모드 (수동 저장)

서버 없이 HTML 파일을 직접 열어도 사용 가능합니다.

**브라우저에서 직접 열기:**
```bash
open idea.html
# 또는 파일을 더블클릭
```

**특징:**
- ⚠️ 아이디어 변경 후 **"파일 저장" 버튼을 수동으로 클릭**해야 함
- ⚠️ 다운로드된 ideas.json 파일을 프로젝트 폴더에 수동으로 복사
- ✅ 서버 없이 사용 가능

---

## 📂 파일 구조

```
mobile/3rd/
├── idea.html           # 아이디어 관리 페이지
├── ideas.json          # 아이디어 데이터 (자동 생성/업데이트)
├── server.js           # Node.js 서버
├── package.json        # Node.js 의존성
├── mportfolio.css      # 스타일시트
└── js/
    └── script.js       # JavaScript
```

## 🔄 GitHub 워크플로우

### 서버 모드 사용 시:

```bash
# 1. 서버 실행
npm start

# 2. 브라우저에서 http://localhost:3000/idea.html 접속

# 3. 아이디어 추가/수정/삭제 (자동 저장됨)

# 4. Git 커밋
git add mobile/3rd/ideas.json
git commit -m "아이디어 업데이트"
git push

# 5. 다른 컴퓨터에서
git pull
npm start
# 브라우저에서 접속 → 최신 아이디어 확인!
```

## 💡 주요 기능

✅ 아이디어 추가/수정/삭제  
✅ 삭제된 번호 자동 재사용  
✅ 카테고리별 필터링  
✅ 정렬 (최신순, 오래된순, 우선순위)  
✅ **서버 모드: 자동 저장** 🆕  
✅ **파일 모드: 수동 저장 (서버 불필요)**  
✅ 반응형 디자인  

## 🛠️ 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Data**: JSON 파일

## 📝 ideas.json 형식

```json
[
  {
    "id": 1,
    "title": "프로젝트 제목",
    "category": "웹 개발",
    "priority": "높음",
    "description": "상세 설명",
    "date": "2024-03-20"
  }
]
```

## 🔧 문제 해결

### 서버가 시작되지 않는 경우:
```bash
# Node.js 설치 확인
node --version

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 포트 3000이 이미 사용 중인 경우:
`server.js` 파일에서 포트 변경:
```javascript
const PORT = 3001; // 다른 포트로 변경
```

## 🎯 모드 선택 가이드

| 기능 | 서버 모드 | 파일 모드 |
|------|-----------|-----------|
| 자동 저장 | ✅ | ❌ |
| 서버 필요 | ✅ | ❌ |
| GitHub 호환 | ✅ | ✅ |
| 사용 편의성 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**추천**: 개발 중에는 **서버 모드**, 서버 실행이 어려운 환경에서는 **파일 모드**

---

Made with ❤️ for Portfolio Management
