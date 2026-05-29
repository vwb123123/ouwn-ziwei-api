export default async function handler(req, res) {
  const { month, hour } = req.body;

  try {
    const mVal = parseInt(month) || 1;
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    let hourIdx = branches.indexOf(hour) !== -1 ? branches.indexOf(hour) : 0;

    // 1. 명궁/부처궁 위치 연산
    const mingIdx = (2 + mVal - hourIdx + 12) % 12;
    const spouseIdx = (mingIdx - 2 + 12) % 12;
    
    // 2. 대운(대한) 연산: 10년 단위 흐름 (간단히 월지 기준 대운 순환 로직)
    const daeunTable = ["초년운", "청년운", "중년운", "장년운", "말년운", "노년운"];
    const daeunIdx = Math.floor(mVal / 2); // 월지 기준 대운 간략화
    
    // 3. 사화(四化) 배치: 명궁 위치에 따른 십간 사화 규칙을 단순화하여 배정
    const sihuaTable = ["록(재물)", "권(권력)", "과(명예)", "기(주의)"];
    
    const starTable = [
      "태양·문곡", "천기·태음", "자미·천부", "파군·천형", 
      "무곡·탐랑", "거문·화성", "천상·천경", "천량·록존", 
      "칠살·경양", "천동·거문", "염정·천괴", "태음·천량"
    ];

    res.status(200).json({
      status: "success",
      mingGong: starTable[mingIdx % 12],
      spouseGong: starTable[spouseIdx % 12],
      currentDaeun: daeunTable[daeunIdx % 6],
      sihua: sihuaTable[mingIdx % 4] // 사화 배치를 명궁 기준 난수로 매칭
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
