import { handleUserMessage, getWelcomeMessage } from './bot';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let lastUpdateId = 0;
const processedUpdates = new Set<number>();

export async function startPolling() {
  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN이 없습니다');
    return;
  }

  console.log('🤖 한올 마케팅 봇 Polling 시작...');

  // 매 2초마다 메시지 확인
  setInterval(async () => {
    try {
      const updates = await getUpdates();

      for (const update of updates) {
        // 중복 처리 방지
        if (processedUpdates.has(update.update_id)) {
          continue;
        }
        processedUpdates.add(update.update_id);

        if (update.message?.text) {
          const { message } = update;
          const userId = message.from?.id;
          const chatId = message.chat?.id;
          const text = message.text;

          if (userId && chatId && text) {
            console.log(`📨 [${userId}] ${text}`);

            let response = '';

            if (text === '/start') {
              response = await getWelcomeMessage();
            } else if (text === '/help') {
              response = `도움말:
/start - 인사말과 안내
/help - 이 도움말
/status - 마케팅 진행 상황

그 외에는 자유로운 마케팅 질문을 해주세요!`;
            } else if (text === '/status') {
              response =
                '현재 한올 러그 마케팅 준비 중입니다.\n질문을 입력해주면 구체적인 조언을 해드리겠습니다!';
            } else {
              response = await handleUserMessage(userId, text);
            }

            await sendMessage(chatId, response);
          }
        }

        lastUpdateId = update.update_id + 1;
      }

      // 오래된 업데이트 제거 (메모리 절약)
      if (processedUpdates.size > 1000) {
        const oldestId = Math.min(...processedUpdates);
        processedUpdates.delete(oldestId);
      }
    } catch (error) {
      console.error('❌ Polling 오류:', error);
    }
  }, 2000); // 2초마다 확인
}

async function getUpdates() {
  try {
    const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/getUpdates?offset=${lastUpdateId}&timeout=30`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      return data.result || [];
    }
    return [];
  } catch (error) {
    console.error('❌ getUpdates 실패:', error);
    return [];
  }
}

async function sendMessage(chatId: number, text: string): Promise<boolean> {
  try {
    const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
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
    console.log(`✅ 메시지 전송: ${chatId}`);
    return data.ok;
  } catch (error) {
    console.error('❌ sendMessage 실패:', error);
    return false;
  }
}
