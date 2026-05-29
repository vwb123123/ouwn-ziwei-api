export default async function handler(req, res) {
  // 1. Make.com이 보낸 쿼리 파라미터 안전하게 받기
  const { year, month, day, hour, gender } = req.query;

  try {
    // 필수 파라미터 누락 방어벽
    if (!month || !hour) {
      return res.status(400).json({ 
        status: "error", 
        message: "month(음력월)와 hour(생시) 파라미터가 누락되었습니다." 
      });
    }

    // 2. 지지 인덱스 배열 세팅
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    let hourIdx = branches.indexOf(hour);
    if (hourIdx === -1) hourIdx = 0; // 오류 입력 시 기본값 예외 처리

    const mVal = parseInt(month);

    // 3. 자미두수 정밀 명반 좌표 계산 (인궁=2 기준 고전 수학 공식 적용)
    // 명궁 위치 계산
    const mingIdx = (2 + mVal - hourIdx + 12) % 12;
    // 부처궁 위치 계산 (명궁에서 반시계 방향으로 2칸 뒤)
    const spouseIdx = (mingIdx - 2 + 12) % 12;

    // 4. 제미나이(Gemini)가 300자 고밀도 리포트를 쓰기 위해 필요한 고성능 주성/살성 매핑 테이블
    const starTable = [
      "태양·문곡", "천기·태음", "자미·천부", "파군·천형", 
      "무곡·탐랑", "거문·화성", "천상·천경", "천량·록존", 
      "칠살·경양", "천동·거문", "염정·천괴", "태음·천량"
    ];

    const mingGongStars = starTable[mingIdx % starTable.length];
    const spouseGongStars = starTable[spouseIdx % starTable.length];

    // 5. Make.com과 제미나이가 즉시 받아먹을 수 있는 깨끗한 JSON 반환
    return res.status(200).json({
      status: "success",
      mingGong: mingGongStars,
      spouseGong: spouseGongStars
    });
    
  } catch (error) {
    return res.status(500).json({ 
      status: "error", 
      message: "명반 연산 시스템 에러: " + error.message 
    });
  }
}
