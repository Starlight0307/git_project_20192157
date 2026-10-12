// ==================== //
// 커뮤니티 게시판 (mcommunity.html)
// ==================== //
// 저장 위치
//  - server.js가 켜져 있으면(npm start) 서버의 posts.json에 저장 → 같은 서버에 접속한 모두가 함께 봄
//  - 서버가 꺼져 있으면 이 브라우저(localStorage)에 저장 → 이 컴퓨터·브라우저에서만 보임
// 글 비밀번호는 원문 대신 간단한 해시로 저장한다(수업용 예제라 실제 보안 수준은 아님).
(() => {
    const API_URL = 'http://localhost:3000/api/posts';
    const LOCAL_KEY = 'communityPosts';
    const LIKED_KEY = 'communityLiked';
    const VIEWED_KEY = 'communityViewed';
    const SEEDED_KEY = 'communitySeeded';
    const PAGE_SIZE = 8;
    const DAY = 24 * 60 * 60 * 1000;

    const $ = (id) => document.getElementById(id);
    const els = {
        tabs: $('cmTabs'), search: $('cmSearch'), sort: $('cmSort'), writeBtn: $('cmWriteBtn'),
        status: $('cmStatus'), list: $('cmList'), empty: $('cmEmpty'), pagination: $('cmPagination'),
        writeDialog: $('cmWriteDialog'), writeForm: $('cmWriteForm'), writeError: $('cmWriteError'),
        author: $('cmAuthor'), password: $('cmPassword'), category: $('cmCategory'),
        title: $('cmTitle'), content: $('cmContent'), contentCount: $('cmContentCount'),
        detailDialog: $('cmDetailDialog'), detailCategory: $('cmDetailCategory'), detailTitle: $('cmDetailTitle'),
        detailMeta: $('cmDetailMeta'), detailContent: $('cmDetailContent'),
        likeBtn: $('cmLikeBtn'), likeCount: $('cmLikeCount'),
        deleteToggle: $('cmDeleteToggle'), deleteForm: $('cmDeleteForm'),
        deletePassword: $('cmDeletePassword'), deleteError: $('cmDeleteError'),
        commentCount: $('cmCommentCount'), commentList: $('cmCommentList'), commentForm: $('cmCommentForm'),
        commentAuthor: $('cmCommentAuthor'), commentContent: $('cmCommentContent'), commentError: $('cmCommentError')
    };

    let posts = [];
    let mode = 'local';          // 'server' | 'local'
    let openPostId = null;       // 지금 보고 있는 글
    const view = { category: '전체', query: '', sort: 'new', page: 1 };

    // ---------- 브라우저 저장소 (사생활 보호 모드 등에서 막혀도 페이지는 동작) ----------
    const readJSON = (store, key, fallback) => {
        try { return JSON.parse(store.getItem(key)) ?? fallback; } catch (e) { return fallback; }
    };
    const writeJSON = (store, key, value) => {
        try { store.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    };

    // ---------- 불러오기 / 저장하기 ----------
    async function loadPosts() {
        try {
            const res = await fetch(API_URL, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                mode = 'server';
                return Array.isArray(data) ? data : [];
            }
        } catch (e) { /* 서버가 꺼져 있음 → 브라우저 저장 */ }
        mode = 'local';
        return readJSON(localStorage, LOCAL_KEY, []);
    }

    async function savePosts() {
        if (mode === 'server') {
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(posts)
                });
                if (res.ok) return true;
            } catch (e) { /* 아래에서 브라우저 저장으로 전환 */ }
            mode = 'local';
        }
        const ok = writeJSON(localStorage, LOCAL_KEY, posts);
        renderStatus(ok ? '' : '⚠️ 이 브라우저에서는 저장할 수 없어요. 새로고침하면 사라져요.');
        return ok;
    }

    // 다른 사람이 그사이 쓴 글을 덮어쓰지 않도록, 바꾸기 직전에 다시 불러온다
    async function mutate(change) {
        posts = await loadPosts();
        const result = change(posts);
        if (result === false) return false;
        await savePosts();
        render();
        return true;
    }

    // ---------- 도우미 ----------
    const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // 비밀번호 확인용 간단한 해시 (FNV-1a)
    function hashPassword(postId, password) {
        let h = 0x811c9dc5;
        for (const ch of `${postId}:${password}`) {
            h ^= ch.codePointAt(0);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return h.toString(16).padStart(8, '0');
    }

    function formatDate(ts) {
        const diff = Date.now() - ts;
        if (diff < 60 * 1000) return '방금 전';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < DAY) return `${Math.floor(diff / 3600000)}시간 전`;
        const d = new Date(ts);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }

    // 태그를 직접 만들고 글자는 textContent로만 넣는다(사용자가 쓴 글에 HTML이 있어도 실행되지 않음)
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function renderStatus(message) {
        els.status.textContent = message || (mode === 'server'
            ? '🟢 서버에 저장 중 — 같은 서버에 접속한 사람과 함께 봐요.'
            : '💾 이 브라우저에 저장 중 — 서버(npm start)를 켜면 함께 볼 수 있어요.');
    }

    // ---------- 목록 ----------
    function filteredPosts() {
        const q = view.query.toLowerCase();
        const list = posts.filter(p =>
            (view.category === '전체' || p.category === view.category) &&
            (!q || [p.title, p.content, p.author].some(t => String(t).toLowerCase().includes(q))));
        const key = {
            new: p => p.createdAt,
            views: p => p.views || 0,
            likes: p => p.likes || 0,
            comments: p => (p.comments || []).length
        }[view.sort];
        return list.sort((a, b) => (key(b) - key(a)) || (b.createdAt - a.createdAt));
    }

    function render() {
        const list = filteredPosts();
        const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        view.page = Math.min(view.page, pages);
        const start = (view.page - 1) * PAGE_SIZE;

        els.list.replaceChildren(...list.slice(start, start + PAGE_SIZE).map((p, i) => {
            const li = el('li', 'cm-item');
            const btn = el('button', 'cm-item-btn');
            btn.type = 'button';
            btn.dataset.id = p.id;

            const num = el('span', 'cm-num', String(list.length - start - i));
            const main = el('span', 'cm-item-main');
            const titleRow = el('span', 'cm-item-title');
            titleRow.append(el('span', `cm-badge cm-cat-${p.category}`, p.category), el('span', 'cm-title-text', p.title));
            const commentN = (p.comments || []).length;
            if (commentN) titleRow.append(el('span', 'cm-comment-n', `[${commentN}]`));
            if (Date.now() - p.createdAt < DAY) titleRow.append(el('span', 'cm-new', 'N'));

            const meta = el('span', 'cm-item-meta');
            meta.append(el('span', '', p.author), el('span', '', formatDate(p.createdAt)),
                el('span', '', `👁 ${p.views || 0}`), el('span', '', `❤️ ${p.likes || 0}`));
            main.append(titleRow, meta);
            btn.append(num, main);
            li.append(btn);
            return li;
        }));
        els.empty.hidden = list.length > 0;

        // 페이지 번호
        els.pagination.replaceChildren();
        if (pages > 1) {
            for (let n = 1; n <= pages; n++) {
                const b = el('button', 'cm-page' + (n === view.page ? ' active' : ''), String(n));
                b.type = 'button';
                b.dataset.page = n;
                if (n === view.page) b.setAttribute('aria-current', 'page');
                els.pagination.append(b);
            }
        }

        // 열려 있는 글도 새 내용으로
        if (openPostId && els.detailDialog.open) renderDetail();
    }

    // ---------- 글 보기 ----------
    const likedSet = () => new Set(readJSON(localStorage, LIKED_KEY, []));

    function renderDetail() {
        const p = posts.find(x => x.id === openPostId);
        if (!p) { closeDialog(els.detailDialog); return; }
        els.detailCategory.textContent = p.category;
        els.detailCategory.className = `cm-badge cm-cat-${p.category}`;
        els.detailTitle.textContent = p.title;
        els.detailMeta.textContent = `${p.author} · ${formatDate(p.createdAt)} · 조회 ${p.views || 0}`;
        els.detailContent.textContent = p.content;

        const liked = likedSet().has(p.id);
        els.likeBtn.firstChild.textContent = liked ? '❤️ 좋아요 ' : '🤍 좋아요 ';
        els.likeBtn.setAttribute('aria-pressed', String(liked));
        els.likeBtn.classList.toggle('liked', liked);
        els.likeCount.textContent = p.likes || 0;

        const comments = p.comments || [];
        els.commentCount.textContent = comments.length;
        els.commentList.replaceChildren(...comments.map(c => {
            const li = el('li', 'cm-comment');
            const head = el('div', 'cm-comment-head');
            head.append(el('strong', '', c.author), el('span', '', formatDate(c.createdAt)));
            li.append(head, el('p', '', c.content));
            return li;
        }));
        if (!comments.length) els.commentList.append(el('li', 'cm-comment-empty', '아직 댓글이 없어요.'));
    }

    async function openDetail(id) {
        openPostId = id;
        els.deleteForm.hidden = true;
        els.deleteError.textContent = els.commentError.textContent = '';
        els.deletePassword.value = '';
        if (!posts.some(p => p.id === id)) return;
        renderDetail();
        if (!els.detailDialog.open) els.detailDialog.showModal();
        history.replaceState(null, '', `#post-${id}`);

        // 조회수: 같은 창에서는 한 번만 센다
        const viewed = readJSON(sessionStorage, VIEWED_KEY, []);
        if (!viewed.includes(id)) {
            writeJSON(sessionStorage, VIEWED_KEY, [...viewed, id]);
            await mutate(all => {
                const p = all.find(x => x.id === id);
                if (!p) return false;
                p.views = (p.views || 0) + 1;
            });
        }
    }

    function closeDialog(dialog) {
        if (dialog.open) dialog.close();
    }

    els.detailDialog.addEventListener('close', () => {
        openPostId = null;
        if (location.hash.startsWith('#post-')) history.replaceState(null, '', location.pathname + location.search);
    });

    // ---------- 글쓰기 ----------
    els.writeBtn.addEventListener('click', () => {
        els.writeForm.reset();
        els.writeError.textContent = '';
        els.contentCount.textContent = '0 / 2000';
        els.author.value = readJSON(localStorage, 'communityNickname', '');
        els.writeDialog.showModal();
        (els.author.value ? els.title : els.author).focus();
    });

    els.content.addEventListener('input', () => {
        els.contentCount.textContent = `${els.content.value.length} / 2000`;
    });

    els.writeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = els.author.value.trim();
        const password = els.password.value;
        const title = els.title.value.trim();
        const content = els.content.value.trim();
        const problem =
            !author ? ['닉네임을 입력해 주세요.', els.author] :
            password.length < 4 ? ['비밀번호는 4자 이상이어야 해요.', els.password] :
            !title ? ['제목을 입력해 주세요.', els.title] :
            !content ? ['내용을 입력해 주세요.', els.content] : null;
        if (problem) {
            els.writeError.textContent = problem[0];
            problem[1].focus();
            return;
        }

        const id = newId();
        const post = {
            id, author, title, content,
            category: els.category.value,
            passwordHash: hashPassword(id, password),
            createdAt: Date.now(),
            views: 0, likes: 0, comments: []
        };
        writeJSON(localStorage, 'communityNickname', author);
        await mutate(all => { all.push(post); });
        closeDialog(els.writeDialog);
        // 새 글이 보이도록 처음 화면으로
        Object.assign(view, { category: '전체', query: '', sort: 'new', page: 1 });
        els.search.value = '';
        els.sort.value = 'new';
        setActiveTab('전체');
        render();
        openDetail(id);
    });

    // ---------- 좋아요 / 삭제 / 댓글 ----------
    els.likeBtn.addEventListener('click', async () => {
        const id = openPostId;
        if (!id) return;
        const liked = likedSet();
        const wasLiked = liked.has(id);
        wasLiked ? liked.delete(id) : liked.add(id);
        writeJSON(localStorage, LIKED_KEY, [...liked]);
        await mutate(all => {
            const p = all.find(x => x.id === id);
            if (!p) return false;
            p.likes = Math.max(0, (p.likes || 0) + (wasLiked ? -1 : 1));
        });
    });

    els.deleteToggle.addEventListener('click', () => {
        els.deleteForm.hidden = !els.deleteForm.hidden;
        els.deleteError.textContent = '';
        if (!els.deleteForm.hidden) els.deletePassword.focus();
    });

    els.deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = openPostId;
        const post = posts.find(p => p.id === id);
        if (!post) return;
        if (hashPassword(id, els.deletePassword.value) !== post.passwordHash) {
            els.deleteError.textContent = '비밀번호가 맞지 않아요.';
            els.deletePassword.select();
            return;
        }
        closeDialog(els.detailDialog);
        await mutate(all => {
            const i = all.findIndex(p => p.id === id);
            if (i < 0) return false;
            all.splice(i, 1);
        });
    });

    els.commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = openPostId;
        const author = els.commentAuthor.value.trim();
        const content = els.commentContent.value.trim();
        if (!author || !content) {
            els.commentError.textContent = !author ? '닉네임을 입력해 주세요.' : '댓글 내용을 입력해 주세요.';
            (!author ? els.commentAuthor : els.commentContent).focus();
            return;
        }
        els.commentError.textContent = '';
        writeJSON(localStorage, 'communityNickname', author);
        await mutate(all => {
            const p = all.find(x => x.id === id);
            if (!p) return false;
            (p.comments = p.comments || []).push({ id: newId(), author, content, createdAt: Date.now() });
        });
        els.commentContent.value = '';
        els.commentContent.focus();
    });

    // ---------- 목록 조작 ----------
    function setActiveTab(category) {
        els.tabs.querySelectorAll('.cm-tab').forEach(t => {
            const on = t.dataset.category === category;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', String(on));
        });
    }

    els.tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.cm-tab');
        if (!tab) return;
        view.category = tab.dataset.category;
        view.page = 1;
        setActiveTab(view.category);
        render();
    });

    els.search.addEventListener('input', () => {
        view.query = els.search.value.trim();
        view.page = 1;
        render();
    });

    els.sort.addEventListener('change', () => {
        view.sort = els.sort.value;
        view.page = 1;
        render();
    });

    els.list.addEventListener('click', (e) => {
        const btn = e.target.closest('.cm-item-btn');
        if (btn) openDetail(btn.dataset.id);
    });

    els.pagination.addEventListener('click', (e) => {
        const b = e.target.closest('.cm-page');
        if (!b) return;
        view.page = Number(b.dataset.page);
        render();
        els.list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 창 닫기: ✕/취소 버튼, 바깥(어두운 곳) 클릭
    document.querySelectorAll('.cm-dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]') || e.target === dialog) closeDialog(dialog);
        });
    });

    // ---------- 처음 방문하면 보여 줄 예시 글 ----------
    function samplePosts() {
        const now = Date.now();
        const make = (category, title, content, author, ago, extra = {}) => {
            const id = newId();
            return {
                id, category, title, content, author,
                passwordHash: hashPassword(id, 'sample'),
                createdAt: now - ago, views: 0, likes: 0, comments: [], ...extra
            };
        };
        return [
            make('자유', '커뮤니티 게시판을 열었어요 🎉',
                '포트폴리오를 보러 와 주셔서 감사합니다!\n궁금한 점이나 하고 싶은 말을 자유롭게 남겨 주세요.',
                '황 휘', 3 * DAY, { views: 12, likes: 3 }),
            make('질문', '포트폴리오는 어떤 기술로 만들었나요?',
                'HTML, CSS, JavaScript만으로 만든 건가요?', '방문자1', 2 * DAY,
                { views: 7, comments: [{ id: newId(), author: '황 휘', content: '네! 프레임워크 없이 HTML·CSS·JavaScript로 만들었어요.', createdAt: now - 2 * DAY + 3600000 }] }),
            make('응원', '디자인 깔끔하네요', '메뉴에 마우스를 올리면 글자가 바뀌는 효과가 재밌어요 👍',
                '지나가던 개발자', 5 * 3600000, { views: 4, likes: 2 })
        ];
    }

    // ---------- 시작 ----------
    (async () => {
        posts = await loadPosts();
        if (posts.length === 0 && !readJSON(localStorage, SEEDED_KEY, false)) {
            posts = samplePosts();
            writeJSON(localStorage, SEEDED_KEY, true);
            await savePosts();
        }
        renderStatus();
        render();
        const m = location.hash.match(/^#post-(.+)$/);
        if (m) openDetail(decodeURIComponent(m[1]));
    })();
})();
