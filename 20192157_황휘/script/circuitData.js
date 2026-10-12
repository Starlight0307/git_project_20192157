// ----------------------------------------------------
// F1 서킷 백그라운드 이미지 매핑 데이터
// ----------------------------------------------------
const heroImages = {
    "albert_park": "img/circuit/albertpark.png",
    "shanghai": "img/circuit/shanghai.png",
    "suzuka": "img/circuit/suzuka.jpg",   // 사진: Carlos Honda, Wikimedia Commons, CC BY 3.0
    "bahrain": "img/circuit/bahrain.png",
    "jeddah": "img/circuit/jeddah.png",
    "miami": "img/circuit/miami.png",
    "imola": "img/circuit/Imola.png",
    "monaco": "img/circuit/monaco.png",
    "catalunya": "img/circuit/catalunya.png",
    "villeneuve": "img/circuit/villeneuve.jpg",
    "red_bull_ring": "img/circuit/redbull.jpg",
    "silverstone": "img/circuit/silverstone.jpg",
    "spa": "img/circuit/spa.png",
    "hungaroring": "img/circuit/hungarian.png",
    "zandvoort": "img/circuit/zandvoort.png",
    "monza": "img/circuit/monza.png",
    "baku": "img/circuit/baku.jpg",
    "marina_bay": "img/circuit/marina.jpg",
    "americas": "img/circuit/america.jpg",
    "rodriguez": "img/circuit/rodriguez.png",
    "interlagos": "img/circuit/Interlagos.png",
    "vegas": "img/circuit/lasvegas.png",
    "losail": "img/circuit/lusail.png",
    "yas_marina": "img/circuit/yasmarina.png",
    "madrid": "img/circuit/madring.png", 
    "yeongam": "img/circuit/yeongam.png",
    "buddh": "img/circuit/buddh.png",
    "valencia": "img/circuit/valencia.png",
    "hockenheimring": "img/circuit/hockenheimring.png",
    "nurburgring": "img/circuit/nurburgring.png",
    "istanbul": "img/circuit/istanbul.png",
    "sepang": "img/circuit/sepang.png",
    "sochi": "img/circuit/sochi.png",
    "portimao": "img/circuit/portimao.png",
    "mugello": "img/circuit/mugello.png",
    "ricard": "img/circuit/ricard.png",

    // 기본 이미지
    "default": "img/circuit/default.jpg" 
};


