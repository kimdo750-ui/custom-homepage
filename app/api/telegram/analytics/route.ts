import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // DB에서 분석 데이터 조회
    const dbAnalytics = await getAnalyticsSummary();

    const analytics = {
      totalConversations: dbAnalytics.totalConversations || 0,
      totalMessages: dbAnalytics.totalMessages || 0,
      users: dbAnalytics.totalUsers || 0,
      marketingStages: {
        preparation: dbAnalytics.marketingStages?.preparation || 0,
        execution: dbAnalytics.marketingStages?.execution || 0,
        optimization: dbAnalytics.marketingStages?.optimization || 0,
      },
      focusAreas: {
        instagram: dbAnalytics.focusAreas?.instagram || 0,
        blog: dbAnalytics.focusAreas?.blog || 0,
        'artist-collaboration': dbAnalytics.focusAreas?.['artist-collaboration'] || 0,
        design: dbAnalytics.focusAreas?.design || 0,
        other: dbAnalytics.focusAreas?.other || 0,
      },
      lastUpdated: new Date().toISOString(),
      status: '✨ DB 연동 완료! AI가 모든 대화를 학습하고 있습니다.',
      source: 'MongoDB',
    };

    console.log('📊 DB 분석 데이터:', analytics);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('❌ 분석 데이터 조회 실패:', error);
    // Fallback to empty data
    return NextResponse.json({
      totalConversations: 0,
      totalMessages: 0,
      users: 0,
      marketingStages: { preparation: 0, execution: 0, optimization: 0 },
      focusAreas: { instagram: 0, blog: 0, 'artist-collaboration': 0, design: 0, other: 0 },
      lastUpdated: new Date().toISOString(),
      status: '⏳ MongoDB 연결 준비 중...',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
}
