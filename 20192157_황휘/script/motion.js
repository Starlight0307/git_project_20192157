// ----------------------------------------------------
// 모션 그래픽 (모든 페이지 공통) — 모양은 css/motion.css
// ----------------------------------------------------
// 1. F1 스타트 라이트 인트로 (창을 처음 열 때 한 번)
// 2. 스크롤하면 카드·제목이 차례로 나타남 (API로 나중에 그려지는 카드 포함)
// 3. 점수·통계 숫자가 0부터 올라감
// 4. 히어로: 제목이 아래에서 올라오고, 속도선이 지나가고, 배경이 천천히 움직임(패럴랙스)
// 5. 카드에 마우스를 올리면 3D로 기울고 빛이 따라옴
// 6. 페이지를 옮길 때 빨간 줄무늬가 화면을 쓸고 지나감
// 7. 맨 위 스크롤 진행 막대, 라이브 배지 맥박
// 운영체제에서 '동작 줄이기'를 켠 사람에게는 아무것도 하지 않는다.
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const SKIP_INSIDE = '.modal, #navbar-placeholder, .dropdown-menu, .leaflet-container, .mo-lights';
    const session = {
        get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* 무시 */ } }
    };

    // ---------- 1. F1 스타트 라이트 인트로 ----------
    function startLights() {
        if (session.get('mo_lights_done')) return;
        session.set('mo_lights_done', '1');

        const box = document.createElement('div');
        box.className = 'mo-lights';
        box.setAttribute('aria-hidden', 'true');
        box.innerHTML = `<div class="mo-lights-row">${'<span class="mo-light"></span>'.repeat(5)}</div>
                         <div class="mo-lights-text">LIGHTS OUT AND AWAY WE GO</div>`;
        document.body.appendChild(box);

        const lights = box.querySelectorAll('.mo-light');
        lights.forEach((light, i) => setTimeout(() => light.classList.add('on'), 200 + i * 220));
        const lightsOut = 200 + 5 * 220 + 250;
        setTimeout(() => {
            lights.forEach(light => light.classList.remove('on'));
            box.classList.add('mo-go');
        }, lightsOut);
        setTimeout(() => box.classList.add('mo-out'), lightsOut + 450);
        setTimeout(() => box.remove(), lightsOut + 1100);
        // 아무 곳이나 누르면 바로 건너뛰기
        box.addEventListener('click', () => { box.classList.add('mo-out'); setTimeout(() => box.remove(), 600); });
    }

    // ---------- 2. 스크롤 등장 ----------
    const REVEAL = [
        '.glass-card', '.feature-card', '.f1-driver-card', '.f1-team-card', '.f1-driver-card-mini',
        '.champion-card', '.news-card', '.video-card', '.product-card', '.chart-card', '.stat-card',
        '.driver-row', '.team-card', '.dashboard-list-item', '.creator-contact-item', '.creator-sns-card',
        'section h2', 'section h3.fw-black', '.section-title'
    ].join(', ');
    const UNDERLINE = 'section h2, section h3.fw-black, .section-title';

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('mo-in');
            revealObserver.unobserve(entry.target);
            countUpWithin(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function prepareReveal(root) {
        const nodes = [];
        if (root.matches && root.matches(REVEAL)) nodes.push(root);
        if (root.querySelectorAll) nodes.push(...root.querySelectorAll(REVEAL));
        nodes.forEach(el => {
            if (el.classList.contains('mo-reveal') || el.closest(SKIP_INSIDE)) return;
            // 이미 나타나는 카드 안의 카드는 따로 움직이지 않게
            if (el.parentElement && el.parentElement.closest('.mo-reveal')) return;
            // 같은 줄에 있는 형제끼리 0.07초씩 차례로
            const parent = el.parentElement;
            const siblings = parent ? [...parent.children] : [];
            const wrapperIndex = parent && parent.parentElement ? [...parent.parentElement.children].indexOf(parent) : 0;
            const index = Math.max(siblings.indexOf(el), 0) + (siblings.length === 1 ? wrapperIndex : 0);
            el.style.setProperty('--mo-delay', `${Math.min(index % 6, 5) * 0.07}s`);
            el.classList.add('mo-reveal');
            if (el.matches(UNDERLINE)) el.classList.add('mo-underline');
            revealObserver.observe(el);
        });
    }

    // ---------- 3. 숫자 카운트 ----------
    const NUM_RE = /^\s*(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?\s*$/;
    const UNIT_RE = /^(점|PTS|pts|회|경기|%|Wins|승)/;
    const countedNodes = new WeakSet();

    function countUpWithin(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const targets = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const m = node.nodeValue.match(NUM_RE);
            if (!m || countedNodes.has(node)) continue;
            const parent = node.parentElement;
            if (!parent || parent.closest('select, option, button, a, .mo-lights, .ko-en')) continue;
            const value = parseFloat((m[1] + (m[2] || '')).replace(/,/g, ''));
            // 연도(1950~2100)·작은 숫자·작은 글씨는 빼고 큰 숫자만
            if (value < 5 || (!m[2] && value >= 1950 && value <= 2100)) continue;
            if (parseFloat(getComputedStyle(parent).fontSize) < 15) continue;
            // 점수·횟수처럼 단위가 붙은 숫자만 (등번호·순위 같은 숫자는 그대로)
            const next = (node.nextSibling ? node.nextSibling.textContent : '') ||
                         (parent.nextElementSibling ? parent.nextElementSibling.textContent : '');
            if (!UNIT_RE.test(next.trim().slice(0, 8))) continue;
            targets.push({ node, value, decimals: m[2] ? m[2].length - 1 : 0, comma: m[1].includes(',') });
        }
        targets.forEach(t => {
            countedNodes.add(t.node);
            const original = t.node.nodeValue;
            const lead = original.match(/^\s*/)[0];
            const trail = original.match(/\s*$/)[0];
            const start = performance.now();
            const duration = 1200;
            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                let shown = (t.value * eased).toFixed(t.decimals);
                if (t.comma) shown = Number(shown).toLocaleString('en-US', { minimumFractionDigits: t.decimals });
                t.node.nodeValue = p < 1 ? lead + shown + trail : original;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }

    // ---------- 4. 히어로 ----------
    const HERO = 'header';
    function prepareHero() {
        document.querySelectorAll(HERO).forEach(header => {
            if (header.closest(SKIP_INSIDE)) return;
            // 큰 제목은 줄마다 차례로 올라오게
            const title = header.querySelector('h1');
            if (title) {
                const parts = title.querySelectorAll(':scope > span');
                const lines = parts.length ? [...parts] : [title];
                lines.forEach((line, i) => {
                    line.classList.add('mo-hero-line');
                    line.style.setProperty('--mo-delay', `${0.15 + i * 0.15}s`);
                });
                const after = title.nextElementSibling;
                if (after && after.tagName === 'P') {
                    after.classList.add('mo-hero-line');
                    after.style.setProperty('--mo-delay', `${0.2 + lines.length * 0.15}s`);
                }
            }
            // 속도선
            header.classList.add('mo-has-speed');
            const speed = document.createElement('div');
            speed.className = 'mo-speed';
            speed.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 9; i++) {
                const line = document.createElement('i');
                line.style.top = `${8 + Math.random() * 84}%`;
                line.style.animationDuration = `${1.6 + Math.random() * 2.4}s`;
                line.style.animationDelay = `${Math.random() * 3}s`;
                line.style.height = `${1 + Math.round(Math.random() * 2)}px`;
                speed.appendChild(line);
            }
            header.prepend(speed);
        });
    }

    // 배경 사진이 있는 히어로는 스크롤보다 천천히 움직임
    function parallax() {
        const heroes = [...document.querySelectorAll(HERO)].filter(h => getComputedStyle(h).backgroundImage.includes('url('));
        if (heroes.length === 0) return;
        let ticking = false;
        const update = () => {
            const y = window.scrollY;
            heroes.forEach(h => {
                if (y < h.offsetTop + h.offsetHeight) h.style.backgroundPositionY = `calc(50% + ${Math.round(y * 0.35)}px)`;
            });
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
    }

    // ---------- 5. 카드 기울기 ----------
    const TILT = '.f1-driver-card, .f1-team-card, .feature-card, .product-card, .news-card, .video-card, .champion-card, .creator-sns-card';
    const canHover = window.matchMedia('(hover: hover)').matches;   // 터치 화면에서는 기울기 끔
    function enableTilt(root) {
        if (!canHover) return;
        const cards = [];
        if (root.matches && root.matches(TILT)) cards.push(root);
        if (root.querySelectorAll) cards.push(...root.querySelectorAll(TILT));
        cards.forEach(card => {
            if (card.classList.contains('mo-tilt') || card.closest(SKIP_INSIDE)) return;
            card.classList.add('mo-tilt');
            if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
            const glare = document.createElement('span');
            glare.className = 'mo-tilt-glare';
            card.appendChild(glare);

            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                card.style.transition = 'transform 0.08s ease-out';
                card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
                card.style.setProperty('--mo-gx', `${x * 100}%`);
                card.style.setProperty('--mo-gy', `${y * 100}%`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                card.style.transform = '';
            });
        });
    }

    // ---------- 6. 페이지 전환 ----------
    function pageTransitions() {
        const wipe = document.createElement('div');
        wipe.className = 'mo-wipe';
        wipe.setAttribute('aria-hidden', 'true');
        wipe.innerHTML = '<span></span><span></span><span></span>';

        // 다른 페이지에서 넘어왔으면: 덮인 상태로 시작해서 걷어냄
        if (session.get('mo_wipe_in')) {
            session.set('mo_wipe_in', '');
            wipe.classList.add('mo-reveal-page');
            document.body.appendChild(wipe);
            requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add('mo-open')));
            setTimeout(() => wipe.classList.remove('mo-reveal-page', 'mo-open'), 700);
        } else {
            document.body.appendChild(wipe);
        }

        document.addEventListener('click', (e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = e.target.closest('a[href]');
            if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.bsToggle) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
            // 같은 페이지 안의 이동(#…)은 그대로
            if (url.pathname === location.pathname && url.search === location.search) return;
            e.preventDefault();
            session.set('mo_wipe_in', '1');
            wipe.classList.remove('mo-reveal-page', 'mo-open');
            wipe.classList.add('mo-cover');
            setTimeout(() => { location.href = url.href; }, 380);
        });

        // 뒤로 가기로 돌아왔을 때 덮개가 남아 있지 않게
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) wipe.classList.remove('mo-cover', 'mo-reveal-page', 'mo-open');
        });
    }

    // ---------- 7. 진행 막대 · 배지 맥박 ----------
    function progressBar() {
        const bar = document.createElement('div');
        bar.className = 'mo-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    function pulseBadges(root) {
        if (!root.querySelectorAll) return;
        root.querySelectorAll('#live-badge, .badge.bg-danger').forEach(b => {
            if (!b.closest(SKIP_INSIDE)) b.classList.add('mo-pulse');
        });
    }

    // ---------- 시작 ----------
    // 인트로와 전환 덮개는 스크립트가 읽히자마자 (페이지가 잠깐 보였다가 덮이는 깜빡임 방지)
    startLights();
    pageTransitions();

    function start() {
        prepareHero();
        parallax();
        prepareReveal(document.body);
        enableTilt(document.body);
        pulseBadges(document.body);
        progressBar();

        // API 결과처럼 나중에 그려지는 카드에도 적용
        let pending = [];
        let scheduled = false;
        new MutationObserver((mutations) => {
            mutations.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) pending.push(n); }));
            if (!scheduled && pending.length) {
                scheduled = true;
                requestAnimationFrame(() => {
                    const nodes = pending;
                    pending = [];
                    scheduled = false;
                    nodes.forEach(n => {
                        if (!n.isConnected || n.closest('.mo-speed, .mo-wipe, .mo-lights, .mo-progress, .ko-en')) return;
                        prepareReveal(n);
                        enableTilt(n);
                        pulseBadges(n);
                    });
                });
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
