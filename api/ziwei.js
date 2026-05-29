export default async function handler(req, res) {
  // 1. GET 방식(req.query) 대신 POST 방식(req.body)으로 데이터를 받도록 수정
  const { month, hour } = req.body; 

  try {
    // 나머지 연산 로직은 동일합니다.
    const mVal = parseInt(month) || 1;
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    let hourIdx = branches.indexOf(hour) !== -1 ? branches.indexOf(hour) : 0;

    const mingIdx = (2 + mVal - hourIdx + 12) % 12;
    const spouseIdx = (mingIdx - 2 + 12) % 12;

    const starTable = [
      "태양·문곡", "천기·태음", "자미·천부", "파군·천형", 
      "무곡·탐랑", "거문·화성", "천상·천경", "천량·록존", 
      "칠살·경양", "천동·거문", "염정·천괴", "태음·천량"
    ];

    res.status(200).json({
      status: "success",
      mingGong: starTable[mingIdx % 12],
      spouseGong: spouseGongStars // (이하 동일)
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
