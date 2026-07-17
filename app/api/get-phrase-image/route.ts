import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

// 프리셋 명언 매핑
const phraseTexts: Record<string, string> = {
  '사랑은 모든것을 이긴다': '사랑은 모든것을 이긴다',
  '사랑이 없는곳에 사랑을 심어라': '사랑이 없는곳에\n사랑을 심어라',
  '사랑은 주는것이다': '사랑은 주는것이다',
  '우정은 영혼과 영혼의 만남이다': '우정은 영혼과\n영혼의 만남이다',
};

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 공백 제거 후 확인
    const normalizedText = text.replace(/\s+/g, '');
    let displayText = phraseTexts[text];

    if (!displayText) {
      const matchedKey = Object.keys(phraseTexts).find(
        key => key.replace(/\s+/g, '') === normalizedText
      );
      if (matchedKey) {
        displayText = phraseTexts[matchedKey];
      }
    }

    if (!displayText) {
      return NextResponse.json(
        { error: '프리셋 이미지를 찾을 수 없습니다', text },
        { status: 404 }
      );
    }

    console.log('명언 이미지 생성:', text);

    // Canvas에서 투명 배경으로 텍스트 그리기 (600x480)
    const canvas = createCanvas(600, 480);
    const ctx = canvas.getContext('2d');

    // 배경을 투명하게 유지
    ctx.clearRect(0, 0, 600, 480);

    // 상단 원형 장식
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(300, 80, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(300, 80, 32, 0, Math.PI * 2);
    ctx.stroke();

    // 텍스트
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.font = 'italic bold 100px sans-serif';

    // 줄바꿈 처리
    const lines = displayText.split('\n');
    let startY = 200;
    const lineHeight = 125;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 300, startY + i * lineHeight);
    }

    // 하단 선 장식
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(100, 320);
    ctx.lineTo(500, 320);
    ctx.stroke();

    // PNG로 변환 (투명한 배경)
    const pngBuffer = canvas.toBuffer('image/png');
    const base64 = pngBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('명언 이미지 생성 완료 (투명 배경)');

    return NextResponse.json({
      imageUrl,
      cached: false,
      text,
      type: 'preset',
      bgRemoved: false,
    });

  } catch (error) {
    console.error('에러:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: '이미지 처리 실패',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
