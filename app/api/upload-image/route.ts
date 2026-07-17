import { NextRequest, NextResponse } from 'next/server';

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

    // Base64로 변환
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('Base64 변환 완료, 크기:', dataUrl.length);

    return NextResponse.json({
      success: true,
      filename: file.name,
      imageData: dataUrl,
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
