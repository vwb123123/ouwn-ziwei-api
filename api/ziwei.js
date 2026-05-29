// [1] 내 서버에 다운로드한 '자미두수 연산 엔진'을 불러오는 코드입니다.
const { Selector } = require('fortel-ziweidoushu'); 

export default async function handler(req, res) {
  // [2] Make.com이 주소창에 붙여서 보낸 손님의 데이터를 변수로 쏙쏙 받습니다.
  // 예: 주소?year=1995&month=5&day=21&hour=신&gender=남
  const { year, month, day, hour, gender } = req.query;

  try {
    // [3] 엔진에게 받은 데이터를 입력하여 '자미두수 명반(원국)'을 1초 만에 계산하라고 명령합니다.
    // 숫자로 바뀌어야 하는 년, 월, 일은 parseInt()로 안전하게 숫자로 변환합니다.
    const chart = Selector.create({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: hour,       // '자', '축', '인' 등 지지 문자열이 그대로 들어갑니다.
      gender: gender    // '남' 또는 '여'
    });

    // [4] 계산된 전체 명반 중에서 오운(OUWN) 리포트에 꼭 필요한 '명궁'과 '부처궁'의 별들만 골라냅니다.
    // 여러 개의 별 이름이 나오면 중간에 가독성이 좋게 '·' 기호로 연결(join)해 줍니다.
    const mingGongStars = chart.getPalace('명궁').getStars().join('·'); // 예: "자미·천부"
    const spouseGongStars = chart.getPalace('부처궁').getStars().join('·'); // 예: "파군·경양"
    
    // [5] 제미나이(Gemini)가 헷갈리지 않고 완벽하게 인지할 수 있도록 깔끔한 JSON 데이터로 포장합니다.
    // 성공했다는 신호인 '상태코드 200'과 함께 데이터를 Make.com으로 돌려보냅니다.
    return res.status(200).json({
      status: "success",
      mingGong: mingGongStars,
      spouseGong: spouseGongStars
    });
    
  } catch (error) {
    // [6] 혹시라도 생년월일을 잘못 입력하는 등 에러가 나면 시스템이 멈추지 않고 
    // 에러 원인을 Make.com에 얌전하게 알려주도록 방어벽(try-catch)을 세워둔 것입니다.
    return res.status(500).json({ 
      status: "error",
      message: "명반 연산에 실패했습니다: " + error.message 
    });
  }
}
