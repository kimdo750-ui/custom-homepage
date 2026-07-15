import { NextRequest, NextResponse } from 'next/server';

// 이미지 캐시 (메모리)
const imageCache = new Map<string, string>();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_HOST = 'https://api.stability.ai/v1';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // API 키 확인
    if (!STABILITY_API_KEY) {
      console.error('STABILITY_API_KEY is not set');
      return NextResponse.json(
        { error: 'API 키 설정 오류' },
        { status: 500 }
      );
    }

    // 캐시 확인
    if (imageCache.has(text)) {
      console.log(`Cache hit for: ${text}`);
      return NextResponse.json({
        imageUrl: imageCache.get(text),
        cached: true,
        text,
      });
    }

    // 캘리그래피 프롬프트 생성
    const prompt = `Create a sophisticated Korean calligraphy design featuring the text: "${text}"

Style requirements:
- Premium, elegant calligraphy style
- Traditional Korean aesthetics with modern touch
- Professional design suitable for apparel printing (transfer sheet)
- Main text in center with decorative elements
- Color: coral red and white background, high contrast
- Clean, professional, high quality
- No logos or trademarks
- Balanced composition
- 우리이야기 brand aesthetic (emotional, warm, artistic)
- 4K quality, print-ready`;

    console.log('Generating image with Stability AI for:', text);

    const engineId = 'stable-diffusion-xl-1024-v1-0';
    const response = await fetch(
      `${STABILITY_API_HOST}/generate/${engineId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
          ],
          cfg_scale: 8,
          steps: 50,
          samples: 1,
          height: 1024,
          width: 1024,
          seed: Math.floor(Math.random() * 10000),
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Stability AI error:', response.status, errorBody);
      return NextResponse.json(
        {
          error: '이미지 생성 실패',
          details: `Status: ${response.status}, ${errorBody}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json() as any;

    if (!data.artifacts || !Array.isArray(data.artifacts) || data.artifacts.length === 0) {
      console.error('No artifacts in response:', JSON.stringify(data));
      return NextResponse.json(
        { error: '이미지 생성 실패 - 응답 형식 오류' },
        { status: 500 }
      );
    }

    // Base64 이미지를 데이터 URI로 변환
    const base64Image = data.artifacts[0].base64;
    if (!base64Image) {
      return NextResponse.json(
        { error: '이미지 생성 실패 - Base64 데이터 없음' },
        { status: 500 }
      );
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;

    // 캐시에 저장
    imageCache.set(text, imageUrl);

    console.log('Image generated successfully for:', text);

    return NextResponse.json({
      imageUrl,
      cached: false,
      text,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: '이미지 생성 중 오류 발생',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
