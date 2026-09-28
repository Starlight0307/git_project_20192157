// ==================== //
// 모바일 네비게이션 토글
// ==================== //
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// 햄버거 메뉴 클릭 이벤트
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// 네비게이션 링크 클릭 시 메뉴 닫기
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ==================== //
// 스크롤 시 네비게이션 스타일 변경
// ==================== //
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.padding = '1rem 0';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ==================== //
// 현재 섹션 하이라이트
// ==================== //
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==================== //
// 스킬 바 애니메이션
// ==================== //
const skillBars = document.querySelectorAll('.skill-progress');

const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const barPosition = bar.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (barPosition < windowHeight - 100) {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        }
    });
};

// 스킬 섹션이 보일 때 애니메이션 실행
let skillAnimated = false;
window.addEventListener('scroll', () => {
    const skillsSection = document.getElementById('skills');
    const skillsPosition = skillsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (skillsPosition < windowHeight - 100 && !skillAnimated) {
        animateSkillBars();
        skillAnimated = true;
    }
});

// ==================== //
// 통계 카운터 애니메이션
// ==================== //
const statNumbers = document.querySelectorAll('.stat-number');

const animateCounter = (element) => {
    const target = element.textContent;
    const number = parseInt(target);
    const increment = number / 50;
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < number) {
            element.textContent = Math.ceil(current) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
};

// About 섹션이 보일 때 카운터 애니메이션 실행
let counterAnimated = false;
window.addEventListener('scroll', () => {
    const aboutSection = document.getElementById('about');
    const aboutPosition = aboutSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (aboutPosition < windowHeight - 100 && !counterAnimated) {
        statNumbers.forEach(stat => animateCounter(stat));
        counterAnimated = true;
    }
});

// ==================== //
// 스크롤 애니메이션 (Intersection Observer)
// ==================== //
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 애니메이션할 요소들 설정
const animateElements = document.querySelectorAll('.project-card, .timeline-item, .skill-category');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== //
// 연락처 폼 제출 처리
// ==================== //
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 폼 데이터 가져오기
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // 여기에 실제 폼 전송 로직 추가 (예: AJAX, fetch API)
    console.log('폼 데이터:', formData);

    // 사용자에게 피드백 제공
    alert('메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.');

    // 폼 초기화
    contactForm.reset();
});

// ==================== //
// 부드러운 스크롤
// ==================== //
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 70; // 네비게이션 높이 고려

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== //
// 프로젝트 카드 호버 효과 (터치 디바이스 대응)
// ==================== //
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('touchstart', function() {
        this.classList.add('touch-hover');
    });

    card.addEventListener('touchend', function() {
        setTimeout(() => {
            this.classList.remove('touch-hover');
        }, 300);
    });
});

// ==================== //
// 이미지 Lazy Loading
// ==================== //
const images = document.querySelectorAll('img');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;

            // 이미지가 로드되지 않았을 때 처리
            img.addEventListener('error', function() {
                this.style.display = 'none';
                const placeholder = this.parentElement;
                if (placeholder.classList.contains('image-placeholder')) {
                    placeholder.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
            });

            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// ==================== //
// 페이지 로드 완료 시 초기화
// ==================== //
window.addEventListener('load', () => {
    // 로딩 애니메이션 등 추가 가능
    document.body.style.opacity = '1';

    // 초기 스크롤 위치가 상단이 아닐 경우 네비게이션 스타일 조정
    if (window.scrollY > 100) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    }
});

// ==================== //
// 윈도우 리사이즈 처리
// ==================== //
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 데스크톱으로 전환 시 모바일 메뉴 닫기
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }, 250);
});

// ==================== //
// 다크 모드 토글 (선택 사항)
// ==================== //
// 다크 모드 기능을 추가하려면 아래 주석을 해제하세요
/*
const darkModeToggle = document.createElement('button');
darkModeToggle.innerHTML = '🌙';
darkModeToggle.className = 'dark-mode-toggle';
darkModeToggle.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 999;
    transition: all 0.3s ease;
`;

document.body.appendChild(darkModeToggle);

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});
*/

// ==================== //
// 콘솔 환영 메시지
// ==================== //
console.log('%c포트폴리오 웹사이트에 오신 것을 환영합니다!',
    'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%c이 웹사이트는 HTML, CSS, JavaScript로 제작되었습니다.',
    'color: #64748b; font-size: 14px;');

// ==================== //
// 지도 (현재 위치 + 주소 검색)
// ==================== //
// Leaflet(OpenStreetMap) + Nominatim 주소 검색 - API 키 없이 사용 가능
const mapModal = document.getElementById('mapModal');

