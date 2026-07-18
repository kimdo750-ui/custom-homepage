import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, registerFont } from 'canvas';
import { existsSync } from 'fs';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const maxDuration = 60;

// 붓글씨 글꼴 등록 시도
try {
  // Windows 시스템 글꼴 경로 (붓글씨 글자체)
  const fontPaths = [
    'C:\\Windows\\Fonts\\gungsuh.ttf',     // 궁서
    'C:\\Windows\\Fonts\\gungsuhcje.ttf',  // 궁서체
    'C:\\Windows\\Fonts\\hmjingga.ttf',    // 함초롱 고딕
  ];

  for (const fontPath of fontPaths) {
    if (existsSync(fontPath)) {
      let fontName = 'Gungsuh';
      if (fontPath.includes('gungsuhcje')) fontName = 'Gungsuh Che';
      if (fontPath.includes('hmjingga')) fontName = 'HM Jingga';

      try {
        registerFont(fontPath, { family: fontName });
        console.log(`붓글씨 글꼴 등록 성공: ${fontName} - ${fontPath}`);
        break;
      } catch (e) {
        console.log(`글꼴 등록 실패: ${fontPath}`);
      }
    }
  }
} catch (e) {
  console.log('글꼴 등록 오류:', e);
}

export async function POST(request: NextRequest) {
  let tempImagePath = '';

  try {
    const body: any = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    console.log('뒷면 생성 시작:', { text, textLength: text.length });

    // Canvas 생성 (1200x960)
    const canvas = createCanvas(1200, 960);
    console.log('Canvas 생성 완료');
    const ctx = canvas.getContext('2d');

    // 흰색 배경
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1200, 960);

    // 상단 원형 장식 (2배)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(600, 160, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 160, 64, 0, Math.PI * 2);
    ctx.stroke();

    // 텍스트 렌더링 (검은색 붓글씨)
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // 텍스트 길이에 따라 폰트 크기 조정
    let fontSize = 260;
    if (text.length > 12) {
      fontSize = 200;
    } else if (text.length > 8) {
      fontSize = 230;
    }

    // 붓글씨 글꼴 사용 (궁서 또는 함초롱)
    ctx.font = `bold ${fontSize}px "Gungsuh", "Gungsuh Che", "HM Jingga", sans-serif`;

    try {
      ctx.fillText(text.substring(0, 20), 600, 570);
      console.log('텍스트 렌더링 성공:', text);
    } catch (textError) {
      console.error('텍스트 렌더링 오류:', textError);
      // 텍스트 렌더링 실패해도 배경은 계속 반환
    }

    // 하단 선 장식 (2배)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(200, 640);
    ctx.lineTo(1000, 640);
    ctx.stroke();

    // PNG로 변환
    const pngBuffer = canvas.toBuffer('image/png');

    console.log('PNG 생성 완료, 크기:', pngBuffer.length);

    // Base64로 변환
    const base64 = pngBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('Base64 변환 완료, 크기:', imageUrl.length);

    // Remove.bg API로 배경 제거는 선택사항 (없으면 원본 사용)
    console.log('뒷면 생성 완료, imageUrl 길이:', imageUrl.length);

    const finalResponse = {
      imageUrl,
      type: 'back',
      text,
      bgRemoved: false,
    };

    console.log('뒷면 API 응답:', {
      type: finalResponse.type,
      text: finalResponse.text,
      hasImageUrl: !!finalResponse.imageUrl,
      imagUrlLength: finalResponse.imageUrl.length
    });

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: '뒷면 디자인 생성 실패: ' + errorMsg },
      { status: 500 }
    );
  } finally {
    // 임시 파일 정리
    try {
      if (tempImagePath) unlinkSync(tempImagePath);
    } catch (e) {
      console.warn('파일 정리 실패:', tempImagePath);
    }
  }
}
