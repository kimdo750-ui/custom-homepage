'use client';

import { useState, useEffect } from 'react';

interface DesignPanelProps {
  clothColor: string;
  onClothColorChange: (color: string) => void;
  onAddFrontDesign?: (data: any) => void;
  onAddBackDesign?: (data: any) => void;
}

const CONSTELLATIONS = [
  { name: '양자리', symbol: '♈' },
  { name: '황소자리', symbol: '♉' },
  { name: '쌍둥이자리', symbol: '♊' },
  { name: '게자리', symbol: '♋' },
  { name: '사자자리', symbol: '♌' },
  { name: '처녀자리', symbol: '♍' },
  { name: '천칭자리', symbol: '♎' },
  { name: '전갈자리', symbol: '♏' },
  { name: '궁수자리', symbol: '♐' },
  { name: '염소자리', symbol: '♑' },
  { name: '물병자리', symbol: '♒' },
  { name: '물고기자리', symbol: '♓' },
];

// 출생년도로 띠 계산
function calculateZodiac(year: number): string {
  if (!year) return '';
  const zodiacIndex = (year - 1900) % 12;
  const zodiacs = ['쥐', '소', '호랑이', '토끼', '뱀', '말', '양', '원숭이', '닭', '개', '돼지', '용'];
  return zodiacs[zodiacIndex] + '띠';
}

// 명언 리스트 (직접 정의)
const quotes = {
  love: [
    { text: '사랑은 모든것을 이긴다', source: '' },
    { text: '사랑은 주는것이다', source: '' },
    { text: '사랑이 없는곳에 사랑을 심어라', source: '' },
  ],
  friendship: [
    { text: '우정은 영혼과 영혼의 만남이다', source: '' },
  ],
};

