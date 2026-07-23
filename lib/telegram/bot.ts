import { Anthropic } from '@anthropic-ai/sdk';
import { generateMarketingPrompt, DEFAULT_WELCOME_MESSAGE } from './prompts';
import {
  addMessage,
  getConversationHistory,
  getOrCreateUserContext,
  addContextNote,
} from './memory';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function handleUserMessage(userId: number, userMessage: string): Promise<string> {
  try {
    // 사용자 메시지 저장
    addMessage(userId, 'user', userMessage);

    // 대화 히스토리 가져오기
    const conversationHistory = getConversationHistory(userId, 8);

    let assistantMessage = '';

    try {
      // Claude에 마케팅 조언 요청
      const fullPrompt = generateMarketingPrompt(userMessage, conversationHistory);

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      assistantMessage =
        response.content[0].type === 'text'
          ? response.content[0].text
          : getDefaultResponse(userMessage);
    } catch (apiError) {
      console.error('⚠️  Claude API 오류, 기본 응답 사용:', apiError);
      // API 오류 시 미리 준비된 응답 사용
      assistantMessage = getDefaultResponse(userMessage);
    }

    // AI 응답 저장
    addMessage(userId, 'assistant', assistantMessage);

    // 사용자 메시지 분석 (마케팅 단계 추적)
    analyzeUserIntent(userId, userMessage);

    return assistantMessage;
  } catch (error) {
    console.error('❌ 메시지 처리 실패:', error);
    return '죄송해요, 지금 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
}

function getDefaultResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('오늘') || lower.includes('해야')) {
    return `🎯 한올 러그 마케팅 로드맵

현재 단계: 제조 중 (MOQ 대기)

✅ 지금 할 것:
1️⃣ Instagram 계정 프로필 작성
   - Bio: "한국 전통의 미가 숨쉬는 러그"
   - 프로필 사진: 고급 러그 이미지

2️⃣ 블로그 포스트 계획
   - 주제 1: "러그 선택 완벽 가이드"
   - 주제 2: "거실 인테리어 트렌드"
   - 주제 3: "러그 관리법"

3️⃣ 작가 협력 계약서 준비
   - 낙관 + 인증서 템플릿
   - 수익 배분 계약 (5%)

📌 가장 중요한 것: 프로필 완성!`;
  }

  if (lower.includes('인스타') || lower.includes('instagram')) {
    return `📱 Instagram 전략

👥 타겟: 30-50대 여성 + MZ세대

📸 콘텐츠 3가지:
1️⃣ Before/After 공간 변화 (주 1회)
   - 일반적인 거실 → 한올 러그 적용
   - 따뜻한 분위기 강조

2️⃣ 작가 소개 (주 1회)
   - "아티스트 김OOO의 작품이 러그가 되다"
   - 작가 인터뷰, 낙관 영상

3️⃣ 전통문양 스토리 (주 1회)
   - "당초문의 의미는?"
   - 문양별 인테리어 팁

🎨 해시태그:
#한국러그 #전통문양 #프리미엄러그 #인테리어 #거실`;
  }

  if (lower.includes('블로그') || lower.includes('포스트')) {
    return `📝 블로그 콘텐츠 전략

🎯 목표: 검색 유입 + 신뢰도

✍️ 5개 포스트 계획:

1️⃣ "러그 선택 완벽 가이드"
   - 러그 종류, 소재, 가격대
   - 한국 전통 러그의 특징

2️⃣ "2025 거실 인테리어 트렌드"
   - 미니멀 + 따뜻한 톤
   - 한국 미니멀 감성

3️⃣ "프리미엄 러그의 가치"
   - 수작업의 우수성
   - 작가 콜라보의 의미

4️⃣ "러그 관리 & 세탁법"
   - 수작업 러그 특별 관리
   - 계절별 관리 팁

5️⃣ "한국 작가를 응원해야 하는 이유"
   - 로컬 아트 지원
   - 작가 스토리

📊 SEO 키워드: 한국 러그, 전통 문양, 프리미엄`;
  }

  if (lower.includes('작가') || lower.includes('협력')) {
    return `👥 작가 협력 마케팅 전략

현황: 100명+ 확보, 10명+ 협력 의사

🤝 Win-Win 구조:
✅ 작가들: 매 판매마다 5% 로열티
✅ 한올: 자동 홍보 + 신뢰도 ⬆

📢 작가의 자발적 홍보:
1️⃣ 작가 SNS에 "내 그림이 러그가 됐다!"
2️⃣ 작가의 팬 → 한올 고객으로 전환
3️⃣ 입소문 ↑↑↑

💼 초대 메시지 예시:
"당신의 작품을 한올 러그로 만나보세요!
- 낙관 + 인증서로 예술성 보장
- 매 판매마다 5% 수익
- SNS로 자유로운 홍보"`;
  }

  return `🎨 한올 러그 마케팅 어시스턴트

뭐든 물어봐주세요!
- "오늘 뭐 해야 할까?"
- "인스타그램 전략"
- "블로그 포스트"
- "작가 협력"
- "카드뉴스 디자인"

구체적인 조언을 해드립니다! 💪`;
}

function analyzeUserIntent(userId: number, message: string) {
  const context = getOrCreateUserContext(userId);
  const lowerMessage = message.toLowerCase();

  // 사용자의 현재 마케팅 단계 파악
  if (
    lowerMessage.includes('제조') ||
    lowerMessage.includes('준비') ||
    lowerMessage.includes('계획')
  ) {
    context.context.marketingStage = 'preparation';
    addContextNote(userId, `준비 단계 관심 감지: ${new Date().toLocaleString('ko-KR')}`);
  } else if (
    lowerMessage.includes('시작') ||
    lowerMessage.includes('운영') ||
    lowerMessage.includes('올리')
  ) {
    context.context.marketingStage = 'execution';
    addContextNote(userId, `실행 단계 진입: ${new Date().toLocaleString('ko-KR')}`);
  } else if (
    lowerMessage.includes('분석') ||
    lowerMessage.includes('조회') ||
    lowerMessage.includes('팔로워')
  ) {
    context.context.marketingStage = 'optimization';
    addContextNote(userId, `최적화 단계 시작: ${new Date().toLocaleString('ko-KR')}`);
  }

  // 관심 영역 파악
  if (lowerMessage.includes('인스타')) {
    context.context.focusArea = 'instagram';
  } else if (lowerMessage.includes('블로그') || lowerMessage.includes('seo')) {
    context.context.focusArea = 'blog';
  } else if (lowerMessage.includes('작가') || lowerMessage.includes('협력')) {
    context.context.focusArea = 'artist-collaboration';
  } else if (lowerMessage.includes('카드') || lowerMessage.includes('디자인')) {
    context.context.focusArea = 'design';
  }
}

export async function getWelcomeMessage(): Promise<string> {
  return DEFAULT_WELCOME_MESSAGE;
}

export async function isValidBotToken(): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    return token ? token.length > 0 : false;
  } catch {
    return false;
  }
}
