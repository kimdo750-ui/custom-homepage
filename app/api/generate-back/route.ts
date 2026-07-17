import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    console.log('뒷면 생성:', { text });

    // Canvas 생성 (1200x960)
    const canvas = createCanvas(1200, 960);
    const ctx = canvas.getContext('2d');

    // 투명 배경 (알파채널 유지)
    ctx.clearRect(0, 0, 1200, 960);

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

    // 텍스트 (직접입력도 같은 크기)
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';

    // 텍스트 길이에 따라 폰트 크기 조정 (더 큼)
    let fontSize = 260;
    if (text.length > 12) {
      fontSize = 200;
    } else if (text.length > 8) {
      fontSize = 230;
    }

    // sans-serif 사용 (한글 호환성 개선)
    ctx.font = `italic bold ${fontSize}px sans-serif`;
    ctx.fillText(text.substring(0, 20), 600, 570);

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

    console.log('PNG 생성 완료');

    // Remove.bg API로 배경 제거
    if (REMOVEBG_API_KEY) {
      try {
        const formData = new FormData();
        formData.append('image_file', new Blob([pngBuffer]), 'back.png');
        formData.append('size', 'auto');
        formData.append('type', 'product');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
          },
          body: formData,
        });

        if (response.ok) {
          const bgRemovedBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(bgRemovedBuffer).toString('base64');
          const imageUrl = `data:image/png;base64,${base64}`;

          console.log('뒷면 생성 완료 (배경 제거됨)');

          return NextResponse.json({
            imageUrl,
            type: 'back',
            text,
            bgRemoved: true,
          });
        } else {
          console.warn('Remove.bg API 실패');
        }
      } catch (bgError) {
        console.warn('배경 제거 중 오류:', bgError);
      }
    }

    // 배경 제거 실패 시 원본 반환
    const base64 = pngBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('뒷면 생성 완료');

    return NextResponse.json({
      imageUrl,
      type: 'back',
      text,
      bgRemoved: false,
    });

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
