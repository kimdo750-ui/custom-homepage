import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);

    const { text } = body;

    if (!text) {
      console.log('Missing text');
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 우리이야기 스타일 뒷면 디자인 SVG
    const svgContent = `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="300" fill="white"/>
  <circle cx="250" cy="80" r="35" fill="none" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>
  <circle cx="250" cy="80" r="28" fill="none" stroke="#e74c3c" stroke-width="1" opacity="0.3"/>
  <text x="250" y="160" font-family="Noto Serif KR, serif" font-size="52" font-weight="700" text-anchor="middle" fill="#e74c3c" style="font-style: italic; letter-spacing: 2px;">${text.substring(0, 12)}</text>
  <line x1="150" y1="230" x2="350" y2="230" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>
</svg>`;

    const imageUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

    console.log('Generated image URL length:', imageUrl.length);

    return NextResponse.json({
      imageUrl,
      type: 'back',
      text,
    });
  } catch (error) {
    console.error('Back design generation error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMsg);

    return NextResponse.json(
      {
        error: '뒷면 디자인 생성 실패',
        details: errorMsg
      },
      { status: 500 }
    );
  }
}
