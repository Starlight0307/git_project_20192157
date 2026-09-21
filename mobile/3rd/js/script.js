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
