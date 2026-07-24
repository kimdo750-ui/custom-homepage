// 카드뉴스 자동 생성 엔진
// PRD 기반 구현: 텍스트 → 카드뉴스 덱 변환

interface CardField {
  [key: string]: string;
}

interface Card {
  type: 'cover' | 'content' | 'quote' | 'table' | 'closing';
  fields: CardField;
}

interface CardNewsDeck {
  title: string;
  handle: string;
  preset: 'cine' | 'mag' | 'manga' | 'pixel' | 'doodle' | 'blue';
  cards: Card[];
  bg: string;
}

// AI 변환 응답 파싱 (텍스트 기반)
export function parseAIResponse(aiText: string): Partial<CardNewsDeck> {
  // JSON 파싱 복잡도 제거
  // 항상 텍스트 기반 fallbackParse 사용 (빠르고 안정적)
  return fallbackParse(aiText);
}

// 폴백: 규칙 기반 파싱 (오프라인 모드)
function fallbackParse(text: string): Partial<CardNewsDeck> {
  const lines = text.split('\n').filter((l) => l.trim());

  const deck: Partial<CardNewsDeck> = {
    cards: [],
    preset: 'mag',
    bg: '현대적이고 세련된 인테리어',
  };

  // 첫 줄 = 제목
  if (lines.length > 0) {
    deck.cards!.push({
      type: 'cover',
      fields: {
        badge: '한올 러그',
        title: lines[0].substring(0, 20),
        sub: lines[1]?.substring(0, 30) || '새로운 공간의 시작',
      },
    });
  }

  // 본문 → content 카드
  const contentLines = lines.slice(2);
  contentLines.forEach((line, idx) => {
    if (line.trim()) {
      deck.cards!.push({
        type: 'content',
        fields: {
          idx: String(idx + 1).padStart(2, '0'),
          total: String(Math.min(contentLines.length, 5)),
          tag: 'Point',
          num: String(idx + 1),
          head: line.substring(0, 30),
          desc: line.substring(30, 80),
        },
      });

      if (idx >= 4) return; // 최대 5개 포인트
    }
  });

  // Closing 카드
  deck.cards!.push({
    type: 'closing',
    fields: {
      head: '지금 바로 시작하세요',
      desc: '한올 러그와 함께 공간을 변화시키세요',
      cta1: '@hanol_marketing_bot 참여',
      cta2: '질문하기',
      hint: 'AI 마케팅 팀이 준비되어 있습니다',
    },
  });

  return deck;
}

// 카드뉴스 덱 → HTML 렌더링 정보
export function deckToHTML(deck: CardNewsDeck): string[] {
  return deck.cards.map((card) => renderCard(card, deck.preset));
}

function renderCard(card: Card, preset: string): string {
  const f = card.fields;

  switch (card.type) {
    case 'cover':
      return `
        <div class="card cover preset-${preset}">
          <div class="badge">${escape(f.badge || '')}</div>
          <div class="title">${escape(f.title || '')}</div>
          <div class="subtitle">${escape(f.sub || '')}</div>
        </div>
      `;

    case 'content':
      return `
        <div class="card content preset-${preset}">
          <div class="tag">${escape(f.tag || '')}</div>
          <div class="number">${escape(f.num || '')}</div>
          <div class="headline">${escape(f.head || '')}</div>
          <div class="description">${escape(f.desc || '')}</div>
          <div class="counter">${escape(f.idx || '')} / ${escape(f.total || '')}</div>
        </div>
      `;

    case 'quote':
      return `
        <div class="card quote preset-${preset}">
          <div class="quote-text">"${escape(f.quote || '')}"</div>
          <div class="quote-by">— ${escape(f.by || '')}</div>
        </div>
      `;

    case 'table':
      const rows = (f.rows || '').split('\n').filter((r) => r.trim());
      const tableHTML = rows
        .map(
          (row) =>
            `<tr>${row
              .split('|')
              .map((cell) => `<td>${escape(cell.trim())}</td>`)
              .join('')}</tr>`
        )
        .join('');
      return `
        <div class="card table preset-${preset}">
          <div class="table-title">${escape(f.title || '')}</div>
          <table>${tableHTML}</table>
        </div>
      `;

    case 'closing':
      return `
        <div class="card closing preset-${preset}">
          <div class="closing-title">${escape(f.head || '')}</div>
          <div class="closing-desc">${escape(f.desc || '')}</div>
          <div class="cta-buttons">
            <button class="cta">${escape(f.cta1 || '')}</button>
            <button class="cta">${escape(f.cta2 || '')}</button>
          </div>
          <div class="hint">${escape(f.hint || '')}</div>
        </div>
      `;

    default:
      return '';
  }
}

function escape(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export type { Card, CardNewsDeck, CardField };
