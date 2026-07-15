import { NextRequest, NextResponse } from 'next/server';

// 프리셋 명언 매핑 (명언 텍스트 → 이미지 파일)
const phraseImages: Record<string, string> = {
  '사랑은 모든 것을 이긴다': '/phrases/love_001.png',
  '성공은 준비와 기회의 만남이다': '/phrases/success_001.png',
  '우정은 영혼과 영혼의 만남이다': '/phrases/friendship_001.png',
  '하면 된다': '/phrases/challenge_001.png',
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

    // 프리셋 이미지 확인
    const imageUrl = phraseImages[text];

    if (!imageUrl) {
      return NextResponse.json(
        { error: '프리셋 이미지를 찾을 수 없습니다', text },
        { status: 404 }
      );
    }

    console.log('Getting preset phrase image:', text, imageUrl);

    return NextResponse.json({
      imageUrl,
      cached: false,
      text,
      type: 'preset',
    });
  } catch (error) {
    console.error('Get phrase image error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: '이미지 조회 중 오류 발생',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
