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
  const zodiacs = ['쥐', '소', '호랑이', '토끼', '뱀', '말', '양', '원숭이', '닭', '개', '돼지', '쥐'];
  return zodiacs[zodiacIndex] + '띠';
}

interface Quote {
  text: string;
  source: string;
}

interface QuoteCategory {
  [key: string]: Quote[];
}

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
  const [selectedQuote, setSelectedQuote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('love');
  const [backMode, setBackMode] = useState<'quote' | 'constellation' | 'custom'>('quote');
  const [quotes, setQuotes] = useState<QuoteCategory>({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // 명언 데이터 로드
  useEffect(() => {
    const loadQuotes = async () => {
      setLoadingQuotes(true);
      try {
        const response = await fetch('/api/quotes');
        const data = await response.json();
        if (data.quotes) {
          setQuotes(data.quotes);
          // 기본값: love 카테고리의 첫 번째 명언
          const loveQuotes = data.quotes.love || [];
          if (loveQuotes.length > 0) {
            setSelectedQuote(loveQuotes[0].text);
          }
        }
      } catch (error) {
        console.error('Failed to load quotes:', error);
      } finally {
        setLoadingQuotes(false);
      }
    };

    loadQuotes();
  }, []);

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
    const categoryQuotes = quotes[category] || [];
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
          body: JSON.stringify({ name, birthYear, zodiac, clothColor }),
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
          setSelectedQuote('');
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
    <div className="space-y-6">
      {/* 옷 색상 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">옷 색상</h2>
        <div className="space-y-2">
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
              className={`w-full p-3 rounded-lg font-medium transition ${
                clothColor === color.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* 앞면 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">👤 앞면</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김동일"
              className="w-full p-3 border border-gray-300 rounded-lg"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">출생년도</label>
            <input
              type="number"
              value={birthYear}
              onChange={handleBirthYearChange}
              placeholder="예: 1990"
              className="w-full p-3 border border-gray-300 rounded-lg"
              min={1900}
              max={2024}
            />
          </div>

          {zodiac && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">🐯 띠:</p>
              <p className="text-lg font-bold text-blue-600">{zodiac}</p>
            </div>
          )}

          <button
            onClick={handleAddFrontDesign}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            앞면 추가
          </button>
        </div>
      </div>

      {/* 뒷면 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">⭐ 뒷면</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setBackMode('quote')}
              className={`p-2 rounded-lg font-medium text-sm ${
                backMode === 'quote'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              💭 명언
            </button>
            <button
              onClick={() => setBackMode('constellation')}
              className={`p-2 rounded-lg font-medium text-sm ${
                backMode === 'constellation'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              ✨ 별자리
            </button>
            <button
              onClick={() => setBackMode('custom')}
              className={`p-2 rounded-lg font-medium text-sm ${
                backMode === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              ✏️ 직접입력
            </button>
          </div>

          {backMode === 'quote' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {['love', 'friend', 'success', 'challenge', 'happy', 'memory'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`p-2 rounded-lg text-xs font-medium ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {cat === 'love' && '❤️ 사랑'}
                      {cat === 'friend' && '🤝 우정'}
                      {cat === 'success' && '🏆 성공'}
                      {cat === 'challenge' && '🔥 도전'}
                      {cat === 'happy' && '🌟 행복'}
                      {cat === 'memory' && '👴 추억'}
                    </button>
                  ))}
                </div>
              </div>

              {loadingQuotes ? (
                <p className="text-center text-gray-400 text-sm">로딩중...</p>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">명언 선택</label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {(quotes[selectedCategory] || []).map((quote) => (
                      <button
                        key={quote.text}
                        onClick={() => setSelectedQuote(quote.text)}
                        className={`p-2 rounded-lg text-xs text-left font-medium ${
                          selectedQuote === quote.text
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100'
                        }`}
                        title={quote.text}
                      >
                        <div className="truncate">{quote.text}</div>
                        {quote.source && <div className="text-xs opacity-60">- {quote.source}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {backMode === 'constellation' && (
            <div>
              <label className="block text-sm font-medium mb-2">별자리 선택</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {CONSTELLATIONS.map((const_item) => (
                  <button
                    key={const_item.name}
                    onClick={() => setSelectedConstellation(const_item.name)}
                    className={`p-2 rounded-lg text-sm font-medium ${
                      selectedConstellation === const_item.name
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    {const_item.symbol} {const_item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {backMode === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">문구 입력</label>
              <textarea
                value={customBackText}
                onChange={(e) => setCustomBackText(e.target.value)}
                placeholder="원하는 문구를 입력하세요..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                maxLength={15}
              />
            </div>
          )}

          <button
            onClick={handleAddBackDesign}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
          >
            뒷면 추가
          </button>
        </div>
      </div>
    </div>
  );
}
