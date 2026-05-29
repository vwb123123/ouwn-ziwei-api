export default async function handler(req, res) {
  const { month, hour } = req.body; // POST 방식으로 받은 데이터

  try {
    const mVal = parseInt(month) || 1;
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    let hourIdx = branches.indexOf(hour) !== -1 ? branches.indexOf(hour) : 0;

    // 자미두수 명궁/부처궁 위치 계산
    const mingIdx = (2 + mVal - hourIdx + 12) % 12;
    const spouseIdx = (mingIdx - 2 + 12) % 12;

    const starTable = [
      "태양·문곡", "천기·태음", "자미·천부", "파군·천형", 
      "무곡·탐랑", "거문·화성", "천상·천경", "천량·록존", 
      "칠살·경양", "천동·거문", "염정·천괴", "태음·천량"
    ];

    // 변수 선언을 정확하게 다시 정의했습니다
    const mingGongStars = starTable[mingIdx % 12];
    const spouseGongStars = starTable[spouseIdx % 12];

    res.status(200).json({
      status: "success",
      mingGong: mingGongStars,
      spouseGong: spouseGongStars // 이제 에러 나지 않습니다!
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
