// ----------------------------------------------------
// 마우스를 올리면 한글 → 영문으로 바뀌는 효과 (모든 페이지 공통)
// ----------------------------------------------------
// 아래 사전(KO_EN)에 있는 한글 글자를 찾아 <span class="ko-en" data-en="영문">한글</span>로 감싼다.
// 영문은 CSS(::after)로만 그려서, 다른 스크립트가 읽는 innerText/textContent는 그대로 한글이다.
// 메뉴바(navbar.html)처럼 나중에 불러오는 내용도 자동으로 찾아 적용한다.
// 새 글자를 바꾸고 싶으면 사전에 "한글": "English" 한 줄만 추가하면 된다.
(() => {
    const KO_EN = {
        // 메뉴 (위쪽 메뉴는 한글과 폭이 비슷한 짧은 영어로 → 메뉴가 넓어지지 않게)
        "그랑프리": "GP", "일정/결과": "Schedule / Results", "서킷 가이드": "Circuit Guide",
        "서킷 지도": "Circuit Map", "하이라이트": "Highlights", "티켓 정보": "Tickets",
        "순위/데이터": "Standings", "드라이버 순위": "Driver Standings", "팀 순위": "Team Standings",
        "통계 대시보드": "Stats Dashboard", "역대 기록": "History",
        "드라이버/팀": "Drivers", "드라이버 목록": "Drivers", "팀 목록": "Teams",
        "뉴스/분석": "News", "최신 소식": "Latest", "테크 토크": "Tech Talk",
        "칼럼/블로그": "Column / Blog", "영상 뉴스": "Video News",
        "F1 굿즈 샵": "F1 Store", "공식 굿즈": "Official Store", "팀 상품": "Team Goods",
        "드라이버 컬렉션": "Driver Collection", "한정판/세일": "Limited / Sale", "한정판 / 세일": "Limited / Sale",
        "사이트 소개": "About", "제작자 소개": "Creator",
        "로그인": "Login", "로그아웃": "Logout", "회원가입": "Sign Up", "검색": "Search",
        "내 대시보드": "My Dashboard",

        // 제작자 소개 (about.html)
        "황 휘": "Hwang Hwi", "생년월일": "Birth", "전화번호": "Phone", "이메일": "Email", "거주지": "Address",
        "연락처": "Contact", "학력 사항": "Education", "병역 사항": "Military Service", "자격증": "Certificates",
        "장안대학교": "Jangan University", "서울미디어콘텐츠고등학교": "Seoul Media Contents High School",
        "해병대 중사 만기 전역": "ROK Marine Corps, Staff Sgt. (Discharged)",
        "화학분석기능사": "Chemical Analysis Craftsman", "문서실무사 4급": "Document Specialist Lv.4",
        "GTQ 2급": "GTQ Level 2",
        "메일 보내기": "Send Mail", "주소 복사": "Copy", "전화 걸기": "Call", "문자 보내기": "Text",

        // 서킷 · 일정
        "서킷 특징": "Circuit Features", "지도에서 보기": "View on Map", "전체 보기": "View All",
        "구글 지도에서 열기 ↗": "Open in Google Maps ↗", "다음 그랑프리": "Next Grand Prix",
        "다가오는 경기": "Upcoming", "경기 예정": "Scheduled", "전체 일정 보기": "Full Schedule",

        // 순위 · 통계 · 드라이버 · 팀
        "시즌 순위": "Season Rank", "시즌 획득 포인트": "Season Points", "시즌 우승 횟수": "Season Wins",
        "시즌 포디움": "Season Podiums", "커리어 통계": "Career Stats", "커리어 누적 포인트": "Career Points",
        "그랑프리 출전 횟수": "Grand Prix Entered", "그랑프리 우승": "Grand Prix Wins",
        "그랑프리 포디움": "Grand Prix Podiums", "총 포디움 횟수": "Total Podiums",
        "최고 레이스 순위": "Best Finish", "폴 포지션": "Pole Positions",
        "월드 챔피언십 우승": "World Championships", "월드 챔피언십 달성": "World Championships",
        "드라이버 챔피언십": "Drivers' Championship", "컨스트럭터 챔피언십": "Constructors' Championship",
        "드라이버 순위 TOP 5": "Driver Standings TOP 5", "팀 순위 TOP 5": "Team Standings TOP 5",
        "전체 순위 보기": "Full Standings", "드라이버 포인트": "Driver Points", "팀 포인트": "Team Points",
        "팀 누적 포인트": "Team Total Points", "획득 포인트": "Points", "레이스 우승 비율": "Win Rate",
        "현재 1위 팀": "Current Leader", "팀 상세 정보": "Team Details", "팀 요약 (역대 통계)": "Team Summary (All Time)",
        "순위 & 통계 분석": "Standings & Stats", "현재 시즌 데이터 시각화 분석": "Season Data Visualization",
        "역대 포뮬러 1 월드 챔피언 기록": "Formula 1 World Champions",
        "역대 월드 챔피언 (15년전까지)": "World Champions (Last 15 Years)",
        "실시간 데이터": "Live Data", "대체 출전 드라이버": "Substitute Drivers", "대체 출전": "Substitute", "해당 시즌": "Season", "모터스포츠": "Motorsport",

        // 뉴스 · 하이라이트
        "최신 뉴스": "Latest News", "최신 업로드": "Latest Uploads", "뉴스": "News", "분석": "Analysis",
        "블로그": "Blog", "소식": "News", "토크": "Talk", "더보기 +": "More +", "다운로드": "Download",
        "Formula 1 공식 채널": "Formula 1 Official Channel",

        // 대시보드 · 로그인 · 샵
        "대시보드 보기": "View Dashboard", "나의 활동 통계": "My Activity", "총 로그인 횟수": "Total Logins",
        "작성한 댓글": "Comments", "추가한 즐겨찾기": "Favorites", "즐겨찾기 관리": "Manage Favorites",
        "알림 설정": "Notifications", "캘린더 동기화": "Calendar Sync", "Google 캘린더 연동": "Google Calendar",
        "연동하기": "Connect", "변경사항 저장": "Save Changes",
        "🏁 그랑프리 시작 1시간 전 알림": "🏁 Alert 1 hour before the Grand Prix",
        "🎟️ 티켓 오픈 임박 알림": "🎟️ Ticket opening alert",
        "비밀번호": "Password", "비밀번호 확인": "Confirm Password", "비밀번호 찾기": "Find Password",
        "아이디 찾기": "Find ID", "아이디 (이메일)": "ID (Email)", "아이디 기억하기": "Remember ID",
        "성함": "Name", "가입하신 성함": "Registered Name", "가입하신 전화번호": "Registered Phone",
        "성별": "Gender", "남성": "Male", "여성": "Female", "중복확인": "Check",
        "로그인으로 돌아가기": "Back to Login", "로그인으로": "To Login",
        "상세 설명": "Description", "사이즈 선택 (EU 기준)": "Select Size (EU)",
        "공식 굿즈 연동": "Official Store", "Fuel For Fans에서 구매하기": "Buy at Fuel For Fans"
    };

    // 영문으로 바꿀 수 있는 태그 (입력칸·스크립트 안 글자는 건드리지 않음)
    const HOST_SELECTOR = 'a, button, h1, h2, h3, h4, h5, h6, label, small, strong, span, th, td, li, p, div';
    const SKIP_PARENT = 'script, style, textarea, select, option, .ko-en';

    const normalize = (t) => t.replace(/\s+/g, ' ').trim();

    function wrapTextNode(node) {
        const text = normalize(node.nodeValue);
        const en = KO_EN[text];
        if (!en) return;
        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP_PARENT) || !parent.matches(HOST_SELECTOR)) return;

        const wrap = document.createElement('span');
        wrap.className = 'ko-en';
        wrap.dataset.en = en;
        const ko = document.createElement('span');
        ko.className = 'ko-en-ko';
        ko.textContent = text;
        wrap.appendChild(ko);

        // 앞뒤 띄어쓰기는 원래대로 유지 (아이콘과 글자 사이 간격)
        const lead = /^\s/.test(node.nodeValue) ? ' ' : '';
        const trail = /\s$/.test(node.nodeValue) ? ' ' : '';
        const frag = document.createDocumentFragment();
        if (lead) frag.append(lead);
        frag.append(wrap);
        if (trail) frag.append(trail);
        node.replaceWith(frag);

        // 링크·버튼 안이면 그 링크·버튼 어디에 올려도 바뀌게
        (parent.closest('a, button, label, .dropdown-item') || parent).classList.add('ko-en-host');
    }

    function apply(root) {
        if (root.nodeType === Node.TEXT_NODE) { wrapTextNode(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(SKIP_PARENT)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => /[가-힣]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(wrapTextNode);
    }

    function start() {
        apply(document.body);
        // 메뉴바·API 결과처럼 나중에 그려지는 내용도 적용
        new MutationObserver((mutations) => {
            mutations.forEach(m => m.addedNodes.forEach(apply));
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
