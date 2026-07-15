import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const client = new GoogleGenAI({ apiKey });

// 우리이야기 캘리그래피 SVG 생성
function generateCalligraphySVG(text: string): string {
  const svg = `
    <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        </style>

        <!-- 캘리그래피 필터 -->
        <filter id="calligraphy-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feFlood flood-color="#e74c3c" flood-opacity="0.3"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- 배경 -->
      <rect width="500" height="300" fill="#ffffff"/>

      <!-- 장식 요소 - 우리이야기 스타일 -->
      <!-- 좌측 상단 장식 -->
      <path d="M 50 80 Q 80 60, 100 100" stroke="#e74c3c" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="100" cy="100" r="3" fill="#e74c3c" opacity="0.8"/>

      <!-- 우측 하단 장식 -->
      <path d="M 450 200 Q 420 220, 400 200" stroke="#e74c3c" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="400" cy="200" r="3" fill="#e74c3c" opacity="0.8"/>

      <!-- 중앙 상단 장식선 -->
      <line x1="150" y1="50" x2="350" y2="50" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>

      <!-- 캘리그래피 텍스트 -->
      <text
        x="250"
        y="160"
        font-family="'Noto Serif KR', serif"
        font-size="52"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#e74c3c"
        filter="url(#calligraphy-shadow)"
        letter-spacing="3"
        style="text-shadow: 1px 1px 2px rgba(0,0,0,0.1); font-style: italic;"
      >
        ${text.substring(0, 12)}
      </text>

      <!-- 하단 장식 선 -->
      <line x1="150" y1="220" x2="350" y2="220" stroke="#e74c3c" stroke-width="1.5" opacity="0.4"/>

      <!-- 코너 액센트 -->
      <rect x="480" y="270" width="15" height="15" fill="none" stroke="#e74c3c" stroke-width="1.5" opacity="0.5"/>
    </svg>
  `;

  return svg;
}

// AI로 디자인 설명 생성
async function generateDesignDescription(text: string) {
  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `다음 문구를 감성적인 캘리그래피 디자인으로 표현한다면 어떤 분위기가 될지 간단히 설명해주세요 (2-3줄):

문구: "${text}"
스타일: 우아한 캘리그래피, 코랄 빨강색, 한국의 미

디자인 설명:`;

    const response = await model.generateContent(prompt);
    return response.text.trim();
  } catch (error) {
    console.error('Design description generation error:', error);
    return `"${text}"의 감성적 캘리그래피 디자인`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 캘리그래피 SVG 생성
    const svgData = generateCalligraphySVG(text);
    const imageUrl = `data:image/svg+xml,${encodeURIComponent(svgData)}`;

    // AI 디자인 설명 생성
    const description = await generateDesignDescription(text);

    console.log(`Calligraphy design generated for: "${text}"`);

    return NextResponse.json({
      imageUrl,
      description,
      style: 'calligraphy',
      text,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: '디자인 생성 실패' },
      { status: 500 }
    );
  }
}
