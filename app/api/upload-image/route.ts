import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
  maxDuration: 60,
};

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

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const filename = `image_${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    // uploads 폴더 생성 (없으면)
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // 파일 저장
    const filepath = join(uploadsDir, filename);
    writeFileSync(filepath, buffer);

    console.log('파일 저장 완료:', filepath);

    // 저장된 파일 URL 반환
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      fileUrl,
      message: '이미지가 저장되었습니다',
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
