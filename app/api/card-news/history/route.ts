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
          return {
            id: `${content.timestamp}`,
            title: content.title,
            cardsCount: content.cardsCount,
            jobId: content.link?.split('jobId=')[1] || '',
            timestamp: new Date(content.timestamp).toISOString(),
            preview: `/api/card-news/export?jobId=${content.link?.split('jobId=')[1]}&format=preview`,
          };
        } catch {
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
