// ----------------------------------------------------
// 내 대시보드 (dashboard.html) - 캘린더 내보내기 · 알림 설정 저장
// ----------------------------------------------------

const CAL_YEAR = new Date().getFullYear();
const NOTIF_KEY = 'f1_notification_settings';

function showDashboardMessage(id, text, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('text-danger', isError);
    el.classList.toggle('text-success', !isError);
}

// ---------- 캘린더 (.ics) ----------
const icsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

function buildSeasonIcs(races) {
    const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PROJECT_TELEMETRY//F1 Calendar//KO',
        'CALSCALE:GREGORIAN', `X-WR-CALNAME:F1 ${CAL_YEAR} 시즌`
    ];
    const stamp = icsDate(new Date());
    races.forEach(race => {
        lines.push('BEGIN:VEVENT', `UID:f1-${race.season}-${race.round}@project-telemetry`, `DTSTAMP:${stamp}`);
        if (race.time) {
            // 경기 시각이 있으면 2시간짜리 일정
            const start = new Date(`${race.date}T${race.time}`);
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
            lines.push(`DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`);
        } else {
            // 시각이 없으면 하루 종일 일정
            const day = race.date.replace(/-/g, '');
            const next = new Date(`${race.date}T00:00:00Z`);
            next.setUTCDate(next.getUTCDate() + 1);
            lines.push(`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`);
        }
        const loc = race.Circuit.Location;
        lines.push(
            `SUMMARY:${icsText(`🏁 R${race.round} ${race.raceName}`)}`,
            `LOCATION:${icsText(`${race.Circuit.circuitName}, ${loc.locality}, ${loc.country}`)}`,
            `DESCRIPTION:${icsText(`${CAL_YEAR} F1 시즌 ${race.round}라운드`)}`,
            'END:VEVENT'
        );
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

async function downloadSeasonIcs() {
    showDashboardMessage('calendar-status', '일정을 불러오는 중...');
    try {
        const res = await fetch(`${JOLPICA_BASE_URL}/${CAL_YEAR}.json?limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const races = (await res.json()).MRData.RaceTable.Races || [];
        if (races.length === 0) throw new Error('일정 없음');

        const blob = new Blob([buildSeasonIcs(races)], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `F1_${CAL_YEAR}_schedule.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showDashboardMessage('calendar-status', `✅ ${CAL_YEAR} 시즌 ${races.length}경기 일정 파일(F1_${CAL_YEAR}_schedule.ics)을 받았어요.`);
        return true;
    } catch (e) {
        console.error('캘린더 파일 생성 실패:', e);
        showDashboardMessage('calendar-status', '일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', true);
        return false;
    }
}

// ---------- 알림 설정 ----------
const NOTIF_IDS = ['notif-race', 'notif-news', 'notif-ticket'];

function loadNotificationSettings() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(NOTIF_KEY)); } catch (e) { saved = null; }
    if (!saved) return;
    NOTIF_IDS.forEach(id => {
        const box = document.getElementById(id);
        if (box && typeof saved[id] === 'boolean') box.checked = saved[id];
    });
}

function saveNotificationSettings() {
    const settings = {};
    NOTIF_IDS.forEach(id => {
        const box = document.getElementById(id);
        if (box) settings[id] = box.checked;
    });
    try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
        showDashboardMessage('notif-status', '✅ 알림 설정을 저장했어요.');
    } catch (e) {
        showDashboardMessage('notif-status', '이 브라우저에서는 설정을 저장할 수 없어요.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearLabel = document.getElementById('calendar-year');
    if (yearLabel) yearLabel.textContent = CAL_YEAR;

    document.getElementById('btn-ics-download')?.addEventListener('click', downloadSeasonIcs);
    document.getElementById('btn-google-calendar')?.addEventListener('click', async () => {
        // 구글 캘린더는 파일 가져오기로 추가한다: 파일을 받은 뒤 가져오기 화면을 연다
        if (await downloadSeasonIcs()) {
            window.open('https://calendar.google.com/calendar/r/settings/export', '_blank', 'noopener');
            showDashboardMessage('calendar-status', '✅ 파일을 받았어요. 새로 열린 구글 캘린더 [가져오기]에서 받은 .ics 파일을 선택하세요.');
        }
    });

    loadNotificationSettings();
    document.getElementById('btn-save-notif')?.addEventListener('click', saveNotificationSettings);
});
