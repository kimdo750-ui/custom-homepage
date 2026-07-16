'use client';

import { useState } from 'react';
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

export default function ImageDesigner() {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [clothColor, setClothColor] = useState('white');

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

  const frontImageUrl = frontImageMap[clothColor] || frontImageMap['white'];
  const backImageUrl = backImageMap[clothColor] || backImageMap['white'];

  const handleAddFrontImage = (result: any) => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'image',
      position: 'front',
      x: 150,
      y: 200,
      width: 200,
      height: 150,
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
      x: 150,
      y: 200,
      width: 200,
      height: 150,
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
            <button
              onClick={() => setElements([])}
              className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg"
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
            clothImageUrl={frontImageUrl}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
          />
          {frontElements.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-3">
              앞면 디자인 {frontElements.length}개
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
              뒷면 디자인 {backElements.length}개
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
