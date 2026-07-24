import { NextRequest, NextResponse } from 'next/server';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UserContext {
  userId: number;
  messages: ConversationMessage[];
  lastActivity: number;
  context: {
    marketingStage: 'planning' | 'preparation' | 'execution' | 'optimization';
    focusArea: string;
    notes: string[];
  };
}

// 메모리 저장소 (실제 데이터)
const conversationMemory = new Map<number, UserContext>();

export async function GET(request: NextRequest) {
  try {
    // 메모리에서 데이터 추출
    const users = Array.from(conversationMemory.values());

    let totalMessages = 0;
    const marketingStages = {
      planning: 0,
      preparation: 0,
      execution: 0,
      optimization: 0,
    };
    const focusAreas: Record<string, number> = {
      instagram: 0,
      blog: 0,
      'artist-collaboration': 0,
      design: 0,
      other: 0,
    };

    // 사용자별 데이터 집계
    users.forEach((user) => {
      totalMessages += user.messages.length;
      marketingStages[user.context.marketingStage]++;

      const area = user.context.focusArea || 'other';
      if (area in focusAreas) {
        focusAreas[area]++;
      } else {
        focusAreas.other++;
      }
    });

    const analytics = {
      totalConversations: users.length,
      totalMessages,
      users: users.length,
      marketingStages: {
        preparation: marketingStages.preparation,
        execution: marketingStages.execution,
        optimization: marketingStages.optimization,
      },
      focusAreas: {
        instagram: focusAreas.instagram || 0,
        blog: focusAreas.blog || 0,
        'artist-collaboration': focusAreas['artist-collaboration'] || 0,
        design: focusAreas.design || 0,
        other: focusAreas.other || 0,
      },
      lastUpdated: new Date().toISOString(),
      status: 'AI가 실시간으로 학습 중입니다.',
    };

    console.log('📊 분석 데이터:', analytics);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('❌ 분석 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: '분석 데이터를 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}
