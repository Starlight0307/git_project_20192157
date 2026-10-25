// ----------------------------------------------------
// 서브 페이지: 실시간 뉴스 및 분석 (news.js)
// ----------------------------------------------------

// 뉴스는 data/news.json에서 읽는다 (loadNewsData — common.js). 탭마다 출처가 다르다:
//   최신 소식 = Motorsport.com · 경기 리포트 = 위키백과 그랑프리 문서(전문 번역, CC BY-SA)
//   테크 토크 = The Race · 칼럼 = RaceFans 'Comment' · 영상 = F1 공식 유튜브
const loadedTabs = {};

document.addEventListener('DOMContentLoaded', () => {
    
    const updateNavbarHighlight = (currentHash) => {
        const topNavLinks = document.querySelectorAll('#navbar-placeholder .nav-link, #navbar-placeholder .dropdown-item');
        topNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentHash)) {
                link.style.color = '#e10600';
                link.style.fontWeight = '900';
            } else {
                link.style.color = '';
                link.style.fontWeight = '';
            }
        });
    };

    const loadCurrentTab = (hash) => {
        const targetHash = hash || '#latest';
        const containerId = targetHash.replace('#', '') + '-news-container';
        const badgeName = document.querySelector(`button[data-bs-target="${targetHash}"]`).innerText;
        const isVideo = (targetHash === '#video');

        if (loadedTabs[targetHash]) return;

        loadedTabs[targetHash] = true;
        renderNewsTab(targetHash.replace('#', ''), containerId, badgeName, isVideo);
    };

    const initialHash = window.location.hash || '#latest';
    setTimeout(() => {
        updateNavbarHighlight(initialHash);
        const triggerEl = document.querySelector(`button[data-bs-target="${initialHash}"]`);
        if (triggerEl) {
            const tab = new bootstrap.Tab(triggerEl);
            tab.show();
            updateHeroText(initialHash);
            loadCurrentTab(initialHash); 
        }
    }, 600);

    const tabButtons = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabButtons.forEach(btn => {
        btn.addEventListener('shown.bs.tab', function (event) {
            const targetId = event.target.getAttribute('data-bs-target');
            updateHeroText(targetId);
            window.history.pushState(null, null, targetId);
            updateNavbarHighlight(targetId);
            loadCurrentTab(targetId); 
        });
    });

    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash;
        if (newHash) {
            updateNavbarHighlight(newHash);
            const triggerEl = document.querySelector(`button[data-bs-target="${newHash}"]`);
            if (triggerEl) {
                const tab = new bootstrap.Tab(triggerEl);
                tab.show();
                updateHeroText(newHash);
                loadCurrentTab(newHash);
            }
        }
    });
});

function updateHeroText(targetId) {
    const title = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    const textMap = {
        '#latest': ['최신 <span class="text-danger">소식</span>', 'Motorsport.com의 실시간 F1 소식입니다.'],
        '#report': ['경기 <span class="text-danger">리포트</span>', '위키백과 그랑프리 문서를 한국어로 옮긴 경기 리포트 전문입니다.'],
        '#tech': ['테크 <span class="text-danger">토크</span>', 'The Race의 심층 분석과 기술 이야기를 전해드립니다.'],
        '#column': ['칼럼 / <span class="text-danger">블로그</span>', 'RaceFans 칼럼이 전하는 패독 안팎의 깊은 시선.'],
        '#video': ['영상 <span class="text-danger">뉴스</span>', 'F1 공식 채널의 최신 비디오를 시청하세요.']
    };
    if (textMap[targetId]) {
        title.innerHTML = textMap[targetId][0];
        subtitle.innerText = textMap[targetId][1];
    }
}

async function renderNewsTab(key, containerId, badgeText, isVideo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let tab;
    try {
        const data = await loadNewsData();
        tab = data.tabs[key];
        if (!tab || !tab.items || tab.items.length === 0) throw new Error("기사 없음");
        tab.updated = data.updated;
    } catch (error) {
        loadedTabs['#' + key] = false;  // 다음에 탭을 다시 누르면 재시도
        container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-white-50 mb-3">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button class="btn btn-outline-danger btn-sm" onclick="loadedTabs['#${key}']=true; renderNewsTab('${key}','${containerId}','${badgeText}',${isVideo})">다시 시도</button></div>`;
        return;
    }

    const actionText = isVideo ? "영상 보기" : key === "report" ? "리포트 전문 읽기" : "번역 기사 읽기";
    const actionIcon = isVideo ? "fa-solid fa-circle-play" : "fa-solid fa-arrow-right-long";
    const cards = tab.items.map(item => {
        const title = escapeHtml(item.titleKo || item.title);
        const desc = isVideo ? "F1 공식 유튜브 채널의 최신 영상입니다." : escapeHtml(item.descKo || item.desc);
        const original = item.titleKo ? `<p class="news-original">${escapeHtml(item.title)}</p>` : "";
        const img = item.image
            ? `<img src="${escapeHtml(item.image)}" class="news-img${key === "report" ? " news-img-map" : ""}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'news-img news-img-empty'}))">`
            : `<div class="news-img news-img-empty"></div>`;
        return `
            <div class="col-md-6 col-lg-4">
                <a href="article.html?tab=${key}&id=${item.id}" class="news-card">
                    <div class="news-img-wrapper" style="background-color: #111115;">
                        <span class="news-category-badge">${badgeText}</span>
                        ${isVideo ? '<div class="video-play-overlay"><i class="fa-solid fa-circle-play"></i></div>' : ''}
                        ${img}
                    </div>
                    <div class="news-content">
                        <div class="news-date"><i class="fa-regular fa-clock me-1"></i> ${timeAgo(item.date)} · ${escapeHtml(tab.source)}</div>
                        <h3 class="news-title">${title}</h3>
                        ${original}
                        <p class="news-desc">${desc}</p>
                        <div class="news-read-more text-danger">${actionText} <i class="${actionIcon} ms-1"></i></div>
                    </div>
                </a>
            </div>`;
    }).join('');

    container.innerHTML = `
        <div class="col-12 news-source-line">
            <i class="fa-solid fa-rss me-1 text-danger"></i> 출처 <a href="${escapeHtml(tab.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(tab.source)}</a>
            · ${tab.license ? `전문 자동 번역 · <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ko" target="_blank" rel="noopener">${escapeHtml(tab.license)}</a>` : "제목과 요약은 자동 번역"} · 업데이트 ${timeAgo(tab.updated)}
        </div>` + cards;
}
