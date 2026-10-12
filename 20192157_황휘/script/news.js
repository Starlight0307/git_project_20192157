// ----------------------------------------------------
// 서브 페이지: 실시간 뉴스 및 분석 (news.js)
// ----------------------------------------------------

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json?rss_url=";

const FEED_URLS = {
    latest: "https://www.motorsport.com/rss/f1/news/", // Motorsport.com (최신 소식)
    tech: "https://the-race.com/category/formula-1/feed/", // The Race (테크 전문)
    column: "https://www.autosport.com/rss/f1/news/", // Autosport (칼럼/블로그 대용)
    video: "https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg" // 공식 유튜브
};

const loadedTabs = {};
async function translateToKorean(text) {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]+>/g, "").trim(); 
    if (cleanText.length === 0) return "";
    
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(item => item[0]).join(" ");
    } catch (e) {
        return cleanText; 
    }
}

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

        fetchRealTimeNews(FEED_URLS[targetHash.replace('#', '')], containerId, badgeName, isVideo);
        loadedTabs[targetHash] = true;
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
        '#tech': ['테크 <span class="text-danger">토크</span>', 'The Race의 심층 기술 분석을 전해드립니다.'],
        '#column': ['칼럼 / <span class="text-danger">블로그</span>', 'Autosport가 전하는 패독 안팎의 깊은 시선.'],
        '#video': ['영상 <span class="text-danger">뉴스</span>', 'F1 공식 채널의 최신 비디오를 시청하세요.']
    };
    if (textMap[targetId]) {
        title.innerHTML = textMap[targetId][0];
        subtitle.innerText = textMap[targetId][1];
    }
}

async function fetchRealTimeNews(rssUrl, containerId, badgeText, isVideo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(RSS2JSON_API + encodeURIComponent(rssUrl));
        const data = await response.json();

        if (data.status === "ok") {
            container.innerHTML = ''; 
            const items = data.items.slice(0, 6); 

            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                const uniqueImgId = `img-${containerId}-${index}`;
                const spinnerId = `spinner-${containerId}-${index}`;
                
                let imageUrl = "";
                if (isVideo && item.link) {
                    const videoIdMatch = item.link.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([^&?]+)/);
                    if (videoIdMatch && videoIdMatch[1]) {
                        imageUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
                    }
                } 

                if (!imageUrl) imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                if (!imageUrl && (item.description || item.content)) {
                    const match = (item.description || item.content).match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
                    if (match && match[1]) imageUrl = match[1];
                }

                if (!imageUrl || imageUrl.trim() === "") imageUrl = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; 

                const pubDate = new Date(item.pubDate.replace(' ', 'T'));
                let dateStr = `${pubDate.getFullYear()}년 ${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`;

                let finalTitle = item.title;
                if(!isVideo && finalTitle.includes(" - ")) finalTitle = finalTitle.split(" - ")[0];
                
                // 🔥 실시간 번역
                let translatedTitle = isVideo ? finalTitle : await translateToKorean(finalTitle);
                let cleanDesc = item.description.replace(/<[^>]+>/g, "").substring(0, 150);
                let translatedDesc = isVideo ? "F1 공식 유튜브 채널의 최신 업데이트 영상입니다." : await translateToKorean(cleanDesc);

                const actionText = isVideo ? "유튜브에서 시청하기" : "기사 전문 읽기";
                const actionIcon = isVideo ? "fa-youtube" : "fa-arrow-right-long";

                const cardHtml = `
                    <div class="col-md-6 col-lg-4">
                        <a href="${item.link}" target="_blank" class="news-card">
                            <div class="news-img-wrapper" style="background-color: #111115;">
                                <span class="news-category-badge">${badgeText}</span>
                                ${isVideo ? '<div class="video-play-overlay"><i class="fa-solid fa-circle-play"></i></div>' : ''}
                                ${imageUrl.startsWith('data:') ? `<div id="${spinnerId}" class="position-absolute top-50 start-50 translate-middle"><i class="fa-solid fa-spinner fa-spin text-white-50 fs-3"></i></div>` : ''}
                                <img src="${imageUrl}" id="${uniqueImgId}" class="news-img" style="${imageUrl.startsWith('data:') ? 'display: none;' : ''}">
                            </div>
                            <div class="news-content">
                                <div class="news-date"><i class="fa-regular fa-clock me-1"></i> ${dateStr}</div>
                                <h3 class="news-title">${translatedTitle}</h3>
                                <p class="news-desc">${translatedDesc}...</p>
                                <div class="news-read-more text-danger">${actionText} <i class="${isVideo ? 'fa-brands' : 'fa-solid'} ${actionIcon} ms-1"></i></div>
                            </div>
                        </a>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHtml);

                if (!isVideo && imageUrl.startsWith('data:')) {
                    scrapeOriginalImage(item.link, uniqueImgId, spinnerId);
                }
            }
        }
    } catch (error) {
        container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-white-50">데이터를 불러오는 데 실패했습니다.</p></div>`;
    }
}

async function scrapeOriginalImage(articleUrl, imgId, spinnerId) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(articleUrl)}`);
        const data = await response.json();
        const html = data.contents;
        let imgSrc = null;
        const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || 
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (match) imgSrc = match[1];

        const imgEl = document.getElementById(imgId);
        const spinnerEl = document.getElementById(spinnerId);
        if (imgSrc && imgEl) {
            imgEl.src = imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc;
            imgEl.style.display = 'block';
        } else if (imgEl) {
            imgEl.src = "https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg";
            imgEl.style.opacity = "0.05"; imgEl.style.display = 'block'; imgEl.style.padding = "40px";
        }
        if(spinnerEl) spinnerEl.remove();
    } catch (e) {
        if(document.getElementById(spinnerId)) document.getElementById(spinnerId).remove();
    }
}