// ----------------------------------------------------
// F1 서킷별 상세 가이드 데이터
// ----------------------------------------------------
const circuitGuidesData = {
    "albert_park": { corners: 14, ot_zone_2026: "수동 오버라이드 모드(MGU-K)를 활용한 턴 9-10 진입 전 가속 구간", drs_zone: "턴 1 및 턴 3 진입을 위한 두 개의 연속된 DRS 존", features: "호주 멜버른의 공용 도로를 사용하는 스트릿 서킷 특성상 에어로 다이내믹 밸런스가 매우 중요합니다." },
    "bahrain": { corners: 15, ot_zone_2026: "X-모드(저항 감소)를 극대화할 수 있는 메인 스트레이트 끝 턴 1 진입", drs_zone: "메인 스트레이트 및 턴 10 진입 전 백 스트레이트의 트리플 DRS 존", features: "사막 모래로 인한 타이어 마모가 심해 타이어 관리 능력이 승패를 좌우합니다." },
    "shanghai": { corners: 16, ot_zone_2026: "1.1km 롱 스트레이트 끝 턴 14 헤어핀 진입구간 Z-모드 전환", drs_zone: "초장거리 백 스트레이트 끝 턴 14 헤어핀", features: "가장 긴 직선 주간과 타이어 부하가 극심한 턴 1-2 달팽이 코너를 가집니다." },
    "suzuka": { corners: 18, ot_zone_2026: "130R 고속 코너 이후 이어지는 카시오 트라이앵글(시케인)", drs_zone: "메인 스트레이트 턴 1 진입 구간 단일 DRS 존", features: "8자형 크로스오버 구조를 가진 세계 최고 난이도의 클래식 서킷입니다." },
    "jeddah": { corners: 27, ot_zone_2026: "마지막 코너(턴 27) 탈출 후 메인 스트레이트 구간", drs_zone: "턴 20-22, 턴 25-27, 메인 스트레이트 등 3개의 연속 DRS 존", features: "F1 캘린더에서 가장 빠른 스트릿 서킷으로, 벽이 가깝고 블라인드 고속 코너가 많아 아찔한 레이스가 펼쳐집니다." },
    "miami": { corners: 19, ot_zone_2026: "턴 17 진입 전 1.2km 롱 스트레이트에서의 능동형 에어로 전개", drs_zone: "턴 11~17 사이의 긴 직선 구간 및 메인 스트레이트", features: "하드록 스타디움 주변을 도는 복합적인 노면 그립을 가진 마이애미의 서킷입니다." },
    "imola": { corners: 19, ot_zone_2026: "탐부렐로 시케인 진입 전 메인 스트레이트의 수동 MGU-K 전개", drs_zone: "리바차(Rivazza) 코너 이후부터 턴 2(탐부렐로)까지 이어지는 유일한 DRS 존", features: "매우 좁고 올드스쿨적인 레이아웃으로, 예선 성적이 레이스 결과를 크게 좌우합니다." },
    "monaco": { corners: 19, ot_zone_2026: "터널 통과 후 시케인 (수동 오버라이드의 의미가 가장 적은 서킷)", drs_zone: "메인 스트레이트 (하지만 트랙이 좁아 사실상 추월 불가에 가까움)", features: "가장 느리지만 가장 정교한 드라이빙이 요구되는 F1의 크라운 주얼 서킷입니다." },
    "catalunya": { corners: 14, ot_zone_2026: "메인 스트레이트 끝 턴 1", drs_zone: "메인 스트레이트 끝 턴 1 및 백 스트레이트 끝 턴 10", features: "오랫동안 스페인 GP를 개최해온 서킷입니다. 2026년부터 스페인 GP의 타이틀은 마드리드로 넘어가지만, 서킷 자체의 완성도가 높아 테스트 트랙으로 여전히 사랑받습니다." },
    "madrid": { 
        corners: 22, 
        ot_zone_2026: "턴 12(라 모누멘탈) 탈출 후 이어지는 초고속 구간 및 직선", 
        drs_zone: "IFEMA 직선 구간 및 메인 스트레이트", 
        features: "2026년 스페인 GP의 새로운 주인공 매드링(MADRING)입니다. 10m 높이의 웅장한 뱅크각 코너인 '라 모누멘탈'이 상징적이며, 전시장 인프라와 공도를 결합한 최첨단 하이브리드 스트릿 레이아웃(22개 코너)을 가집니다." 
    },
    "villeneuve": { corners: 14, ot_zone_2026: "코너 13-14 사이의 카지노 스트레이트 X-모드 활성화 구간", drs_zone: "카지노 스트레이트 및 메인 스트레이트 연속 DRS", features: "연석을 강하게 타야 하며, 벽이 가까워 '월 오브 챔피언스'로 유명한 캐나다 몬트리올의 서킷입니다." },
    "red_bull_ring": { corners: 10, ot_zone_2026: "턴 3 및 턴 4 진입 오르막 구간 수동 오버라이드 전개", drs_zone: "턴 1, 턴 3, 턴 4 진입 전 연속 3개의 DRS 존", features: "가장 짧은 랩타임을 가지며 고도차가 매우 심각한 오스트리아의 파워 서킷입니다." },
    "silverstone": { corners: 18, ot_zone_2026: "스토우 코너 및 브룩랜즈 코너 진입 전 가속 구간", drs_zone: "웰링턴 스트레이트 및 행거 스트레이트", features: "마곳-베켓-채플로 이어지는 초고속 코너링이 에어로 규정을 뼈저리게 시험하는 영국의 서킷입니다." },
    "spa": { corners: 19, ot_zone_2026: "오루즈 통과 후 케멜 스트레이트 끝 레콤브 코너", drs_zone: "케멜 스트레이트 및 메인 스트레이트", features: "오루즈/라디옹의 압도적인 고도차와 날씨 변수가 특징인 벨기에의 전설적인 서킷입니다." },
    "hungaroring": { corners: 14, ot_zone_2026: "메인 스트레이트 끝 턴 1", drs_zone: "메인 스트레이트 턴 1 진입 전 및 턴 2 진입 전", features: "먼지가 많고 코너가 쉼없이 이어져 '벽 없는 모나코'로 불리는 헝가리의 서킷입니다." },
    "zandvoort": { corners: 14, ot_zone_2026: "뱅크각을 살린 마지막 코너 이탈 후 타잔 코너(턴 1) 진입", drs_zone: "메인 스트레이트(타잔 코너 진입 전)", features: "뱅크각(기울기)이 있는 코너가 특징이며 매우 올드스쿨한 네덜란드의 레이아웃입니다." },
    "monza": { corners: 11, ot_zone_2026: "파라볼리카 탈출 후 턴 1 레티필로 시케인 진입 구간", drs_zone: "메인 스트레이트 및 아스카리 시케인 진입 전", features: "마법의 성전. 최고 속도를 겨루는 극한의 로우 다운포스를 가진 이탈리아의 서킷입니다." },
    "baku": { corners: 20, ot_zone_2026: "2.2km 메인 스트레이트 끝 턴 1 진입 전 극한의 X-모드", drs_zone: "메인 스트레이트 및 턴 3 진입 전", features: "가장 긴 직선구간과 좁은 캐슬 섹션이 혼재된 아제르바이잔의 극단적인 스트릿 서킷입니다." },
    "marina_bay": { corners: 19, ot_zone_2026: "턴 7 또는 턴 14 진입 전", drs_zone: "턴 5 직후 및 턴 13 직후 스트레이트", features: "가장 덥고 습한 환경의 야간 레이스로 드라이버 체력 소모가 극심한 싱가포르의 서킷입니다." },
    "americas": { corners: 20, ot_zone_2026: "백 스트레이트 끝 턴 12 급제동 구간", drs_zone: "메인 스트레이트 및 턴 11 직후 롱 백 스트레이트", features: "극단적인 오르막의 턴 1과 전 세계 서킷의 특징을 섞어놓은 미국의 복합 서킷입니다." },
    "rodriguez": { corners: 17, ot_zone_2026: "메인 스트레이트 끝 턴 1", drs_zone: "메인 스트레이트 및 턴 3 진입 전 롱 스트레이트", features: "해발 2,200m 멕시코의 고지대로 공기 밀도가 낮아 2026 터보차저 효율이 핵심입니다." },
    "interlagos": { corners: 15, ot_zone_2026: "세나 S 코너 진입 전 및 턴 4 진입 오버라이드", drs_zone: "메인 스트레이트 턴 1(세나 S) 진입 전 및 턴 4 진입 전", features: "브라질의 반시계 방향 서킷이며 날씨 예측이 어려워 항상 드라마틱한 레이스가 펼쳐집니다." },
    "vegas": { corners: 17, ot_zone_2026: "라스베가스 스트립 1.9km 구간 끝 턴 14 제동 구간", drs_zone: "라스베가스 스트립 구간 및 메인 스트레이트", features: "추운 야간 사막 기후와 극단적인 롱 스트레이트로 타이어 온도 관리가 승패를 가릅니다." },
    "losail": { corners: 16, ot_zone_2026: "메인 스트레이트 끝 턴 1", drs_zone: "유일한 롱 메인 스트레이트", features: "카타르의 고속 중고속 코너가 쉼 없이 이어지는 모터사이클 친화적 서킷 레이아웃입니다." },
    "yas_marina": { corners: 16, ot_zone_2026: "백 스트레이트 끝 턴 6", drs_zone: "턴 5 탈출 후 긴 백 스트레이트 및 이어지는 두 번째 직선 구간", features: "시즌 피날레를 장식하며 매끄러운 노면과 화려한 조명이 특징인 아부다비 서킷입니다." },
    
    "yeongam": { corners: 18, ot_zone_2026: "턴 3 진입 전 1.2km 최장 직선 구간 끝", drs_zone: "턴 2 탈출 후 1.2km 직선 구간 끝 턴 3 진입", features: "2010년부터 2013년까지 코리아 그랑프리를 개최했던 전남 영암의 서킷입니다. 한국 전통 건축 양식을 본딴 한옥 육교가 특징입니다." },
    "buddh": { corners: 16, ot_zone_2026: "턴 3과 턴 4 사이의 백 스트레이트", drs_zone: "메인 스트레이트 및 턴 3-4 사이 백 스트레이트", features: "2011년부터 2013년까지 인도 그랑프리가 열린 고속 레이아웃 서킷입니다." },
    "valencia": { corners: 25, ot_zone_2026: "턴 12 진입 전 브레이킹 존", drs_zone: "턴 10 탈출 후 브릿지를 지나는 직선 구간", features: "스페인 발렌시아 항구를 끼고 도는 시가지 서킷으로, 교량을 건너는 독특한 레이아웃을 가졌습니다." },
    "hockenheimring": { corners: 17, ot_zone_2026: "턴 6 파라볼리카 끝 헤어핀 구간", drs_zone: "파라볼리카 곡선 직선 구간 끝 턴 6 진입 전", features: "독일 그랑프리의 상징적인 서킷 중 하나로, 거대한 스타디움 형태의 모토드롬 섹션이 백미입니다." },
    "nurburgring": { corners: 15, ot_zone_2026: "턴 1 벤-호스 코너 진입 구간", drs_zone: "메인 스트레이트 끝 턴 1 진입 전", features: "2020년 아이펠 그랑프리 등을 개최한 독일의 상징적인 클래식 서킷입니다." },
    "istanbul": { corners: 14, ot_zone_2026: "턴 12 브레이킹 존", drs_zone: "턴 11 탈출 후 메인 스트레이트 반대편 직선 구간", features: "다중 에이펙스를 가져 드라이버의 목에 엄청난 G포스를 가하는 전설적인 턴 8 코너로 유명한 튀르키예 서킷입니다." },
    "sepang": { corners: 15, ot_zone_2026: "마지막 턴 15 진입 전 및 메인 스트레이트 구간", drs_zone: "턴 14 탈출 후 턴 15 진입 전, 그리고 턴 15 탈출 후 메인 스트레이트 듀얼 존", features: "초고속 코너와 예측 불가능한 스콜(열대성 폭우)이 특징인 말레이시아의 서킷입니다." },
    "sochi": { corners: 18, ot_zone_2026: "턴 2 진입 메인 스트레이트", drs_zone: "가장 긴 활처럼 휜 턴 3 진입 전 및 메인 스트레이트", features: "2014 동계 올림픽 경기장 인프라를 그대로 둘러싸고 주행하는 러시아의 반시가지 서킷이었습니다." },
    "portimao": { corners: 15, ot_zone_2026: "메인 스트레이트 끝 턴 1", drs_zone: "메인 스트레이트 단일 존", features: "롤러코스터처럼 심하게 오르내리는 고도차를 가져 블라인드 코너가 많은 포르투갈의 서킷입니다." },
    "mugello": { corners: 15, ot_zone_2026: "산 도나토 코너(턴 1)", drs_zone: "메인 스트레이트 단일 존", features: "초고속 코너링이 쉴 새 없이 이어지며 드라이버의 한계를 시험하는 이탈리아의 클래식 서킷입니다." },
    "ricard": { corners: 15, ot_zone_2026: "미스트랄 스트레이트 끝 시케인", drs_zone: "미스트랄 스트레이트 첫 번째 구간 및 메인 스트레이트", features: "프랑스 그랑프리 개최지였으며, 매우 독특한 파란색/빨간색 패턴의 런오프 라인을 가집니다." }
};