if (mapModal && window.L) {
    const mapOpenBtn = document.getElementById('mapOpenBtn');
    const mapCloseBtn = document.getElementById('mapCloseBtn');
    const mapSearchForm = document.getElementById('mapSearchForm');
    const mapSearchInput = document.getElementById('mapSearchInput');
    const mapGpsBtn = document.getElementById('mapGpsBtn');
    const mapResults = document.getElementById('mapResults');
    const mapStatus = document.getElementById('mapStatus');

    const DEFAULT_CENTER = [37.5509, 126.8495]; // 서울특별시 강서구
    let map = null;
    let searchMarker = null;
    let gpsMarker = null;
    let gpsCircle = null;

    const setStatus = (text) => { mapStatus.textContent = text; };

    const initMap = () => {
        if (map) return;
        map = L.map('map').setView(DEFAULT_CENTER, 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        searchMarker = L.marker(DEFAULT_CENTER).addTo(map).bindPopup('서울특별시 강서구').openPopup();
        enableManualPick();
    };

    const openMap = () => {
        mapModal.classList.add('active');
        mapModal.setAttribute('aria-hidden', 'false');
        initMap();
        // 모달이 보인 뒤 지도 크기 재계산
        setTimeout(() => map.invalidateSize(), 100);
    };

    const closeMap = () => {
        mapModal.classList.remove('active');
        mapModal.setAttribute('aria-hidden', 'true');
    };

    const showPlace = (lat, lon, label) => {
        map.setView([lat, lon], 16);
        searchMarker.setLatLng([lat, lon]).bindPopup(label).openPopup();
    };

    // 현재 위치 마커 표시
    const showMyLocation = (lat, lon, accuracy, label) => {
        const latlng = [lat, lon];
        if (gpsMarker) {
            gpsMarker.setLatLng(latlng);
            gpsCircle.setLatLng(latlng).setRadius(accuracy);
        } else {
            gpsCircle = L.circle(latlng, { radius: accuracy, color: '#2563eb', fillOpacity: 0.15 }).addTo(map);
            gpsMarker = L.circleMarker(latlng, { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map);
        }
        gpsMarker.bindPopup(label).openPopup();
        map.setView(latlng, accuracy > 1000 ? 13 : 16);
    };

    // 브라우저 위치를 못 가져올 때: IP 기반 대략적 위치
    const locateByIp = async (reason) => {
        try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (!data.success) throw new Error();
            showMyLocation(data.latitude, data.longitude, 3000, `📍 대략적 위치 (${data.city})`);
            setStatus(`${reason} 인터넷(IP) 기준 대략적 위치를 표시합니다. (${data.city}, 수 km 오차)`);
        } catch (e) {
            setStatus(`${reason} 대략적 위치도 가져오지 못했습니다.`);
        }
    };

    // 브라우저 위치 요청을 Promise로 감싸기
    const getPosition = (options) => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    const errorNames = { 1: '권한 거부', 2: '위치 사용 불가', 3: '시간 초과' };

    // GPS 현재 위치
    const locate = async () => {
        if (!navigator.geolocation) {
            locateByIp('이 브라우저는 위치 정보를 지원하지 않아');
            return;
        }
        if (!window.isSecureContext) {
            locateByIp(`보안 주소(https 또는 localhost)가 아니라서(${location.protocol}) 기기 위치를 쓸 수 없어`);
            return;
        }

        setStatus('현재 위치를 찾는 중...');
        // 1차: Wi-Fi 기반(빠름) → 2차: 고정밀 모드로 재시도
        const attempts = [
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        ];
        let lastError = null;

        for (const options of attempts) {
            try {
                const pos = await getPosition(options);
                const { latitude, longitude, accuracy } = pos.coords;
                showMyLocation(latitude, longitude, accuracy, '📍 현재 위치');
                setStatus(`현재 위치 (정확도 약 ${Math.round(accuracy)}m)`);
                return;
            } catch (err) {
                lastError = err;
                console.warn('위치 확인 실패:', err.code, err.message);
                if (err.code === 1) break; // 권한 거부는 재시도해도 소용없음
                setStatus('한 번 더 시도하는 중...');
            }
        }

        if (lastError.code === 1) {
            setStatus('위치 권한이 거부되었습니다. 주소창 왼쪽 아이콘에서 위치 권한을 허용해주세요.');
            return;
        }
        // 실패 원인을 함께 표시 (예: 위치 사용 불가 = macOS가 브라우저 위치 접근을 막은 경우가 대부분)
        await locateByIp(`기기 위치를 확인할 수 없어 [${errorNames[lastError.code] || lastError.code}: ${lastError.message}]`);
        setStatus(mapStatus.textContent + ' 지도를 클릭하면 내 위치를 직접 지정할 수 있어요.');
    };

    // 지도를 클릭해서 내 위치를 직접 지정
    const enableManualPick = () => {
        map.on('click', (e) => {
            if (!gpsMarker) return;
            showMyLocation(e.latlng.lat, e.latlng.lng, 30, '📍 내 위치 (직접 지정)');
            setStatus('지도에서 직접 지정한 위치입니다.');
        });
    };

    // 주소 검색
    const searchAddress = async (query) => {
        setStatus('검색 중...');
        mapResults.innerHTML = '';
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=ko&q=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const results = await res.json();
            if (results.length === 0) {
                setStatus('검색 결과가 없습니다. 다른 주소로 검색해보세요.');
                return;
            }
            setStatus(`검색 결과 ${results.length}건`);
            showPlace(results[0].lat, results[0].lon, results[0].display_name);
            if (results.length > 1) {
                results.forEach((place) => {
                    const li = document.createElement('li');
                    li.textContent = place.display_name;
                    li.addEventListener('click', () => showPlace(place.lat, place.lon, place.display_name));
                    mapResults.appendChild(li);
                });
            }
        } catch (error) {
            setStatus('검색에 실패했습니다. 인터넷 연결을 확인해주세요.');
        }
    };

    mapOpenBtn.addEventListener('click', openMap);
    mapCloseBtn.addEventListener('click', closeMap);
    mapModal.addEventListener('click', (e) => { if (e.target === mapModal) closeMap(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMap(); });
    mapGpsBtn.addEventListener('click', locate);
    mapSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = mapSearchInput.value.trim();
        if (query) searchAddress(query);
    });
}

