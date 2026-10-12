// ----------------------------------------------------
// 굿즈 샵 상품 목록 (shop.html) — 상품을 바꾸려면 이 파일만 고치면 된다
// ----------------------------------------------------
// Fuel For Fans는 다른 사이트가 상품 정보를 가져가는 것을 막고 있어서(CORS 없음, robots.txt에서
// 상품·검색 페이지 수집 금지) 자동으로 가져오지 않고 여기에 직접 적는다.
//
// 항목 설명
//   category : "team"(팀 상품) / "driver"(드라이버 컬렉션) / "sale"(한정판·세일)
//   team     : 팀 필터 키 — SHOP_TEAMS(shop.js)에 있는 값
//   price    : Fuel For Fans 가격 ("$137.00" 또는 "€59.95") → 화면에서는 실시간 환율로 원화 표시
//   priceOld : 할인 전 가격 (세일 상품만)
//   badge    : "NEW" / "BEST" / "SALE" / "LIMITED" (없으면 생략)
//   img      : Fuel For Fans 상품 사진 주소,  link : 상품 페이지 주소
//
// 상품 페이지가 없어지면(판매 종료) 그 상품은 지우는 것이 좋다. (2026-10-12 점검: 판매 종료 3개 삭제)

const PRODUCT_DATA = [

    // ── FERRARI ──────────────────────────────────────
    {
        id: "ferrari_001",
        category: "team",
        team: "ferrari",
        teamLabel: "Scuderia Ferrari",
        title: "퓨마 2026 Ferrari 팀 드라이버 폴로 셔츠",
        price: "$137.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw6d49aa3d/images/large/701243936001_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-puma-2026-team-authentic-polo/701243936-PumaRed.html",
        badge: "NEW",
        desc: "2026 시즌 공식 Ferrari 팀 폴로 셔츠입니다. 공식 팀 컬러와 스폰서 패치가 적용된 드라이버가 착용하는 프리미엄 제품입니다."
    },
    {
        id: "ferrari_002",
        category: "team",
        team: "ferrari",
        teamLabel: "Scuderia Ferrari",
        title: "퓨마 2026 Ferrari 팀 드라이버 캡",
        price: "$51.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw760fea5e/images/large/701239023001_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-puma-2026-team-cap/701239023-pumared.html",
        badge: "NEW",
        desc: "Scuderia Ferrari 공식 팀 캡. 조절 가능한 스트랩과 자수 로고가 특징입니다."
    },
    {
        id: "ferrari_003",
        category: "team",
        team: "ferrari",
        teamLabel: "Scuderia Ferrari",
        title: "퓨마 2026Ferrari 팀 레이싱 재킷",
        price: "$273.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw9a9a9d89/images/large/701238722001_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-puma-2026-team-racing-jacket/701238722-PumaRed.html",
        badge: "BEST",
        desc: "공식 Scuderia Ferrari 소프트쉘 재킷. 바람막이 기능과 팀 로고 자수가 특징입니다."
    },
    {
        id: "ferrari_004",
        category: "team",
        team: "ferrari",
        teamLabel: "Scuderia Ferrari",
        title: "퓨마 2026 Ferrari 팀 드라이버 티셔츠",
        price: "$108.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw743c2d2b/images/large/701238721002_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-puma-2026-driver-t-shirt/701238721-PUMARed.html",
        badge: "",
        desc: "클래식한 디자인의 Ferrari 공식 팀 티셔츠. 실제 드라이버가 입는 티셔츠입니다."
    },

    // ── MERCEDES ──────────────────────────────────────
    {
        id: "mercedes_001",
        category: "team",
        team: "mercedes-amg-petronas",
        teamLabel: "Mercedes-AMG Petronas",
        title: "아디다스 2026 Mercedes AMG F1 팀 폴로 셔츠",
        price: "$114.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwfec0dc57/images/large/701242577002_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-2026-team-polo/701242577-Black.html",
        badge: "NEW",
        desc: "Mercedes-AMG F1 팀 공식 폴로 셔츠. 팀의 시그니처 실버 컬러가 적용되었습니다."
    },
    {
        id: "mercedes_002",
        category: "team",
        team: "mercedes-amg-petronas",
        teamLabel: "Mercedes-AMG Petronas",
        title: "아디다스 2026 Mercedes AMG F1 팀 캡",
        price: "$34.20",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwa7f6997b/images/large/701237794002_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-2025-team-driver-cap/701237794-mint.html",
        badge: "",
        desc: "Mercedes-AMG F1 팀 공식 캡. 플랫 브림 디자인과 팀 로고 자수."
    },
    {
        id: "mercedes_003",
        category: "team",
        team: "mercedes-amg-petronas",
        teamLabel: "Mercedes-AMG Petronas",
        title: "아디다스 2026 Mercedes AMG F1 팀 티셔츠",
        price: "$137.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw48bcb9b7/images/large/701242576002_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-2026-team-authentic-driver-t-shirt/701242576-Black.html",
        badge: "BEST",
        desc: "Mercedes-AMG F1 팀 공식 티셔츠. 실제 드라이버가 착용하는 프리미엄 제품입니다."
    },
    {
        id: "mercedes_004",
        category: "team",
        team: "mercedes-amg-petronas",
        teamLabel: "Mercedes-AMG Petronas",
        title: "아디다스 2026 Mercedes AMG F1 팀 드라이버 후드",
        price: "$137.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw4905561f/images/large/701242590001_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-2026-team-driver-hoodie/701242590-Black.html",
        badge: "",
        desc: "Mercedes-AMG F1 팀 공식 후드. 실제 드라이버가 착용하는 프리미엄 제품입니다."
    },

    // ── RED BULL ──────────────────────────────────────
    {
        id: "redbull_001",
        category: "team",
        team: "red-bull-racing",
        teamLabel: "Red Bull Racing",
        title: "2026 Red Bull 팀 폴로 셔츠",
        price: "$130.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5ae0ec84/images/large/701242145001_pp_01_redbull.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/red-bull-racing-2026-team-polo/701242145-NightSky.html",
        badge: "NEW",
        desc: "Red Bull Racing 공식 팀 폴로 셔츠. 팀의 시그니처 나이트 스카이 블루 & 블랙 컬러."
    },
    {
        id: "redbull_002",
        category: "team",
        team: "red-bull-racing",
        teamLabel: "Red Bull Racing",
        title: "뉴에라 2026 Red Bull 팀 캡",
        price: "$53.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1431c4bf/images/large/701242664001_PP_01_RedBull.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/red-bull-racing-new-era-2026-team-9seventy-cap/701242664-NightSky.html",
        badge: "BEST",
        desc: "Red Bull Racing 공식 팀의 캡. 조절 가능한 벨크로 스트랩."
    },
    {
        id: "redbull_003",
        category: "team",
        team: "red-bull-racing",
        teamLabel: "Oracle Red Bull Racing",
        title: "2026 Red Bull 팀 후디",
        price: "$150.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw3387f126/images/large/701242164001_pp_01_redbull.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/red-bull-racing-2026-team-hoodie/701242164-NightSky.html",
        badge: "",
        desc: "Red Bull Racing 공식 팀 후디. 팀 스폰서 패치 포함."
    },
    {
        id: "redbull_004",
        category: "team",
        team: "red-bull-racing",
        teamLabel: "Oracle Red Bull Racing",
        title: "2026 Red Bull 팀 티셔츠",
        price: "$109.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1584284a/images/large/701242147001_pp_01_redbull.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/red-bull-racing-2026-team-set-up-t-shirt/701242147-NightSky.html",
        badge: "",
        desc: "Red Bull Racing 공식 팀 티셔츠. 가볍고 통기성 좋은 소재."
    },

    // ── MCLAREN ──────────────────────────────────────
    {
        id: "mclaren_001",
        category: "team",
        team: "mclaren",
        teamLabel: "McLaren F1 Team",
        title: "퓨마 2026 McLaren 마스터카드 F1 팀 폴로 셔츠",
        price: "$102.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwbbaec2dc/images/large/701241087001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-team-polo/701241087-Papaya.html",
        badge: "NEW",
        desc: "McLaren 마스터카드 F1 공식 팀 폴로 셔츠. 팀의 시그니처 파파야 오렌지 컬러."
    },
    {
        id: "mclaren_002",
        category: "team",
        team: "mclaren",
        teamLabel: "McLaren F1 Team",
        title: "퓨마 2026 McLaren 마스터카드 F1 팀 캡",
        price: "$51.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw06e1e9df/images/large/701241098001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-team-cap/701241098-Papaya.html",
        badge: "BEST",
        desc: "McLaren 마스터카드 F1 공식 팀 캡. 파파야 & 카본 블랙 배색 디자인."
    },
    {
        id: "mclaren_003",
        category: "team",
        team: "mclaren",
        teamLabel: "McLaren F1 Team",
        title: "퓨마 2026 McLaren 마스터카드 F1 팀 1000번째 GP 봄버 재킷",
        price: "$144.95",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwdc4155f3/images/large/701242487001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-team-1000th-gp-bomber-jacket/701242487-PumaBlack.html",
        badge: "NEW",
        desc: "McLaren 마스터카드 F1 공식 팀 1000번째 GP 봄버 재킷. 경량 소재와 팀 로고 프린팅."
    },
    {
        id: "mclaren_004",
        category: "team",
        team: "mclaren",
        teamLabel: "McLaren F1 Team",
        title: "퓨마 2026 McLaren 마스터카드 F1 팀 티셔츠",
        price: "$91.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw01b3bf43/images/large/701241089001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-team-t-shirt/701241089-Papaya.html",
        badge: "",
        desc: "McLaren 마스터카드 F1 공식 팀 티셔츠. 통기성 좋은 퍼포먼스 소재."
    },

    // ── ASTON MARTIN ──────────────────────────────────
    {
        id: "aston_001",
        category: "team",
        team: "aston-martin",
        teamLabel: "Aston Martin F1",
        title: "Aston Martin F1 팀 레플리카 폴로 셔츠",
        price: "$102.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwcb37fcb9/images/large/701239682001_pp_01_astonmartin.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/aston-martin-f1-team-2026-replica-team-polo/701239682-green.html",
        badge: "NEW",
        desc: "Aston Martin F1 공식 팀 레플리카 폴로 셔츠. 브리티시 레이싱 그린 컬러."
    },
    {
        id: "aston_002",
        category: "team",
        team: "aston-martin",
        teamLabel: "Aston Martin F1",
        title: "2026 Aston Martin F1 팀 캡",
        price: "$34.95",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwacf790ad/images/large/701239675001_pp_01_astonmartin.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/aston-martin-f1-team-2026-replica-team-cap/701239675-green.html",
        badge: "",
        desc: "Aston Martin F1 공식 팀 캡. 그린 & 골드 배색."
    },
    {
        id: "aston_004",
        category: "team",
        team: "aston-martin",
        teamLabel: "Aston Martin F1",
        title: "2026 Aston Martin F1 팀 레플리카 레인 자켓",
        price: "$285.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwbc7f87fa/images/large/701239693001_pp_01_astonmartin.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/aston-martin-f1-team-2026-replica-team-rain-jacket/701239693-green.html",
        badge: "",
        desc: "Aston Martin F1 공식 팀 레플리카 레인 자켓. 그린 & 골드 배색."
    },

    // ── ALPINE ──────────────────────────────────────
    {
        id: "alpine_001",
        category: "team",
        team: "alpine",
        teamLabel: "BWT Alpine F1 Team",
        title: "2026 Alpine F1 팀 티셔츠",
        price: "$109.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw15f5ced5/images/large/701242129001_PP_01_AlpineF1.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/alpine-f1-2026-team-t-shirt/701242129-LapisBlue.html",
        badge: "NEW",
        desc: "BWT Alpine F1 팀 공식 티셔츠. 핑크 & 라피스 블루 팀 컬러."
    },
    {
        id: "alpine_002",
        category: "team",
        team: "alpine",
        teamLabel: "BWT Alpine F1 Team",
        title: "뉴에라 2026 Alpine F1 팀 캡",
        price: "$53.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwa7a0d48c/images/large/701242675001_PP_02_AlpineF1.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/alpine-f1-new-era-2026-team-9seventy-cap/701242675-Blue.html",
        badge: "",
        desc: "Alpine F1 공식 팀 캡. 조절 가능한 스트랩 디자인."
    },
    {
        id: "alpine_003",
        category: "team",
        team: "alpine",
        teamLabel: "BWT Alpine F1 Team",
        title: "2026 Alpine F1 팀 폴로 셔츠",
        price: "$130.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwcbff26b3/images/large/701242130001_PP_01_AlpineF1.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/alpine-f1-2026-team-polo/701242130-LapisBlue.html",
        badge: "",
        desc: "Alpine F1 공식 팀 폴로 셔츠. 핑크 & 라피스 블루 팀 컬러."
    },

    // ── AUDI ──────────────────────────────────────────
    {
        id: "audi_001",
        category: "team",
        team: "audi",
        teamLabel: "Audi F1",
        title: "아디다스 2026 Audi F1 팀 드라이버 티셔츠",
        price: "$137.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwd615fdf5/images/large/701242553001_PP_01_Audi.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/audi-f1-team-adidas-2026-team-authentic-t-shirt/701242553-GreyStrata.html",
        badge: "NEW",
        desc: "Audi F1 공식 팀 드라이버 티셔츠. 그레이 스타라타 컬러."
    },
    {
        id: "audi_002",
        category: "team",
        team: "audi",
        teamLabel: "Audi F1",
        title: "아디다스 2026 Audi F1 팀 캡",
        price: "$57.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw3b672295/images/large/701242562001_PP_01_Audi.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/audi-f1-team-adidas-2026-team-baseball-cap/701242562-GreyStrata.html",
        badge: "",
        desc: "Audi F1 공식 팀 캡."
    },

    // ── CADILLAC ──────────────────────────────────────
    {
        id: "cadillac_001",
        category: "team",
        team: "cadillac",
        teamLabel: "Cadillac F1",
        title: "타미 힐피거 2026 Cadillac F1 팀 후드",
        price: "$159.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw287e3b1f/images/large/701243544001_pp_01_cadillac.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/cadillac-f1-team-tommy-hilfiger-2026-team-hoodie/701243544-Black.html",
        badge: "NEW",
        desc: "Cadillac F1 공식 팀 후드. 스폰서인 타미 힐피거 상품."
    },
    {
        id: "cadillac_002",
        category: "team",
        team: "cadillac",
        teamLabel: "Cadillac F1",
        title: "타미 힐피거 2026 Cadillac F1 팀 캡",
        price: "$57.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw621f9b3b/images/large/701243534001_pp_01_cadillac.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/cadillac-f1-team-tommy-hilfiger-2026-team-cap/701243534-Black.html",
        badge: "",
        desc: "Cadillac F1 공식 팀 캡."
    },

    // ── HAAS ──────────────────────────────────────────
    {
        id: "haas_001",
        category: "team",
        team: "haas",
        teamLabel: "MoneyGram Haas F1 Team",
        title: "2026 Haas F1 팀 폴로 셔츠",
        price: "$130.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw80c91286/images/large/701242136001_PP_01_Haas.jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/global/en/haas-f1-team-2026-team-polo/701242136-Caviar.html",
        badge: "NEW",
        desc: "MoneyGram Haas F1 팀 공식 폴로 셔츠입니다. 팀 스폰서 로고가 돋보입니다."
    },
    {
        id: "haas_002",
        category: "team",
        team: "haas",
        teamLabel: "MoneyGram Haas F1 Team",
        title: "뉴에라 2026 Haas F1 팀 마이애미 GP 캡",
        price: "$53.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwcd7e41b4/images/large/701243062001_PP_01_Haas.jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/global/en/haas-f1-team-new-era-2026-team-miami-gp-cap/701243062-White.html",
        badge: "",
        desc: "Haas F1 공식 팀 캡. 마이애미 GP 디자인."
    },

    // ── RACING BULLS (VCARB) ──────────────────────────
    {
        id: "vcarb_001",
        category: "team",
        team: "vcarb",
        teamLabel: "Visa Cash App RB",
        title: "2026 VCARB 팀 티셔츠",
        price: "$79.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwc356a878/images/large/701243633001_pp_01_vcarb.jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/global/en/visa-cash-app-rb-2026-team-t-shirt/701243633-White.html",
        badge: "NEW",
        desc: "Visa Cash App RB 팀 공식 티셔츠. 스포티한 블루 컬러 디자인."
    },
    {
        id: "vcarb_002",
        category: "team",
        team: "vcarb",
        teamLabel: "Visa Cash App RB",
        title: "2026 VCARB 팀 캡",
        price: "$53.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwa897ae27/images/large/701242676001_pp_01_vcarb.jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/global/en/visa-cash-app-rb-2026-team-cap/701242676-BrightBlue.html",
        badge: "",
        desc: "Visa Cash App RB 공식 팀 캡. 조절 가능한 핏."
    },

    // ── WILLIAMS ──────────────────────────────────────
    {
        id: "williams_001",
        category: "team",
        team: "williams",
        teamLabel: "Williams Racing",
        title: "2026 Williams 팀 티셔츠",
        price: "$97.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1aab76d6/images/large/701243812001_pp_01_williams.jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/global/en/williams-racing-2026-team-tech-t-shirt/701243812-Navy.html",
        badge: "BEST",
        desc: "Williams Racing 공식 팀 티셔츠. 실용성과 통풍성을 자랑하는 디자인."
    },
    {
        id: "williams_002",
        category: "team",
        team: "williams",
        teamLabel: "Williams Racing",
        title: "뉴에라 2026 Williams 팀 캡",
        price: "$53.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5560ac1a/images/large/701243824001_pp_01_williamsf1%20(1).jpg?sw=1067&q=80", 
        link: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5560ac1a/images/large/701243824001_pp_01_williamsf1%20(1).jpg?sw=1067&q=80",
        badge: "",
        desc: "Williams Racing 공식 팀 캡. 블루와 네이비가 어우러진 클래식 디자인."
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 드라이버 컬렉션
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "driver_lec_001",
        category: "driver",
        team: "driver",
        teamLabel: "Charles Leclerc #16",
        title: "퓨마 2026 Charles Leclerc 드라이버 캡",
        price: "$54.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw9b26df4c/images/large/701241496001_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-puma-2026-charles-leclerc-trucker-cap/701241496-PumaRed.html",
        badge: "NEW",
        desc: "Charles Leclerc #16 공식 드라이버 캡. 페라리 팀 컬러와 드라이버 번호 자수."
    },
    {
        id: "driver_ver_001",
        category: "driver",
        team: "driver",
        teamLabel: "Max Verstappen #3",
        title: "뉴에라 2026 Max Verstappen 드라이버 캡",
        price: "$54.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwbb92affb/images/large/701242665001_pp_01_redbull.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/red-bull-racing-new-era-2026-max-verstappen-9seventy-cap/701242665-NightSky.html",
        badge: "BEST",
        desc: "Max Verstappen #3 공식 드라이버 캡."
    },
    {
        id: "driver_nor_001",
        category: "driver",
        team: "driver",
        teamLabel: "Lando Norris #1",
        title: "퓨마 2026 Lando Norris 드라이버 캡",
        price: "$54.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw788625d3/images/large/701241099001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-lando-norris-cap/701241099-Papaya.html",
        badge: "NEW",
        desc: "Lando Norris #1 공식 드라이버 캡. 파파야 오렌지 컬러에 2025 챔피언 에디션."
    },
    {
        id: "driver_ham_001",
        category: "driver",
        team: "driver",
        teamLabel: "Lewis Hamilton #44",
        title: "레고 2026 Lewis Hamilton 드라이버 헬멧",
        price: "$102.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1b6d9e6b/images/large/701243793001_pp_01_ferrari.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/scuderia-ferrari-f1-lego-lewis-hamilton-helmet-set/701243793-Yellow.html",
        badge: "NEW",
        desc: "Lewis Hamilton #44 공식 드라이버 레고 헬멧."
    },
    {
        id: "driver_sai_001",
        category: "driver",
        team: "driver",
        teamLabel: "Carlos Sainz #55",
        title: "2026 Carlos Sainz 드라이버 티셔츠",
        price: "$59.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwa53428ef/images/large/701243815001_pp_01_williams.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/williams-racing-2026-carlos-sainz-tech-t-shirt/701243815-Navy.html",
        badge: "",
        desc: "Carlos Sainz #55 공식 드라이버 티셔츠."
    },
    {
        id: "driver_pia_001",
        category: "driver",
        team: "driver",
        teamLabel: "Oscar Piastri #81",
        title: "퓨마 2026 Oscar Piastri 드라이버 호주 GP 캡",
        price: "$54.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwf7d4f6c6/images/large/701242488001_pp_01_mclaren.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mclaren-mastercard-f1-puma-2026-oscar-piastri-australia-gp-cap/701242488-Green.html",
        badge: "NEW",
        desc: "Oscar Piastri #81 공식 드라이버 호주 GP 캡."
    },
    {
        id: "driver_rus_001",
        category: "driver",
        team: "driver",
        teamLabel: "George Russell #63",
        title: "아디다스 George Russell 드라이버 티셔츠",
        price: "$45.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw8dd3258d/images/large/701242580001_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-george-russell-graphic-t-shirt/701242580-Black.html",
        badge: "",
        desc: "George Russell #63 공식 드라이버 티셔츠."
    },
    {
        id: "driver_ant_001",
        category: "driver",
        team: "driver",
        teamLabel: "Kimi Antonelli #12",
        title: "아디다스 Kimi Antonelli 드라이버 티셔츠",
        price: "$45.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw1bf96f79/images/large/701242581001_pp_01_mercedes.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/mercedes-amg-f1-adidas-kimi-antonelli-graphic-t-shirt/701242581-Black.html",
        badge: "NEW",
        desc: "Kimi Antonelli #12 공식 드라이버 티셔츠."
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 한정판 / 세일
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "sale_002",
        category: "sale",
        team: "sale",
        teamLabel: "F1 공식 컬렉션",
        title: "퓨마 F1 릴렉스드 로고 후디",
        price: "$32.00",
        priceOld: "$80.00",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw0e7ad91c/images/large/701232778001_pp_01_formula1.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/f1-collection-puma-ess-f1-relaxed-logo-hoodie/701232778-black.html",
        badge: "SALE",
        desc: "F1 클래식 로고 후디. 아울렛 한정 특가."
    },
    {
        id: "sale_004",
        category: "sale",
        team: "sale",
        teamLabel: "F1 공식 컬렉션",
        title: "퓨마 F1 릴렉스드 로고 티셔츠 ",
        price: "$30.90",
        priceOld: "$51.50",
        img: "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwe2137e82/images/large/701232779001_pp_01_formula1.jpg?sw=1067&q=80",
        link: "https://www.fuelforfans.com/global/en/f1-collection-puma-ess-f1-relaxed-logo-t-shirt/701232779-black.html",
        badge: "SALE",
        desc: "퓨마 F1 릴렉스드 로고 티셔츠. 아울렛 특가."
    },
];
