import html2canvas from 'html2canvas';
import { CardNewsDeck } from './generator';

interface RenderOptions {
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
}

export async function renderCardToPNG(
  cardHTML: string,
  options: RenderOptions = {}
): Promise<Blob> {
  const {
    width = 1080,
    height = 1350,
    scale = 2,
    quality = 0.95,
  } = options;

  // HTML을 임시 엘리먼트로 생성
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cardHTML;
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = `${width}px`;
  tempDiv.style.height = `${height}px`;
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      width,
      height,
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to blob conversion failed'));
        },
        'image/png',
        quality
      );
    });
  } finally {
    document.body.removeChild(tempDiv);
  }
}

export async function renderDeckToImages(
  deck: CardNewsDeck,
  cardHTMLs: string[]
): Promise<Blob[]> {
  console.log(`🎨 ${cardHTMLs.length}개 카드를 이미지로 렌더링 중...`);

  const blobs: Blob[] = [];
  for (let i = 0; i < cardHTMLs.length; i++) {
    try {
      const blob = await renderCardToPNG(cardHTMLs[i]);
      blobs.push(blob);
      console.log(`✅ 카드 ${i + 1}/${cardHTMLs.length} 완료`);
    } catch (error) {
      console.error(`❌ 카드 ${i + 1} 렌더링 실패:`, error);
      throw error;
    }
  }

  console.log(`✅ 모든 ${blobs.length}개 카드 렌더링 완료`);
  return blobs;
}

// 카드뉴스 스타일시트 (1080×1350)
export const CARD_STYLES = `
<style>
  .card {
    width: 1080px;
    height: 1350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif;
  }

  .card.cover {
    background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
    justify-content: space-around;
  }

  .card.cover .badge {
    font-size: 16px;
    font-weight: 600;
    color: #0066ff;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .card.cover .title {
    font-size: 56px;
    font-weight: 800;
    color: #000;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 20px;
  }

  .card.cover .subtitle {
    font-size: 28px;
    font-weight: 400;
    color: #666;
    text-align: center;
    line-height: 1.4;
  }

  .card.content {
    background: white;
    border-top: 4px solid #0066ff;
  }

  .card.content .tag {
    font-size: 14px;
    font-weight: 700;
    color: #0066ff;
    letter-spacing: 1px;
    margin-bottom: 16px;
    text-transform: uppercase;
  }

  .card.content .headline {
    font-size: 44px;
    font-weight: 700;
    color: #000;
    line-height: 1.3;
    margin-bottom: 24px;
    max-width: 800px;
  }

  .card.content .description {
    font-size: 24px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 900px;
    text-align: left;
  }

  .card.content .counter {
    font-size: 16px;
    color: #999;
    margin-top: auto;
  }

  .card.quote {
    background: linear-gradient(135deg, #0066ff05 0%, #7c3aed05 100%);
    justify-content: center;
    text-align: center;
  }

  .card.quote .quote-text {
    font-size: 44px;
    font-weight: 600;
    color: #000;
    line-height: 1.6;
    max-width: 850px;
    margin-bottom: 40px;
    font-style: italic;
  }

  .card.quote .quote-by {
    font-size: 20px;
    color: #0066ff;
    font-weight: 600;
  }

  .card.closing {
    background: linear-gradient(135deg, #000 0%, #333 100%);
    color: white;
    text-align: center;
  }

  .card.closing .closing-title {
    font-size: 52px;
    font-weight: 800;
    margin-bottom: 24px;
    line-height: 1.3;
  }

  .card.closing .closing-desc {
    font-size: 24px;
    color: #ddd;
    margin-bottom: 40px;
    line-height: 1.5;
    max-width: 800px;
  }

  .card.closing .cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 40px;
  }

  .card.closing .cta {
    padding: 16px 32px;
    border: 2px solid white;
    background: transparent;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .card.closing .cta:hover {
    background: white;
    color: #000;
  }

  .card.closing .hint {
    font-size: 14px;
    color: #999;
    margin-top: auto;
  }

  .card.table {
    background: white;
  }

  .card.table .table-title {
    font-size: 36px;
    font-weight: 700;
    color: #000;
    margin-bottom: 32px;
  }

  .card.table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 18px;
  }

  .card.table td {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
</style>
`;
