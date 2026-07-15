import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const { name, birthYear, zodiac } = body;

    if (!name || !birthYear || !zodiac) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요' },
        { status: 400 }
      );
    }

    // 우리이야기 스타일 앞면 디자인 SVG
    const svgContent = `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="300" fill="white"/>
  <line x1="100" y1="60" x2="400" y2="60" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>
  <line x1="100" y1="240" x2="400" y2="240" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>
  <text x="250" y="100" font-family="Noto Sans KR, sans-serif" font-size="28" font-weight="700" text-anchor="middle" fill="#e74c3c">${zodiac}</text>
  <text x="250" y="160" font-family="Noto Sans KR, sans-serif" font-size="48" font-weight="700" text-anchor="middle" fill="#1a1a1a">${name}</text>
  <text x="250" y="210" font-family="Noto Sans KR, sans-serif" font-size="24" font-weight="500" text-anchor="middle" fill="#666666">${birthYear}년생</text>
</svg>`;

    const imageUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

    console.log('Generated image URL length:', imageUrl.length);

    return NextResponse.json({
      imageUrl,
      type: 'front',
      name,
      birthYear,
      zodiac,
    });
  } catch (error) {
    console.error('Front design generation error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMsg);

    return NextResponse.json(
      {
        error: '앞면 디자인 생성 실패',
        details: errorMsg
      },
      { status: 500 }
    );
  }
}