// ==================== //
// 배경음악 플레이어
// ==================== //
// music 폴더에 mp3 파일을 넣고 아래 목록에 추가하세요
const BGM_PLAYLIST = [
    { title: 'Official髭男dism - Pretender［Official Video］', src: 'music/Official髭男dism - Pretender［Official Video］.mp4' },
    { title: '빅뱅 노래', src: 'music/videoplayback.mp4' }
];

(() => {
    if (BGM_PLAYLIST.length === 0) return;

    const STORAGE_KEY = 'bgmState';
    const load = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
    };
    const save = (state) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 무시 */ }
    };

    const saved = load();
    let index = Math.min(saved.index || 0, BGM_PLAYLIST.length - 1);

    const audio = new Audio();
    audio.volume = saved.volume ?? 0.4;

    const player = document.createElement('div');
    player.className = 'bgm-player' + (saved.collapsed ? ' collapsed' : '');
    player.innerHTML = `
        <button type="button" class="bgm-toggle" title="플레이어 접기/펼치기"><span class="bgm-icon">🎵</span></button>
        <div class="bgm-body">
            <button type="button" class="bgm-prev" title="이전 곡">⏮</button>
            <button type="button" class="bgm-play" title="재생/일시정지">▶</button>
            <button type="button" class="bgm-next" title="다음 곡">⏭</button>
            <span class="bgm-title"></span>
            <input type="range" class="bgm-volume" min="0" max="1" step="0.05" title="볼륨">
        </div>
    `;
    document.body.appendChild(player);

    const playBtn = player.querySelector('.bgm-play');
    const titleEl = player.querySelector('.bgm-title');
    const volumeEl = player.querySelector('.bgm-volume');
    volumeEl.value = audio.volume;

    const persist = () => save({
        index,
        time: audio.currentTime,
        volume: audio.volume,
        playing: !audio.paused,
        collapsed: player.classList.contains('collapsed')
    });

    const updateUI = () => {
        const playing = !audio.paused;
        playBtn.textContent = playing ? '⏸' : '▶';
        player.classList.toggle('playing', playing);
    };

    const loadTrack = (i, startTime = 0) => {
        index = (i + BGM_PLAYLIST.length) % BGM_PLAYLIST.length;
        audio.src = BGM_PLAYLIST[index].src;
        titleEl.textContent = BGM_PLAYLIST[index].title;
        if (startTime) {
            audio.addEventListener('loadedmetadata', () => { audio.currentTime = startTime; }, { once: true });
        }
    };

    const play = () => audio.play().catch(() => {
        titleEl.textContent = BGM_PLAYLIST[index].title;
        updateUI();
    });

    playBtn.addEventListener('click', () => { audio.paused ? play() : audio.pause(); });
    player.querySelector('.bgm-prev').addEventListener('click', () => { loadTrack(index - 1); play(); });
    player.querySelector('.bgm-next').addEventListener('click', () => { loadTrack(index + 1); play(); });
    player.querySelector('.bgm-toggle').addEventListener('click', () => {
        player.classList.toggle('collapsed');
        persist();
    });
    volumeEl.addEventListener('input', () => { audio.volume = volumeEl.value; persist(); });

    audio.addEventListener('play', updateUI);
    audio.addEventListener('pause', () => { updateUI(); persist(); });
    audio.addEventListener('ended', () => { loadTrack(index + 1); play(); });
    audio.addEventListener('error', () => { titleEl.textContent = '음악 파일 없음'; updateUI(); });

    // 페이지 이동 시 재생 위치 저장 → 다음 페이지에서 이어서 재생
    window.addEventListener('pagehide', persist);

    loadTrack(index, saved.time || 0);
    updateUI();

    if (saved.playing) {
        // 브라우저 자동재생 정책으로 막히면 첫 클릭/터치 때 재생
        audio.play().catch(() => {
            const resume = (e) => {
                document.removeEventListener('pointerdown', resume);
                // 플레이어 버튼을 누른 경우는 버튼 동작에 맡김
                if (!player.contains(e.target)) play();
            };
            document.addEventListener('pointerdown', resume);
        });
    }
})();
