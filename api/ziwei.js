// ============================================================
//  OUWN 자미두수 API  (Vercel Serverless Function)
//  경로: api/ziwei.js
//
//  ★ 2026-08 전면 교체.
//    이전 버전은 req.body.month / req.body.hour 를 읽었는데
//    호출부(saju_automation.py)는 birthMonth / birthHour 를 보냈습니다.
//    그래서 두 값이 항상 undefined → 월=1, 시=0 으로 떨어졌고,
//    생년월일과 무관하게 모든 고객이 같은 명궁(파군·천형)을 받았습니다.
//    별 배치도 12칸 고정 배열이라 실제 자미두수 계산이 아니었습니다.
//
//    이제 iztro(자미두수 오픈소스 라이브러리)로 실제 명반을 세웁니다.
//    오행국 → 자미성 위치 → 14주성 배치 → 12궁 → 사화까지 정식 순서를 따릅니다.
//
//  의존성: package.json 에 "iztro": "^2.6.0" 과 "type": "module" 이 필요합니다
// ============================================================

import { astro } from 'iztro';

// 시(0~23) → iztro 시진 인덱스(0=早子, 1=丑, … 11=亥, 12=晚子)
function toTimeIndex(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h) || h < 0 || h > 23) return null;
  if (h === 23) return 12;
  return Math.floor((h + 1) / 2);
}

// 대한 시작 나이 → 기존 리포트가 쓰던 표현으로 변환
function daeunLabel(startAge) {
  if (!Number.isFinite(startAge)) return '';
  if (startAge < 20) return '초년운';
  if (startAge < 35) return '청년운';
  if (startAge < 50) return '중년운';
  if (startAge < 65) return '장년운';
  return '노년운';
}

// 궁에 놓인 별 이름들 (주성 먼저, 보조성 뒤)
function starsOf(palace) {
  if (!palace) return [];
  const major = (palace.majorStars || []).map((s) => s.name);
  const minor = (palace.minorStars || []).map((s) => s.name);
  return major.concat(minor);
}

// 그 궁의 별 중 하나가 올해(또는 대한) 사화를 맞았는지
// mutagen 배열은 [록성, 권성, 과성, 기성] 순서입니다.
function sihuaOf(stars, mutagen) {
  if (!Array.isArray(mutagen) || mutagen.length < 4) return '';
  const labels = ['록(재물)', '권(권력)', '과(명예)', '기(주의)'];
  for (let i = 0; i < 4; i++) {
    if (stars.some((s) => s === mutagen[i])) return labels[i];
  }
  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'POST only' });
  }

  try {
    const b = req.body || {};

    // 호출부가 보내는 이름을 그대로 받습니다.
    // (구버전 키 month/hour 도 혹시 몰라 함께 받아줍니다)
    const year = Number(b.birthYear ?? b.year);
    const month = Number(b.birthMonth ?? b.month);
    const day = Number(b.birthDay ?? b.day);
    const hour = b.birthHour ?? b.hour;
    const isLunar = Boolean(b.isLunar);
    const gender = b.isFemale ? 'female' : 'male';

    if (!year || !month || !day) {
      return res.status(400).json({
        status: 'error',
        message: `생년월일이 필요합니다. 받은 값: year=${b.birthYear}, month=${b.birthMonth}, day=${b.birthDay}`,
      });
    }

    const timeIndex = toTimeIndex(hour);
    if (timeIndex === null) {
      return res.status(400).json({
        status: 'error',
        message: `출생 시(0~23)가 필요합니다. 받은 값: ${hour}`,
      });
    }

    const dateStr = `${year}-${month}-${day}`;
    const chart = isLunar
      ? astro.byLunar(dateStr, timeIndex, gender, false, true, 'ko-KR')
      : astro.bySolar(dateStr, timeIndex, gender, true, 'ko-KR');

    const byName = {};
    chart.palaces.forEach((p) => { byName[p.name] = p; });

    const ming = byName['명궁'];
    const spouse = byName['부처'];
    const wealth = byName['재백'];
    const career = byName['관록'];
    const health = byName['질액'];
    const migration = byName['천이'];

    // 대한·유년 (오늘 기준)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const hs = chart.horoscope(todayStr);

    // 대한의 나이 범위는 horoscope.decadal 이 아니라
    // 그 index가 가리키는 궁의 decadal.range 에 들어 있습니다.
    const decadalPalace = chart.palaces[hs.decadal && hs.decadal.index];
    const decadalRange = (decadalPalace && decadalPalace.decadal && decadalPalace.decadal.range) || [];
    const currentDaeun = daeunLabel(decadalRange[0]);
    const nominalAge = (hs.age && hs.age.nominalAge) || null;

    const mingStars = starsOf(ming);
    // 올해 사화가 명궁에 붙었는지 먼저 보고, 없으면 대한 사화로 봅니다.
    const sihua =
      sihuaOf(mingStars, hs.yearly && hs.yearly.mutagen) ||
      sihuaOf(mingStars, hs.decadal && hs.decadal.mutagen) ||
      '';

    const join = (p) => starsOf(p).join('·');

    return res.status(200).json({
      status: 'success',

      // ── 기존 호출부가 읽던 키 (형식 그대로 유지) ──
      mingGong: join(ming),
      spouseGong: join(spouse),
      currentDaeun,
      sihua,

      // ── 신규: 재물·커리어 페이지에 필요한 궁 ──
      wealthGong: join(wealth),
      careerGong: join(career),
      healthGong: join(health),
      migrationGong: join(migration),

      // ── 참고용 부가 정보 ──
      fiveElementsClass: chart.fiveElementsClass,
      soul: chart.soul,
      body: chart.body,
      solarDate: chart.solarDate,
      lunarDate: chart.lunarDate,
      decadalRange,
      nominalAge,
      yearlyMutagen: (hs.yearly && hs.yearly.mutagen) || [],
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
