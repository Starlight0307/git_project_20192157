const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const IDEAS_FILE = path.join(__dirname, 'ideas.json');

// 아이디어 목록 가져오기
app.get('/api/ideas', (req, res) => {
    try {
        if (fs.existsSync(IDEAS_FILE)) {
            const data = fs.readFileSync(IDEAS_FILE, 'utf8');
            const ideas = JSON.parse(data);
            res.json(ideas);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('아이디어 읽기 실패:', error);
        res.status(500).json({ error: '아이디어를 불러올 수 없습니다.' });
    }
});

// 아이디어 목록 저장하기
app.post('/api/ideas', (req, res) => {
    try {
        const ideas = req.body;

        // 데이터 검증
        if (!Array.isArray(ideas)) {
            return res.status(400).json({ error: '잘못된 데이터 형식입니다.' });
        }

        // JSON 파일로 저장
        fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2), 'utf8');

        console.log('아이디어가 저장되었습니다:', ideas.length, '개');
        res.json({ success: true, message: '아이디어가 저장되었습니다.', count: ideas.length });
    } catch (error) {
        console.error('아이디어 저장 실패:', error);
        res.status(500).json({ error: '아이디어를 저장할 수 없습니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   포트폴리오 아이디어 관리 서버 시작!    ║
╚═══════════════════════════════════════════╝

🌐 서버 주소: http://localhost:${PORT}
📝 아이디어 페이지: http://localhost:${PORT}/idea.html

💡 사용 방법:
   1. 브라우저에서 위 주소로 접속
   2. 아이디어 추가/수정/삭제
   3. 자동으로 ideas.json 파일에 저장됨!

⏹  서버 종료: Ctrl + C
    `);
});
