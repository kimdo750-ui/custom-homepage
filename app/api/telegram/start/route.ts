import { NextResponse } from 'next/server';
import { startPolling } from '@/lib/telegram/polling';

let isPollingStarted = false;

export async function GET() {
  if (isPollingStarted) {
    return NextResponse.json(
      {
        status: 'already_running',
        message: '🤖 봇이 이미 실행 중입니다!',
      },
      { status: 200 }
    );
  }

  try {
    isPollingStarted = true;

    // Polling 시작 (백그라운드에서 실행)
    startPolling();

    return NextResponse.json(
      {
        status: 'success',
        message: '🤖 한올 마케팅 봇이 시작되었습니다!',
        instructions: [
          '1. 텔레그램에서 @hanol_marketing_bot 검색',
          '2. /start 입력해서 시작하기',
          '3. 마케팅 질문을 자유롭게 입력하기',
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    isPollingStarted = false;
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : '봇 시작 실패',
      },
      { status: 500 }
    );
  }
}
