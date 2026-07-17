import { NextRequest, NextResponse } from 'next/server';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const config = {
  maxDuration: 60,
};

export async function POST(request: NextRequest) {
  try {
    if (!REMOVEBG_API_KEY) {
      return NextResponse.json(
        { error: 'Remove BG API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다' },
        { status: 400 }
      );
    }

    console.log('배경 제거 시작:', {
      fileName: imageFile.name,
      fileType: imageFile.type,
      fileSize: imageFile.size,
    });

    // Remove.bg API로 전송
    const removebgFormData = new FormData();
    removebgFormData.append('image_file', imageFile);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVEBG_API_KEY,
      },
      body: removebgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', response.status, errorText);
      return NextResponse.json(
        {
          error: '배경 제거 실패',
          details: `API error: ${response.status}`,
        },
        { status: 500 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : '배경 제거 중 오류 발생';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
