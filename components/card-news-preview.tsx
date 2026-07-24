'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface CardNewsPreviewProps {
  title: string;
  cardsCount: number;
  onDownload: () => void;
}

export function CardNewsPreview({ title, cardsCount, onDownload }: CardNewsPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${title}-preview.png`;
      link.click();
    } catch (error) {
      console.error('❌ 이미지 다운로드 실패:', error);
      alert('이미지 다운로드에 실패했습니다');
    }
  };

  return (
    <div className="space-y-4">
      {/* 미리보기 */}
      <div
        ref={containerRef}
        className="bg-white rounded-lg p-8 border border-gray-200"
        style={{
          width: '600px',
          maxHeight: '400px',
          overflow: 'hidden',
        }}
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{cardsCount}개의 카드로 구성</p>
          <div className="bg-gray-100 rounded p-8 text-center text-gray-500">
            <p className="text-sm">카드뉴스 미리보기</p>
            <p className="text-xs mt-2">({cardsCount}장의 디자인 카드)</p>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleDownloadImage}
          className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm rounded-lg transition-colors"
        >
          🖼️ 미리보기 다운로드
        </button>
        <button
          onClick={onDownload}
          className="flex-1 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-600 font-medium text-sm rounded-lg transition-colors"
        >
          📦 전체 다운로드 (ZIP)
        </button>
      </div>
    </div>
  );
}
