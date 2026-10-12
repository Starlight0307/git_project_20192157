// ----------------------------------------------------
// 서브 페이지: 하이라이트 영상 목록 (highlights.html)
// ----------------------------------------------------

async function fetchHighlights() {
    const container = document.getElementById('highlights-container');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center text-white-50 py-5"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i><p>F1 공식 채널에서 \'Formula 1 Highlights\'를 검색 중입니다...</p></div>';

    const API_KEY = "AIzaSyAia4lLWN40iqFoyGDrpCCyUqGFdeOIoto"; 
    const CHANNEL_ID = "UCB_qr75-ydFVKSF9Dmo6izg"; // F1 공식 채널 ID
    const SEARCH_QUERY = "Formula 1 Highlights"; // 검색 키워드
    const MAX_RESULTS = 6; // 가져올 영상 개수

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(SEARCH_QUERY)}&type=video`;

    try {
        if (API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
            throw new Error("YouTube API 키가 아직 입력되지 않았습니다.");
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            container.innerHTML = '';

            data.items.forEach((item, index) => {
                const videoId = item.id.videoId;
                const snippet = item.snippet;
                const title = snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
                const uploadDate = snippet.publishedAt.split('T')[0]; 
                
                const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                const fallbackThumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

                const badgeText = index === 0 ? "NEW LATEST" : "RACE HIGHLIGHT";
                const badgeColor = index === 0 ? "#e10600" : "#333333";

                container.insertAdjacentHTML('beforeend', `
                    <div class="col-md-6 col-lg-4">
                        <div class="video-card h-100 d-flex flex-column" onclick="window.open('${watchUrl}', '_blank')">
                            
                            <div class="thumbnail-container">
                                <img src="${thumbUrl}" alt="Thumbnail" onerror="this.src='${fallbackThumbUrl}'">
                                <i class="fa-brands fa-youtube play-overlay"></i>
                            </div>

                            <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge" style="background-color: ${badgeColor};">${badgeText}</span>
                                        <i class="fa-brands fa-youtube text-white-50 fs-5"></i>
                                    </div>
                                    <h5 class="fw-bold text-white m-0" style="line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                        ${title}
                                    </h5>
                                </div>
                                <div class="mt-3 d-flex justify-content-between align-items-center text-white-50 small font-noto">
                                    <span>Formula 1 공식 채널</span>
                                    <span>${uploadDate}</span>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                `);
            });
        } else {
            throw new Error("검색 결과가 없거나 API 요청 한도를 초과했습니다.");
        }
        
    } catch (error) { 
        console.warn("API 검색 실패 (키 누락 등). 예비 하이라이트 데이터를 출력합니다.", error.message);
        
        const fallbackVideos = [
            { title: "Race Highlights | 2024 Sao Paulo Grand Prix", id: "gbxJT-yBdcs", date: "2024-11-03" },
            { title: "Race Highlights | 2024 Mexico City Grand Prix", id: "3efwPrjwNVY", date: "2024-10-27" },
            { title: "Race Highlights | 2024 United States Grand Prix", id: "kLCytMTycxI", date: "2024-10-20" },
            { title: "Race Highlights | 2024 Singapore Grand Prix", id: "slCskHrI_Vg", date: "2024-09-22" },
            { title: "Race Highlights | 2024 Hungarian Grand Prix", id: "YJ0NYHONwts", date: "2024-07-21" },
            { title: "Race Highlights | 2024 Bahrain Grand Prix", id: "9Y5wMpKXNK4", date: "2024-03-02" }
        ];

        container.innerHTML = ''; 

        fallbackVideos.forEach((video, index) => {
            const thumbUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
            const fallbackThumbUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

            const badgeText = index === 0 ? "NEW LATEST" : "RACE HIGHLIGHT";
            const badgeColor = index === 0 ? "#e10600" : "#333333";

            container.insertAdjacentHTML('beforeend', `
                <div class="col-md-6 col-lg-4">
                    <div class="video-card h-100 d-flex flex-column" onclick="window.open('${watchUrl}', '_blank')">
                        <div class="thumbnail-container">
                            <img src="${thumbUrl}" alt="Thumbnail" onerror="this.src='${fallbackThumbUrl}'">
                            <i class="fa-brands fa-youtube play-overlay"></i>
                        </div>
                        <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <span class="badge" style="background-color: ${badgeColor};">${badgeText}</span>
                                    <i class="fa-brands fa-youtube text-white-50 fs-5"></i>
                                </div>
                                <h5 class="fw-bold text-white m-0" style="line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${video.title}
                                </h5>
                            </div>
                            <div class="mt-3 d-flex justify-content-between align-items-center text-white-50 small font-noto">
                                <span>Formula 1 공식 채널</span>
                                <span>${video.date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }
}