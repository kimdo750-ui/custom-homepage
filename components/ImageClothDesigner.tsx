'use client';

import { useState, useRef } from 'react';
import KonvaCanvas from './KonvaCanvas';
import ImageDesignPanel from './ImageDesignPanel';

interface DesignElement {
  id: string;
  type: 'image';
  position: 'front' | 'back';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  src: string;
}

export default function ImageClothDesigner() {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [clothColor, setClothColor] = useState('white');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const frontImageMap: Record<string, string> = {
    'white': '/front-images/white_front.png',
    'black': '/front-images/black_front.png',
    'red': '/front-images/red_front.png',
    'yellow': '/front-images/yellow_front.png',
    'sky': '/front-images/sky_front.png',
  };

  const backImageMap: Record<string, string> = {
    'white': '/back-images/white_back.png',
    'black': '/back-images/black_back.png',
    'red': '/back-images/red_back.png',
    'yellow': '/back-images/yellow_back.png',
    'sky': '/back-images/sky_back.png',
  };

  const clothImageUrl = frontImageMap[clothColor] || frontImageMap['white'];
  const backImageUrl = backImageMap[clothColor] || backImageMap['white'];

  const handleAddFrontImage = (result: any) => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'image',
      position: 'front',
      x: 100,
      y: 150,
      width: 400,
      height: 300,
      rotation: 0,
      src: result.imageUrl,
    };
    setElements([...elements, newElement]);
  };

  const handleAddBackImage = (result: any) => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'image',
      position: 'back',
      x: 100,
      y: 150,
      width: 400,
      height: 300,
      rotation: 0,
      src: result.imageUrl,
    };
    setElements([...elements, newElement]);
  };

  const handleUpdateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const handleOrderSubmit = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      alert('이름과 이메일을 입력해주세요');
      return;
    }

    setIsOrderLoading(true);

    try {
      const frontImages = frontElements.map((el) => el.src).join(',');
      const backImages = backElements.map((el) => el.src).join(',');

      console.log('주문 생성:', {
        customerName,
        customerEmail,
        clothColor,
      });

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          clothColor,
          frontImageUrl: frontImages,
          backImageUrl: backImages,
          designImageUrl: frontImages || backImages,
          notes: `이미지 디자인 - 색상: ${clothColor}, 앞면: ${frontElements.length}개, 뒷면: ${backElements.length}개`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '주문 저장 실패');
      }

      console.log('주문 완료:', result.orderId);

      alert(`✅ 주문이 저장되었습니다!\n주문번호: ${result.orderId}`);

      // 폼 초기화
      setShowOrderForm(false);
      setCustomerName('');
      setCustomerEmail('');

    } catch (error) {
      console.error('주문 오류:', error);
      alert(error instanceof Error ? error.message : '주문 저장 중 오류 발생');
    } finally {
      setIsOrderLoading(false);
    }
  };

  const frontElements = elements.filter((el) => el.position === 'front');
  const backElements = elements.filter((el) => el.position === 'back');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      {/* 왼쪽 패널 */}
      <div className="lg:col-span-1">
        <ImageDesignPanel
          clothColor={clothColor}
          onClothColorChange={setClothColor}
          onAddFrontImage={handleAddFrontImage}
          onAddBackImage={handleAddBackImage}
        />

        {elements.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-bold mb-2">현재 디자인</h3>
            <p className="text-sm text-gray-600">
              앞면: {frontElements.length}개<br/>
              뒷면: {backElements.length}개
            </p>

            {/* 주문 버튼 */}
            {!showOrderForm && (
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
              >
                🛒 주문하기
              </button>
            )}

            {/* 주문 폼 */}
            {showOrderForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold mb-3">주문 정보</h4>

                <input
                  type="text"
                  placeholder="이름"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                  maxLength={50}
                />

                <input
                  type="email"
                  placeholder="이메일"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleOrderSubmit}
                    disabled={isOrderLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg"
                  >
                    {isOrderLoading ? '저장 중...' : '주문 확정'}
                  </button>

                  <button
                    onClick={() => setShowOrderForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setElements([])}
              className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg"
            >
              모두 초기화
            </button>
          </div>
        )}
      </div>

      {/* 앞면 캔버스 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold mb-3">👤 앞면</h2>
          <KonvaCanvas
            elements={frontElements}
            clothColor={clothColor}
            clothImageUrl={clothImageUrl}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />
          {frontElements.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-3">
              앞면 이미지 {frontElements.length}개
            </p>
          )}
        </div>
      </div>

      {/* 뒷면 캔버스 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold mb-3">⭐ 뒷면</h2>
          <KonvaCanvas
            elements={backElements}
            clothColor={clothColor}
            clothImageUrl={backImageUrl}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />
          {backElements.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-3">
              뒷면 이미지 {backElements.length}개
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
