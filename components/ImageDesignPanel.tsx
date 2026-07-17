'use client';

import { useRef, useState } from 'react';

interface ImageDesignPanelProps {
  clothColor: string;
  onClothColorChange: (color: string) => void;
  onAddFrontImage?: (data: any) => void;
  onAddBackImage?: (data: any) => void;
}

export default function ImageDesignPanel({
  clothColor,
  onClothColorChange,
  onAddFrontImage,
  onAddBackImage,
}: ImageDesignPanelProps) {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontLoading, setFrontLoading] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  const handleFileSelect = async (
    file: File,
    position: 'front' | 'back',
    callback?: (data: any) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택 가능합니다');
      return;
    }

    const isBack = position === 'back';
    if (isBack) {
      setBackLoading(true);
    } else {
      setFrontLoading(true);
    }

    try {
      // 미리보기 표시 (원본)
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isBack) {
          setBackPreview(e.target?.result as string);
        } else {
          setFrontPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      // 이미지 저장
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('파일 업로드:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('업로드 응답:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || '파일 저장 실패');
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.imageData && callback) {
        // Base64 이미지 데이터로 콜백
        callback({
          imageUrl: uploadResult.imageData,
          filename: uploadResult.filename,
          message: uploadResult.message,
        });

        console.log('Base64 변환 완료, 크기:', uploadResult.imageData.length);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '이미지 처리 중 오류 발생');
    } finally {
      if (isBack) {
        setBackLoading(false);
      } else {
        setFrontLoading(false);
      }
    }
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'front', onAddFrontImage);
      if (frontInputRef.current) frontInputRef.current.value = '';
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'back', onAddBackImage);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 옷 색상 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">옷 색상</h2>
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
              className={`w-full p-3 sm:p-2 rounded-lg font-medium text-base sm:text-sm transition active:scale-95 ${
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

      {/* 앞면 이미지 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">👤 앞면</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-gray-600">
            <p className="font-medium mb-2">이미지를 업로드하면 자동으로 누끼 처리됩니다</p>
            {frontPreview && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">원본 이미지 미리보기</p>
                <img src={frontPreview} alt="front preview" className="w-full h-auto rounded" />
              </div>
            )}
          </div>

          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            onChange={handleFrontFileChange}
            className="hidden"
          />

          <button
            onClick={() => frontInputRef.current?.click()}
            disabled={frontLoading}
            className={`w-full p-3 sm:p-2 rounded-lg font-medium text-base sm:text-sm transition active:scale-95 ${
              frontLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {frontLoading ? '누끼 처리 중...' : '앞면 이미지 선택'}
          </button>
        </div>
      </div>

      {/* 뒷면 이미지 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">⭐ 뒷면</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="text-xs sm:text-sm text-gray-600">
            <p className="font-medium mb-2">이미지를 업로드하면 자동으로 누끼 처리됩니다</p>
            {backPreview && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">원본 이미지 미리보기</p>
                <img src={backPreview} alt="back preview" className="w-full h-auto rounded" />
              </div>
            )}
          </div>

          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackFileChange}
            className="hidden"
          />

          <button
            onClick={() => backInputRef.current?.click()}
            disabled={backLoading}
            className={`w-full p-3 sm:p-2 rounded-lg font-medium text-base sm:text-sm transition active:scale-95 ${
              backLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {backLoading ? '누끼 처리 중...' : '뒷면 이미지 선택'}
          </button>
        </div>
      </div>
    </div>
  );
}
