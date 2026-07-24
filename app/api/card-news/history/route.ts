import { NextRequest, NextResponse } from 'next/server';
import { getUserConversationHistory } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // MongoDB에서 카드뉴스 기록 조회
    const logs = await getUserConversationHistory(userIdNum, 100);
    const cardNewsLogs = logs
      .filter((log) => {
        try {
          // focusArea가 'card-news' 또는 'card-news-generation'인 경우
          if (log.focusArea === 'card-news' || log.focusArea === 'card-news-generation') {
            const content = JSON.parse(log.content || '{}');
            // type이 'card-news-saved'이거나 단순 텍스트인 경우
            return content.type === 'card-news-saved' || typeof content === 'string' || content.includes?.('카드뉴스');
          }
          return false;
        } catch {
          return false;
        }
      })
      .map((log) => {
        try {
          const content = JSON.parse(log.content || '{}');
          // 카드뉴스 기본 정보 추출
          const timestamp = content.timestamp || Date.now();
          const title = content.title || log.content?.substring(0, 20) || '마케팅 카드뉴스';
          const cardsCount = content.cardsCount || 5;

          // 미리보기 이미지 생성 (SVG 기반)
          const previewSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'%3E%3Crect width='600' height='750' fill='%23f8f9fa'/%3E%3Crect x='30' y='30' width='540' height='690' fill='white' stroke='%23ddd' stroke-width='2' rx='12'/%3E%3Ctext x='300' y='100' font-family='Arial, sans-serif' font-size='32' font-weight='bold' text-anchor='middle' fill='%23000'%3E${encodeURIComponent(title.substring(0, 15))}'%3E%3C/text%3E%3Ctext x='300' y='150' font-family='Arial, sans-serif' font-size='16' text-anchor='middle' fill='%23666'%3E${cardsCount}개 카드로 구성%3C/text%3E%3Crect x='60' y='200' width='480' height='400' fill='%23f0f0f0' rx='8'/%3E%3Ctext x='300' y='420' font-family='Arial, sans-serif' font-size='18' text-anchor='middle' fill='%23999'%3E카드뉴스 미리보기%3C/text%3E%3C/svg%3E`;

          return {
            id: `${timestamp}`,
            title: title,
            cardsCount: cardsCount,
            jobId: content.link?.split('jobId=')[1] || `card-${timestamp}`,
            timestamp: new Date(timestamp).toISOString(),
            preview: previewSvg,
          };
        } catch (e) {
          console.warn('카드뉴스 파싱 실패:', e);
          return null;
        }
      })
      .filter((item) => item !== null);

    console.log(`📸 카드뉴스 히스토리 조회: userId=${userId}, 개수=${cardNewsLogs.length}`);

    return NextResponse.json({
      success: true,
      userId: userIdNum,
      cardNews: cardNewsLogs,
    });
  } catch (error) {
    console.error('❌ 카드뉴스 히스토리 조회 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 히스토리 조회 실패' },
      { status: 500 }
    );
  }
}