export default function DesignPanel({
  clothColor,
  onClothColorChange,
  onAddFrontDesign,
  onAddBackDesign,
}: DesignPanelProps) {
  // 앞면 입력
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [zodiac, setZodiac] = useState('');

  // 뒷면 입력
  const [selectedConstellation, setSelectedConstellation] = useState('');
  const [customBackText, setCustomBackText] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(quotes.love[0].text);
  const [selectedCategory, setSelectedCategory] = useState<string>('love');
  const [backMode, setBackMode] = useState<'quote' | 'constellation' | 'custom'>('quote');

  // 출생년도 변경 시 띠 자동 계산
  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setBirthYear(e.target.value);
    if (year && year > 1900 && year < 2100) {
      setZodiac(calculateZodiac(year));
    } else {
      setZodiac('');
    }
  };

  // 카테고리 변경 시 첫 번째 명언 자동 선택
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryQuotes = quotes[category as keyof typeof quotes] || [];
    if (categoryQuotes.length > 0) {
      setSelectedQuote(categoryQuotes[0].text);
    }
  };

  // 앞면 디자인 추가
  const handleAddFrontDesign = async () => {
    if (!name.trim() || !birthYear) {
      alert('이름과 출생년도를 입력해주세요');
      return;
    }

    if (onAddFrontDesign) {
      try {
        const response = await fetch('/api/generate-front', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, birthYear, zodiac }),
        });

        const result = await response.json();
        console.log('Front design response:', result);

        if (result.imageUrl) {
          onAddFrontDesign(result);
          setName('');
          setBirthYear('');
          setZodiac('');
        } else {
          alert('앞면 생성 실패: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('앞면 생성 중 오류');
      }
    }
  };

  // 뒷면 디자인 추가
  const handleAddBackDesign = async () => {
    let backText = '';
    let endpoint = '/api/generate-back';

    if (backMode === 'constellation') {
      backText = selectedConstellation;
      endpoint = '/api/generate-back';
    } else if (backMode === 'quote') {
      backText = selectedQuote;
      endpoint = '/api/get-phrase-image'; // 프리셋 명언은 파일에서 가져옴
    } else {
      backText = customBackText;
      endpoint = '/api/generate-back';
    }

    if (!backText.trim()) {
      alert('명언, 별자리 또는 문구를 선택/입력해주세요');
      return;
    }

    if (onAddBackDesign) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: backText }),
        });

        const result = await response.json();
        console.log('Back design response:', result);

        if (result.imageUrl) {
          onAddBackDesign(result);
          setSelectedConstellation('');
          setCustomBackText('');
          setSelectedQuote(quotes.love[0].text);
          setSelectedCategory('love');
        } else {
          alert('뒷면 생성 실패: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('뒷면 생성 중 오류');
      }
    }
  };

  return (
    <div className="bg-orange-50 rounded-lg p-6" style={{ backgroundColor: '#FAFBF9' }}>
      <div className="space-y-6">
        {/* 옷 색상 */}
        <div>
          <h3 className="text-base font-bold mb-4" style={{ color: '#222B24' }}>옷 색상 선택</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: '흰색', value: 'white' },
            { name: '검정', value: 'black' },
            { name: '빨강', value: 'red' },
            { name: '노랑', value: 'yellow' },
            { name: '스카이', value: 'sky' },
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => onClothColorChange(color.value)}
              className={`p-3 rounded-lg font-semibold text-sm transition transform hover:scale-105 ${
                clothColor === color.value
                  ? 'text-white shadow-lg border-2'
                  : 'text-gray-700 hover:shadow-md bg-white border border-gray-200'
              }`}
              style={{
                backgroundColor: clothColor === color.value ? '#5A6E5D' : 'white',
                borderColor: clothColor === color.value ? '#5A6E5D' : '#e5e7eb',
                color: clothColor === color.value ? 'white' : '#222B24'
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
        </div>

        {/* 앞면 */}
        <div>
          <h3 className="text-base font-bold mb-4" style={{ color: '#222B24' }}>앞면 디자인</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#222B24' }}>이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김동일"
                className="w-full px-3 py-2 text-sm rounded-lg transition border focus:outline-none"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#D2DDD4',
                  color: '#222B24'
                }}
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#222B24' }}>출생년도 <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={birthYear}
                onChange={handleBirthYearChange}
                placeholder="예: 1990"
                className="w-full px-3 py-2 text-sm rounded-lg transition border focus:outline-none"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#D2DDD4',
                  color: '#222B24'
                }}
                min={1900}
                max={2024}
              />
            </div>

            {zodiac && (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#F9F8F6', borderColor: '#D2DDD4' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#5A6E5D' }}>띠:</p>
                <p className="text-sm font-bold" style={{ color: '#5A6E5D' }}>{zodiac}</p>
              </div>
            )}

            <button
              onClick={handleAddFrontDesign}
              className="w-full font-bold py-3 rounded-lg shadow-sm transition transform hover:scale-105 hover:shadow-lg text-sm mt-2 text-white"
              style={{
                backgroundColor: '#5A6E5D'
              }}
            >
              앞면 추가하기
            </button>
          </div>
        </div>

        {/* 뒷면 */}
        <div>
          <h3 className="text-base font-bold mb-4" style={{ color: '#222B24' }}>뒷면 디자인</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBackMode('quote')}
                className="p-2.5 rounded-lg font-semibold text-sm transition transform hover:scale-105"
                style={{
                  backgroundColor: backMode === 'quote' ? '#5A6E5D' : 'white',
                  color: backMode === 'quote' ? 'white' : '#222B24',
                  border: backMode === 'quote' ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                }}
              >
                명언
              </button>
              <button
                onClick={() => setBackMode('constellation')}
                className="p-2.5 rounded-lg font-semibold text-sm transition transform hover:scale-105"
                style={{
                  backgroundColor: backMode === 'constellation' ? '#5A6E5D' : 'white',
                  color: backMode === 'constellation' ? 'white' : '#222B24',
                  border: backMode === 'constellation' ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                }}
              >
                별자리
              </button>
              <button
                onClick={() => setBackMode('custom')}
                className="p-2.5 rounded-lg font-semibold text-sm transition transform hover:scale-105"
                style={{
                  backgroundColor: backMode === 'custom' ? '#5A6E5D' : 'white',
                  color: backMode === 'custom' ? 'white' : '#222B24',
                  border: backMode === 'custom' ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                }}
              >
                직접입력
              </button>
            </div>

          {backMode === 'quote' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">카테고리</label>
                <div className="grid grid-cols-2 gap-2">
                  {['love', 'friendship'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className="p-2.5 rounded-lg text-xs font-semibold transition"
                      style={{
                        backgroundColor: selectedCategory === cat ? '#5A6E5D' : 'white',
                        color: selectedCategory === cat ? 'white' : '#222B24',
                        border: selectedCategory === cat ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                      }}
                    >
                      {cat === 'love' && '❤️ 사랑'}
                      {cat === 'friendship' && '🤝 우정'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">명언 선택</label>
                <div className="grid grid-cols-1 gap-2">
                  {(quotes[selectedCategory as keyof typeof quotes] || []).map((quote) => (
                    <button
                      key={quote.text}
                      onClick={() => setSelectedQuote(quote.text)}
                      className="p-2.5 rounded-lg text-xs text-left font-semibold transition"
                      style={{
                        backgroundColor: selectedQuote === quote.text ? '#5A6E5D' : 'white',
                        color: selectedQuote === quote.text ? 'white' : '#222B24',
                        border: selectedQuote === quote.text ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                      }}
                      title={quote.text}
                    >
                      <div className="truncate">{quote.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {backMode === 'constellation' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">별자리 선택</label>
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                {CONSTELLATIONS.map((const_item) => (
                  <button
                    key={const_item.name}
                    onClick={() => setSelectedConstellation(const_item.name)}
                    className="p-2.5 rounded-lg text-xs font-semibold transition"
                    style={{
                      backgroundColor: selectedConstellation === const_item.name ? '#5A6E5D' : 'white',
                      color: selectedConstellation === const_item.name ? 'white' : '#222B24',
                      border: selectedConstellation === const_item.name ? '2px solid #5A6E5D' : '1px solid #D2DDD4'
                    }}
                  >
                    {const_item.symbol} {const_item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {backMode === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">문구 입력</label>
              <textarea
                value={customBackText}
                onChange={(e) => setCustomBackText(e.target.value)}
                placeholder="원하는 문구를 입력하세요..."
                className="w-full px-3 py-2 text-sm resize-none border border-gray-300 rounded-lg"
                rows={2}
                maxLength={15}
              />
            </div>
          )}

            <button
              onClick={handleAddBackDesign}
              className="w-full font-bold py-3 rounded-lg shadow-sm transition transform hover:scale-105 hover:shadow-lg text-sm mt-2 text-white"
              style={{
                backgroundColor: '#5A6E5D'
              }}
            >
              뒷면 추가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
