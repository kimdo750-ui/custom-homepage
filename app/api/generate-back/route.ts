import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, registerFont } from 'canvas';
import { existsSync } from 'fs';
import { join } from 'path';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const maxDuration = 60;

// 수성돋움체 글꼴 등록
console.log('글꼴 등록 시작...');
try {
  const fontPath = join(process.cwd(), 'public', 'fonts', 'SuseongDotum.ttf');
  console.log('글꼴 경로:', fontPath);
  console.log('파일 존재 여부:', existsSync(fontPath));

  if (existsSync(fontPath)) {
    registerFont(fontPath); // family 이름 지정하지 않음 (파일의 내장 이름 사용)
    console.log(`✅ 수성돋움체 글꼴 등록 성공: ${fontPath}`);
  } else {
    console.log('❌ 글꼴 파일을 찾을 수 없음:', fontPath);
  }
} catch (e) {
  console.log('❌ 글꼴 등록 오류:', e);
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

    // 텍스트 렌더링 (검은색 - 기본 시스템 글꼴)
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

    // 수성돋움체 글꼴 (파일의 내장 이름 사용)
    ctx.font = `bold ${fontSize}px "Suseong Dotum"`;

    try {
      ctx.fillText(text.substring(0, 20), 600, 570);
      console.log('텍스트 렌더링 성공:', text);
    } catch (textError) {
      console.error('텍스트 렌더링 오류:', textError);
    }

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
