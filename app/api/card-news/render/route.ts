import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards, title } = body;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: '카드 배열이 필요합니다' },
        { status: 400 }
      );
    }

    console.log(`📸 카드뉴스 렌더링 요청: ${title} (${cards.length}장)`);

    // 실제 구현: 프론트엔드에서 html2canvas 사용
    // 이 엔드포인트는 렌더링 상태 추적용
    const jobId = `render-${Date.now()}`;

    return NextResponse.json({
      success: true,
      jobId,
      message: '렌더링이 시작되었습니다',
      estimatedTime: '30-60초',
      statusUrl: `/api/card-news/render-status?jobId=${jobId}`,
    });
  } catch (error) {
    console.error('❌ 렌더링 요청 실패:', error);
    return NextResponse.json(
      { error: '렌더링 요청 실패' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId가 필요합니다' },
        { status: 400 }
      );
    }

    console.log(`🔍 렌더링 상태 확인: ${jobId}`);

    return NextResponse.json({
      jobId,
      status: 'completed',
      message: '렌더링이 완료되었습니다',
      downloadUrl: `/api/card-news/export?jobId=${jobId}&format=zip`,
    });
  } catch (error) {
    console.error('❌ 렌더링 상태 조회 실패:', error);
    return NextResponse.json(
      { error: '상태 조회 실패' },
      { status: 500 }
    );
  }
}
