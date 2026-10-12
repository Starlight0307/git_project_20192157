// ----------------------------------------------------
// 서브 페이지: 굿즈 샵 (shop.html)
// 상품 목록은 script/shopData.js (PRODUCT_DATA)
// - 실시간 EUR·USD → KRW 환율 적용
// - 탭(팀 상품 / 드라이버 컬렉션 / 한정판·세일) · 팀 필터 · 검색 · 정렬
// ----------------------------------------------------

let USD_TO_KRW = 1350; // 환율을 못 받으면 쓰는 값 (달러)
let EUR_TO_KRW = 1450; // (유로)
const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest/USD";

// 팀 필터 키 → 화면 이름 · teamData(common.js) 이름 (색·로고)
const SHOP_TEAMS = {
    "ferrari": { label: "Ferrari", data: "Ferrari" },
    "mercedes-amg-petronas": { label: "Mercedes", data: "Mercedes" },
    "red-bull-racing": { label: "Red Bull", data: "Red Bull" },
    "mclaren": { label: "McLaren", data: "McLaren" },
    "aston-martin": { label: "Aston Martin", data: "Aston Martin" },
    "alpine": { label: "Alpine", data: "Alpine" },
    "williams": { label: "Williams", data: "Williams" },
    "vcarb": { label: "Racing Bulls", data: "RB" },
    "haas": { label: "Haas", data: "Haas" },
    "audi": { label: "Audi", data: "Audi" },
    "cadillac": { label: "Cadillac", data: "Cadillac" }
};

// 드라이버 이름 → 팀 필터 키 (드라이버 컬렉션 카드 색)
const DRIVER_TEAM_KEYS = {
    "leclerc": "ferrari", "hamilton": "ferrari",
    "verstappen": "red-bull-racing", "hadjar": "red-bull-racing",
    "norris": "mclaren", "piastri": "mclaren",
    "russell": "mercedes-amg-petronas", "antonelli": "mercedes-amg-petronas",
    "sainz": "williams", "albon": "williams",
    "alonso": "aston-martin", "stroll": "aston-martin",
    "gasly": "alpine", "colapinto": "alpine",
    "lawson": "vcarb", "lindblad": "vcarb",
    "ocon": "haas", "bearman": "haas",
    "hulkenberg": "audi", "bortoleto": "audi",
    "perez": "cadillac", "bottas": "cadillac"
};

const shopState = { tab: 'team', team: 'all', query: '', sort: 'recommend' };
let currentRenderedProducts = [];

// ---------- 환율 ----------
async function fetchExchangeRate() {
    try {
        const res = await fetch(EXCHANGE_API_URL);
        if (!res.ok) throw new Error("환율 API 응답 오류");
        const data = await res.json();
        if (data && data.rates && data.rates.KRW && data.rates.EUR) {
            USD_TO_KRW = data.rates.KRW;
            EUR_TO_KRW = data.rates.KRW / data.rates.EUR;
            updateExchangeRateBadge(false);
            return;
        }
        throw new Error("환율 값 없음");
    } catch (err) {
        console.warn("⚠️ 환율 API 실패, 기본 환율 사용:", err);
        updateExchangeRateBadge(true);
    }
}

function updateExchangeRateBadge(isFallback) {
    const badge = document.getElementById('exchange-rate-badge');
    if (!badge) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    badge.innerHTML = isFallback
        ? `<i class="fa-solid fa-circle-exclamation text-warning me-1"></i>기본 환율 적용 중 · 1 € ≈ ₩${Math.round(EUR_TO_KRW).toLocaleString('ko-KR')}`
        : `<span class="rate-dot"></span>실시간 환율 · 1 € = ₩${Math.round(EUR_TO_KRW).toLocaleString('ko-KR')} · 1 $ = ₩${Math.round(USD_TO_KRW).toLocaleString('ko-KR')} · ${timeStr} 기준`;
    badge.classList.add('ready');
}

