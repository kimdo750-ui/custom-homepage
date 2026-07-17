import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createCanvas } from 'canvas';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const config = {
  maxDuration: 60,
};

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

    console.log('뒷면 생성:', { text });

    // Canvas 생성 (600x480)
    const canvas = createCanvas(600, 480);
    const ctx = canvas.getContext('2d');

    // 배경을 흰색으로 (Remove.bg API로 투명하게 처리)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 480);

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
    ctx.font = 'italic bold 72px "Noto Serif KR", Georgia';
    ctx.fillText(text.substring(0, 15), 300, 260);

    // 하단 선 장식
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(100, 320);
    ctx.lineTo(500, 320);
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
