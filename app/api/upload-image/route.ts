import { NextRequest, NextResponse } from 'next/server';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다' },
        { status: 400 }
      );
    }

    console.log('이미지 업로드:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Remove.bg API로 배경 제거
    if (REMOVEBG_API_KEY) {
      try {
        const bgFormData = new FormData();
        bgFormData.append('image_file', new Blob([buffer], { type: file.type }), file.name);
        bgFormData.append('size', 'auto');
        bgFormData.append('type', 'product');

        const bgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
          },
          body: bgFormData,
        });

        if (bgResponse.ok) {
          const bgRemovedBuffer = await bgResponse.arrayBuffer();
          const base64 = Buffer.from(bgRemovedBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64}`;

          console.log('배경 제거 완료');

          return NextResponse.json({
            success: true,
            filename: file.name,
            imageData: dataUrl,
            bgRemoved: true,
            message: '이미지 배경이 제거되었습니다',
          });
        }
      } catch (bgError) {
        console.warn('배경 제거 실패, 원본 이미지 사용:', bgError);
      }
    }

    // 배경 제거 실패 또는 API 키 없으면 원본 사용
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('원본 이미지 사용 (배경 제거 미적용)');

    return NextResponse.json({
      success: true,
      filename: file.name,
      imageData: dataUrl,
      bgRemoved: false,
      message: '이미지가 변환되었습니다',
    });

  } catch (error) {
    console.error('업로드 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '업로드 중 오류 발생';

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