// "$137.00" / "€59.95" → 원화 숫자
function priceToKrw(priceStr) {
    const num = parseFloat(String(priceStr || '').replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return null;
    const rate = String(priceStr).includes('$') ? USD_TO_KRW : EUR_TO_KRW;
    return Math.round(num * rate / 100) * 100;
}

const formatKrw = (krw) => krw === null ? '가격 확인' : '₩' + krw.toLocaleString('ko-KR');

function discountPercent(product) {
    if (!product.priceOld) return 0;
    const now = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const old = parseFloat(product.priceOld.replace(/[^0-9.]/g, ''));
    return old > now ? Math.round((1 - now / old) * 100) : 0;
}

const escapeHtml = (t) => String(t ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function teamStyle(product) {
    // 드라이버 컬렉션은 상품 이름의 드라이버로 팀 색을 찾음 (예: "Lando Norris 캡" → McLaren 주황)
    const title = product.title.toLowerCase();
    const driverTeam = Object.entries(DRIVER_TEAM_KEYS).find(([name]) => title.includes(name));
    const t = SHOP_TEAMS[product.team] || (driverTeam ? SHOP_TEAMS[driverTeam[1]] : null);
    const info = t && typeof teamData !== 'undefined' ? teamData[t.data] : null;
    return {
        color: info ? info.color : '#e10600',
        logo: info ? info.logo : ''
    };
}

// 옷이면 사이즈 선택을 보여 줌
const needsSize = (product) => /셔츠|폴로|재킷|자켓|후디|후드|스웨트|저지|티셔츠|팬츠|반바지/.test(product.title);

// ---------- 팀 필터 ----------
function renderTeamChips() {
    const wrap = document.getElementById('team-filter-section');
    const counts = {};
    PRODUCT_DATA.filter(p => p.category === 'team').forEach(p => { counts[p.team] = (counts[p.team] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    const chips = [`<button type="button" class="team-chip active" data-team="all" style="--team:#e10600">ALL <span class="chip-count">${total}</span></button>`];
    Object.entries(SHOP_TEAMS).forEach(([key, t]) => {
        if (!counts[key]) return;
        const info = typeof teamData !== 'undefined' ? teamData[t.data] : null;
        const color = info ? info.color : '#ffffff';
        const logo = info && info.logo ? `<img src="${info.logo}" alt="" class="chip-logo">` : '<span class="chip-dot"></span>';
        chips.push(`<button type="button" class="team-chip" data-team="${key}" style="--team:${color}">${logo}${t.label} <span class="chip-count">${counts[key]}</span></button>`);
    });
    wrap.innerHTML = chips.join('');

    wrap.addEventListener('click', (e) => {
        const chip = e.target.closest('.team-chip');
        if (!chip) return;
        wrap.querySelectorAll('.team-chip').forEach(c => c.classList.toggle('active', c === chip));
        shopState.team = chip.dataset.team;
        render();
    });
}

// ---------- 목록 ----------
function currentList() {
    let list = PRODUCT_DATA.filter(p => p.category === shopState.tab);
    if (shopState.tab === 'team' && shopState.team !== 'all') list = list.filter(p => p.team === shopState.team);
    const q = shopState.query.toLowerCase();
    if (q) list = list.filter(p => [p.title, p.teamLabel, p.desc].some(t => String(t || '').toLowerCase().includes(q)));

    const price = (p) => priceToKrw(p.price) ?? 0;
    if (shopState.sort === 'low') list = [...list].sort((a, b) => price(a) - price(b));
    else if (shopState.sort === 'high') list = [...list].sort((a, b) => price(b) - price(a));
    else if (shopState.sort === 'discount') list = [...list].sort((a, b) => discountPercent(b) - discountPercent(a));
    return list;
}

function render() {
    const list = currentList();
    currentRenderedProducts = list;
    const container = document.getElementById('products-container');
    document.getElementById('result-count').textContent = `${list.length}개 상품`;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-white-50 font-noto">
                <i class="fa-solid fa-box-open fs-2 mb-3 d-block"></i>
                조건에 맞는 상품이 없어요.
            </div>`;
        return;
    }

    container.innerHTML = list.map(p => {
        const { color } = teamStyle(p);
        const off = discountPercent(p);
        const badge = p.badge ? `<span class="merch-badge badge-${escapeHtml(p.badge.toLowerCase())}">${escapeHtml(p.badge)}</span>` : '';
        const offTag = off ? `<span class="merch-off">-${off}%</span>` : '';
        const priceHtml = p.priceOld
            ? `<span class="merch-price-old">${formatKrw(priceToKrw(p.priceOld))}</span><span class="merch-price">${formatKrw(priceToKrw(p.price))}</span>`
            : `<span class="merch-price">${formatKrw(priceToKrw(p.price))}</span>`;
        return `
            <div class="col-6 col-md-4 col-xl-3">
                <article class="product-card merch-card" style="--team:${color}" data-id="${escapeHtml(p.id)}" tabindex="0" role="button" aria-label="${escapeHtml(p.title)} 자세히 보기">
                    <div class="merch-media">
                        ${badge}${offTag}
                        <img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" class="merch-img" loading="lazy"
                             onerror="this.onerror=null; this.src='img/circuit/default.jpg'; this.classList.add('merch-img-fallback')">
                    </div>
                    <div class="merch-body">
                        <span class="merch-team"><i class="merch-team-dot"></i>${escapeHtml(p.teamLabel)}</span>
                        <h3 class="merch-title">${escapeHtml(p.title)}</h3>
                        <div class="merch-bottom">
                            <div class="merch-prices">${priceHtml}</div>
                            <span class="merch-go" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </div>
                </article>
            </div>`;
    }).join('');
}

// ---------- 상품 상세 ----------
function openProductModal(productId) {
    const p = PRODUCT_DATA.find(x => x.id === productId);
    if (!p) return;
    const { color, logo } = teamStyle(p);
    const modal = document.getElementById('productModal');
    modal.style.setProperty('--team', color);

    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-img').alt = p.title;
    document.getElementById('modal-logo').src = logo || '';
    document.getElementById('modal-logo').hidden = !logo;
    document.getElementById('modal-team').textContent = p.teamLabel;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-desc').textContent = p.desc || '';
    document.getElementById('modal-buy-link').href = p.link;

    const off = discountPercent(p);
    document.getElementById('modal-price').innerHTML = p.priceOld
        ? `<span class="modal-price-old">${formatKrw(priceToKrw(p.priceOld))}</span>${formatKrw(priceToKrw(p.price))}${off ? ` <span class="merch-off position-static ms-2">-${off}%</span>` : ''}`
        : formatKrw(priceToKrw(p.price));
    document.getElementById('modal-origin-price').textContent = `현지 가격 ${p.price}${p.priceOld ? ` (정가 ${p.priceOld})` : ''}`;

    const sizeBox = document.getElementById('size-box');
    sizeBox.hidden = !needsSize(p);
    sizeBox.querySelectorAll('.size-btn').forEach((b, i) => b.classList.toggle('active', i === 2));

    bootstrap.Modal.getOrCreateInstance(modal).show();
}

// ---------- 탭 ----------
function switchTab(tab, pushHash = true) {
    if (!['team', 'driver', 'sale'].includes(tab)) tab = 'team';
    shopState.tab = tab;
    document.querySelectorAll('.shop-tab').forEach(btn => {
        const on = btn.dataset.tab === tab;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', String(on));
    });
    moveTabIndicator();
    document.getElementById('team-filter-section').hidden = tab !== 'team';
    if (pushHash && location.hash !== `#${tab}`) history.replaceState(null, '', `#${tab}`);
    render();
}

// 선택된 탭 아래 빨간 막대가 미끄러지듯 이동
function moveTabIndicator() {
    const active = document.querySelector('.shop-tab.active');
    const bar = document.getElementById('shop-tab-indicator');
    if (!active || !bar) return;
    bar.style.width = `${active.offsetWidth}px`;
    bar.style.transform = `translateX(${active.offsetLeft}px)`;
}

// ---------- 시작 ----------
document.addEventListener('DOMContentLoaded', async () => {
    renderTeamChips();
    switchTab((location.hash || '#team').slice(1), false);

    document.querySelectorAll('.shop-tab').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    window.addEventListener('hashchange', () => switchTab((location.hash || '#team').slice(1), false));
    window.addEventListener('resize', moveTabIndicator);

    document.getElementById('shop-search').addEventListener('input', (e) => { shopState.query = e.target.value.trim(); render(); });
    document.getElementById('shop-sort').addEventListener('change', (e) => { shopState.sort = e.target.value; render(); });

    const container = document.getElementById('products-container');
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-card');
        if (card) openProductModal(card.dataset.id);
    });
    container.addEventListener('keydown', (e) => {
        const card = e.target.closest('.merch-card');
        if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProductModal(card.dataset.id); }
    });

    document.querySelectorAll('.size-btn').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b === btn));
    }));

    // 환율을 받으면 가격을 다시 그림
    await fetchExchangeRate();
    render();
});
