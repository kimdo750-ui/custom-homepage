import { NextRequest, NextResponse } from 'next/server';

// 웹훅은 비활성화됨 - Polling 방식만 사용
// 웹훅과 Polling이 동시에 실행되면 중복 응답 발생

export async function POST(request: NextRequest) {
  // 웹훅은 비활성화됨 - Polling만 사용하도록 설정
  return NextResponse.json(
    {
      ok: false,
      message: '웹훅은 비활성화됨. Polling 방식 사용 중.'
    },
    { status: 200 }
  );
}

async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<{ ok: boolean; result?: any }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN 없음');
    return { ok: false };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    return { ok: data.ok, result: data.result };
  } catch (error) {
    console.error('❌ Telegram 메시지 전송 실패:', error);
    return { ok: false };
  }
}

// GET 요청 (헬스 체크)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      message: '한올 러그 마케팍 봇이 운영 중입니다.',
    },
    { status: 200 }
  );
}
