// ----------------------------------------------------
// 배경음악 플레이어 (모든 페이지 공통) — 모양은 css/bgm.css
// ----------------------------------------------------
// - 왼쪽 아래 동그란 버튼을 누르면 플레이어가 열림
// - 곡·재생 위치·볼륨을 브라우저에 저장해서 다른 페이지로 가도 이어서 재생
// - 브라우저가 소리 자동재생을 막으면, 화면을 처음 누를 때 이어서 재생
//
// 곡 종류 두 가지
//  1) yt  : F1 공식 테마곡 — 저작권 때문에 파일로 넣을 수 없어서, 공식 채널이 올린 유튜브 영상을
//           유튜브 플레이어(IFrame API)로 재생한다. 유튜브 정책상 플레이어는 화면에 200×200 이상으로
//           보여야 해서, 패널 안에 영상이 보이고 패널을 닫으면 작은 영상 창으로 남는다.
//  2) src : 무료 음악 mp3 — Kevin MacLeod (incompetech.com), CC BY 4.0 (출처 표시 조건, music/CREDITS.txt)
// + 'F1 THE MOVIE' 탭: 영화 사운드트랙(F1 The Album)은 음반사가 유튜브 임베드를 모두 막아 두어서(오류 150)
//   Spotify 공식 임베드 플레이어로 앨범 전체를 보여준다. Spotify에 로그인 안 했으면 곡마다 30초 미리듣기,
//   로그인했으면 전곡 재생. Spotify가 재생되면 위 배경음악은 자동으로 멈춘다(반대도 마찬가지).
(() => {
    const SPOTIFY_ALBUM = 'spotify:album:2HwRKkEp7jXbxXwcGyZYHK';   // F1 The Album (2025)
    const PLAYLIST = [
        // 작곡가 Brian Tyler 공식 채널 영상 (FORMULA 1 채널 영상은 다른 사이트 재생이 막혀 있음 — 오류 150)
        { title: 'F1 Official Theme (Live in Concert)', artist: 'Brian Tyler (YouTube)', yt: '8AYy-BcjRXg', length: '3:28', official: true },
        { title: 'F1 Official Theme (Live in LA)', artist: 'Brian Tyler (YouTube)', yt: 'JqbHg1NV4TM', length: '3:25', official: true },
        { title: 'Volatile Reaction', artist: 'Kevin MacLeod', src: 'music/volatile-reaction.mp3', length: '2:45' },
        { title: 'Rocket', artist: 'Kevin MacLeod', src: 'music/rocket.mp3', length: '2:27' },
        { title: 'Movement Proposition', artist: 'Kevin MacLeod', src: 'music/movement-proposition.mp3', length: '2:21' },
        { title: 'Power Restored', artist: 'Kevin MacLeod', src: 'music/power-restored.mp3', length: '1:13' }
    ];
    const KEY = 'f1_bgm_state';

    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
    const saved = load();
    const state = {
        index: Math.min(Math.max(saved.index || 0, 0), PLAYLIST.length - 1),
        time: saved.time || 0,
        volume: typeof saved.volume === 'number' ? saved.volume : 0.35,
        muted: !!saved.muted,
        repeat: saved.repeat !== false,     // 기본: 목록 반복
        shuffle: !!saved.shuffle,
        playing: !!saved.playing,
        open: false
    };

    // ---------- 화면 ----------
    const root = document.createElement('div');
    root.className = 'bgm';
    root.innerHTML = `
        <div class="bgm-panel" role="dialog" aria-label="배경음악 플레이어">
            <div class="bgm-eyebrow">NOW PLAYING <button type="button" class="bgm-close" aria-label="플레이어 닫기"><i class="fa-solid fa-chevron-down"></i></button></div>
            <div class="bgm-tabs" role="tablist">
                <button type="button" class="bgm-tab is-active" data-tab="list" role="tab">PLAYLIST</button>
                <button type="button" class="bgm-tab" data-tab="movie" role="tab">🎬 F1 THE MOVIE</button>
            </div>
            <div class="bgm-movie" hidden>
                <div class="bgm-movie-head">
                    <strong>F1 The Album</strong>
                    <span>영화 〈F1 더 무비〉 OST · Atlantic Records (2025)</span>
                </div>
                <div class="bgm-spotify"><div id="bgm-spotify-embed"></div><div class="bgm-spotify-loading"><i class="fa-brands fa-spotify"></i> Spotify 불러오는 중...</div></div>
                <p class="bgm-movie-note"><i class="fa-brands fa-spotify"></i> Spotify 로그인 전에는 곡마다 30초 미리듣기, 로그인하면 전곡을 들을 수 있어요.</p>
            </div>
            <div class="bgm-main">
            <div class="bgm-now">
                <div class="bgm-wheel" aria-hidden="true"></div>
                <div style="min-width:0">
                    <div class="bgm-title"></div>
                    <div class="bgm-artist"></div>
                </div>
            </div>
            <div class="bgm-yt-slot"></div>
            <div class="bgm-progress" role="slider" aria-label="재생 위치" tabindex="0"><div class="bgm-progress-fill"></div></div>
            <div class="bgm-time"><span class="bgm-cur">0:00</span><span class="bgm-dur">0:00</span></div>
            <div class="bgm-controls">
                <button type="button" class="bgm-btn bgm-shuffle" aria-label="섞어 듣기"><i class="fa-solid fa-shuffle"></i></button>
                <button type="button" class="bgm-btn bgm-prev" aria-label="이전 곡"><i class="fa-solid fa-backward-step"></i></button>
                <button type="button" class="bgm-btn bgm-play" aria-label="재생"><i class="fa-solid fa-play"></i></button>
                <button type="button" class="bgm-btn bgm-next" aria-label="다음 곡"><i class="fa-solid fa-forward-step"></i></button>
                <button type="button" class="bgm-btn bgm-repeat" aria-label="목록 반복"><i class="fa-solid fa-repeat"></i></button>
            </div>
            <div class="bgm-volume-row">
                <button type="button" class="bgm-btn bgm-mute" aria-label="음소거"><i class="fa-solid fa-volume-high"></i></button>
                <input type="range" class="bgm-volume" min="0" max="1" step="0.01" aria-label="볼륨">
            </div>
            <ul class="bgm-list"></ul>
            </div>
            <div class="bgm-credit">
                🏁 Official Theme: Brian Tyler · © Formula One Group — 공식 유튜브 영상 재생<br>
                🎬 F1 The Album © Atlantic Records — Spotify 공식 임베드<br>
                Music by Kevin MacLeod (<a href="https://incompetech.com" target="_blank" rel="noopener">incompetech.com</a>) ·
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>
            </div>
        </div>
        <div class="bgm-yt-box" hidden>
            <button type="button" class="bgm-yt-close" aria-label="영상 멈추고 닫기"><i class="fa-solid fa-xmark"></i></button>
            <div id="bgm-yt-player"></div>
        </div>
        <button type="button" class="bgm-fab" aria-label="배경음악 플레이어 열기" aria-expanded="false">
            <i class="fa-solid fa-music"></i>
            <span class="bgm-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        </button>
        <span class="bgm-hint">🎵 화면을 누르면 음악이 이어져요</span>
    `;
    document.body.appendChild(root);

    const $ = (sel) => root.querySelector(sel);
    const els = {
        fab: $('.bgm-fab'), close: $('.bgm-close'), title: $('.bgm-title'), artist: $('.bgm-artist'),
        progress: $('.bgm-progress'), fill: $('.bgm-progress-fill'), cur: $('.bgm-cur'), dur: $('.bgm-dur'),
        play: $('.bgm-play'), prev: $('.bgm-prev'), next: $('.bgm-next'), shuffle: $('.bgm-shuffle'),
        repeat: $('.bgm-repeat'), mute: $('.bgm-mute'), volume: $('.bgm-volume'), list: $('.bgm-list'),
        ytBox: $('.bgm-yt-box'), ytSlot: $('.bgm-yt-slot'), ytClose: $('.bgm-yt-close'),
        main: $('.bgm-main'), movie: $('.bgm-movie'), spotifyLoading: $('.bgm-spotify-loading')
    };
    els.volume.value = state.volume;

    els.list.innerHTML = PLAYLIST.map((t, i) => `
        <li><button type="button" data-i="${i}">
            <span class="bgm-no">${String(i + 1).padStart(2, '0')}</span>
            ${t.official ? '<i class="fa-brands fa-youtube bgm-yt-icon" aria-label="유튜브"></i>' : ''}${t.title}
            <span class="bgm-len">${t.length}</span>
        </button></li>
    `).join('');

    const fmt = (s) => {
        if (!isFinite(s) || s < 0) return '0:00';
        s = Math.floor(s);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    // ---------- 재생기 1: mp3 ----------
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = state.volume;
    audio.muted = state.muted;

    // ---------- 재생기 2: 유튜브 ----------
    let yt = null;              // YT.Player
    let ytReady = null;         // Promise
    let ytPlaying = false;
    let ytPoll = null;

    function loadYouTubeApi() {
        if (ytReady) return ytReady;
        ytReady = new Promise((resolve) => {
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
            const s = document.createElement('script');
            s.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(s);
        }).then(() => new Promise((resolve) => {
            yt = new YT.Player('bgm-yt-player', {
                width: '100%',
                height: '100%',
                playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
                events: {
                    onReady: () => resolve(),
                    onStateChange: (e) => {
                        ytPlaying = e.data === YT.PlayerState.PLAYING;
                        if (ytPlaying) root.classList.remove('show-hint');
                        if (e.data === YT.PlayerState.ENDED) onEnded();
                        updateUI();
                        save();
                    },
                    onError: () => { els.artist.textContent = '이 영상을 재생할 수 없어요 (다음 곡으로)'; setTimeout(() => goNext(), 1500); }
                }
            });
        }));
        return ytReady;
    }

    // ---------- 공통 조작 ----------
    const cur = () => PLAYLIST[state.index];
    const isYt = () => !!cur().yt;
    const isPlaying = () => (isYt() ? ytPlaying : !audio.paused);
    const getTime = () => (isYt() ? (yt && yt.getCurrentTime ? yt.getCurrentTime() : 0) : audio.currentTime);
    const getDuration = () => (isYt() ? (yt && yt.getDuration ? yt.getDuration() : 0) : audio.duration);

    function applyVolume() {
        audio.volume = state.volume;
        audio.muted = state.muted;
        if (yt && yt.setVolume) {
            yt.setVolume(Math.round(state.volume * 100));
            state.muted ? yt.mute() : yt.unMute();
        }
    }

    function save() {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                index: state.index, time: getTime() || 0, volume: state.volume, muted: state.muted,
                repeat: state.repeat, shuffle: state.shuffle, playing: isPlaying()
            }));
        } catch (e) { /* 저장 못 해도 재생은 됨 */ }
    }

    function updateUI() {
        const track = cur();
        const playing = isPlaying();
        els.title.textContent = track.title;
        els.artist.textContent = track.artist;
        root.classList.toggle('is-playing', playing || spotifyPlaying);
        root.classList.toggle('is-yt', isYt());
        els.play.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        els.play.setAttribute('aria-label', playing ? '일시정지' : '재생');
        els.shuffle.classList.toggle('is-on', state.shuffle);
        els.repeat.classList.toggle('is-on', state.repeat);
        els.mute.innerHTML = state.muted || state.volume === 0 ? '<i class="fa-solid fa-volume-xmark"></i>' : (state.volume < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');
        els.list.querySelectorAll('button').forEach(b => b.classList.toggle('is-current', Number(b.dataset.i) === state.index));
        placeYouTubeBox();
    }

    // 유튜브 영상 위치: 패널이 열려 있으면 패널 안, 닫혀 있고 재생 중이면 작은 영상 창
    function placeYouTubeBox() {
        // 패널의 PLAYLIST 탭이 보일 때만 패널 안, 아니면(닫힘·영화 탭) 재생 중일 때 작은 영상 창
        const inPanel = state.open && !root.classList.contains('is-movie');
        const show = isYt() && (inPanel || ytPlaying);
        els.ytBox.hidden = !show;
        root.classList.toggle('yt-docked', show && !inPanel);
        if (show && inPanel && els.ytBox.parentElement !== els.ytSlot) els.ytSlot.appendChild(els.ytBox);
        if (show && !inPanel && els.ytBox.parentElement !== root) root.insertBefore(els.ytBox, els.fab);
    }

    function updateProgress() {
        const d = getDuration();
        const t = getTime();
        els.fill.style.width = d ? `${(t / d) * 100}%` : '0%';
        els.cur.textContent = fmt(t);
        els.dur.textContent = fmt(d);
    }

    async function loadTrack(i, startAt = 0) {
        // 다른 재생기는 멈춤
        audio.pause();
        if (yt && yt.stopVideo) yt.stopVideo();
        ytPlaying = false;
        clearInterval(ytPoll);

        state.index = (i + PLAYLIST.length) % PLAYLIST.length;
        const track = cur();
        updateUI();
        updateProgress();

        if (track.yt) {
            audio.removeAttribute('src');
            await loadYouTubeApi();
            applyVolume();
            yt.cueVideoById({ videoId: track.yt, startSeconds: Math.floor(startAt) });
            ytPoll = setInterval(() => { if (isYt()) updateProgress(); }, 500);
        } else {
            audio.src = track.src;
            if (startAt > 0) audio.addEventListener('loadedmetadata', () => { audio.currentTime = Math.min(startAt, audio.duration - 1); }, { once: true });
        }
        updateUI();
    }

    async function play() {
        if (spotify && spotifyPlaying) spotify.pause();
        if (isYt()) {
            await loadYouTubeApi();
            yt.playVideo();
            return;
        }
        try {
            await audio.play();
            root.classList.remove('show-hint');
        } catch (e) { updateUI(); throw e; }
    }

    function pause() {
        if (isYt()) { if (yt && yt.pauseVideo) yt.pauseVideo(); } else audio.pause();
    }

    const toggle = () => (isPlaying() ? pause() : play().catch(() => {}));

    function nextIndex(step) {
        if (state.shuffle && PLAYLIST.length > 1) {
            let n;
            do { n = Math.floor(Math.random() * PLAYLIST.length); } while (n === state.index);
            return n;
        }
        return state.index + step;
    }

    async function goNext() { await loadTrack(nextIndex(1)); play().catch(() => {}); }

    function onEnded() {
        const last = !state.shuffle && state.index === PLAYLIST.length - 1;
        if (last && !state.repeat) { updateUI(); save(); return; }
        goNext();
    }

    function seekTo(sec) {
        if (isYt()) { if (yt && yt.seekTo) yt.seekTo(sec, true); } else audio.currentTime = sec;
        updateProgress();
    }

    // ---------- Spotify (F1 THE MOVIE 탭) ----------
    let spotify = null;          // Spotify EmbedController
    let spotifyPlaying = false;
    let spotifyRequested = false;

    function loadSpotify() {
        if (spotifyRequested) return;
        spotifyRequested = true;
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            IFrameAPI.createController(document.getElementById('bgm-spotify-embed'),
                { uri: SPOTIFY_ALBUM, width: '100%', height: 352 },
                (controller) => {
                    spotify = controller;
                    controller.addListener('ready', () => { els.spotifyLoading.hidden = true; });
                    controller.addListener('playback_update', (e) => {
                        const nowPlaying = !e.data.isPaused && !e.data.isBuffering;
                        if (nowPlaying && !spotifyPlaying && isPlaying()) pause();   // 스포티파이가 켜지면 배경음악 멈춤
                        spotifyPlaying = nowPlaying;
                        updateUI();
                    });
                });
        };
        const s = document.createElement('script');
        s.src = 'https://open.spotify.com/embed/iframe-api/v1';
        s.async = true;
        s.onerror = () => { els.spotifyLoading.textContent = 'Spotify를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'; };
        document.head.appendChild(s);
    }

    function switchTab(tab) {
        root.querySelectorAll('.bgm-tab').forEach(b => {
            const on = b.dataset.tab === tab;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-selected', String(on));
        });
        const movie = tab === 'movie';
        els.movie.hidden = !movie;
        els.main.hidden = movie;
        root.classList.toggle('is-movie', movie);
        placeYouTubeBox();
        if (movie) loadSpotify();
    }
    root.querySelectorAll('.bgm-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

    // ---------- 버튼 ----------
    const setOpen = (open) => {
        state.open = open;
        root.classList.toggle('is-open', open);
        els.fab.setAttribute('aria-expanded', String(open));
        placeYouTubeBox();
    };
    els.fab.addEventListener('click', () => setOpen(!state.open));
    els.close.addEventListener('click', () => setOpen(false));
    els.ytClose.addEventListener('click', () => { pause(); setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) setOpen(false); });
    document.addEventListener('click', (e) => { if (state.open && !root.contains(e.target)) setOpen(false); });

    els.play.addEventListener('click', toggle);
    els.prev.addEventListener('click', async () => {
        // 3초 넘게 들었으면 처음으로, 아니면 이전 곡
        if (getTime() > 3) { seekTo(0); return; }
        await loadTrack(nextIndex(-1));
        play().catch(() => {});
    });
    els.next.addEventListener('click', goNext);
    els.shuffle.addEventListener('click', () => { state.shuffle = !state.shuffle; updateUI(); save(); });
    els.repeat.addEventListener('click', () => { state.repeat = !state.repeat; updateUI(); save(); });
    els.mute.addEventListener('click', () => { state.muted = !state.muted; applyVolume(); updateUI(); save(); });
    els.volume.addEventListener('input', () => { state.volume = Number(els.volume.value); state.muted = false; applyVolume(); updateUI(); save(); });
    els.list.addEventListener('click', async (e) => {
        const b = e.target.closest('button[data-i]');
        if (!b) return;
        await loadTrack(Number(b.dataset.i));
        play().catch(() => {});
    });

    const seekByX = (clientX) => {
        const r = els.progress.getBoundingClientRect();
        const d = getDuration();
        if (d) seekTo(Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * d);
    };
    els.progress.addEventListener('click', (e) => seekByX(e.clientX));
    els.progress.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') seekTo(Math.min(getTime() + 5, getDuration() || 0));
        if (e.key === 'ArrowLeft') seekTo(Math.max(getTime() - 5, 0));
    });

    audio.addEventListener('play', () => { updateUI(); save(); });
    audio.addEventListener('pause', () => { updateUI(); save(); });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', () => { if (!isYt() && audio.getAttribute('src')) els.artist.textContent = '음악 파일을 불러오지 못했어요'; });

    // 다른 페이지로 갈 때 위치 저장
    window.addEventListener('pagehide', save);
    setInterval(() => { if (isPlaying()) save(); }, 3000);

    // ---------- 시작: 전 페이지에서 듣던 곡 이어 듣기 ----------
    (async () => {
        await loadTrack(state.index, state.time);
        if (!state.playing) return;
        try {
            if (isYt()) {
                // 유튜브는 소리 있는 자동재생이 거의 항상 막혀서, 바로 첫 클릭을 기다림
                throw new Error('need gesture');
            }
            await play();
        } catch (e) {
            root.classList.add('show-hint');
            const resume = (ev) => {
                ['pointerdown', 'keydown'].forEach(t => document.removeEventListener(t, resume, true));
                if (!root.contains(ev.target)) play().catch(() => {});   // 플레이어 버튼을 누른 경우는 그 버튼 동작에 맡김
                setTimeout(() => root.classList.remove('show-hint'), 300);
            };
            ['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, resume, true));
            setTimeout(() => root.classList.remove('show-hint'), 6000);
        }
    })();
})();
