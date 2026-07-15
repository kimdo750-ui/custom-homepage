# Custom Apparel Designer

AI 기반 전사지 자동 배치 도구로, 문구 입력 → AI 디자인 생성 → 옷에 배치 → 출력의 전체 과정을 한 곳에서 처리합니다.

## 기술 스택

- **Framework**: Next.js 16 (무료)
- **UI**: React 19 + Tailwind CSS (무료)
- **Canvas**: Konva.js + react-konva (무료)
- **AI**: Google Generative AI (무료 API)
- **Export**: html2canvas (무료)

**총 비용: ₩0**

## 폴더 구조

```
custom-homepage/
├── app/
│   ├── api/
│   │   └── generate/route.ts      # AI 디자인 생성 API
│   ├── layout.tsx                 # 레이아웃
│   ├── page.tsx                   # 메인 페이지
│   └── globals.css                # 글로벌 스타일
├── components/
│   ├── ClothDesigner.tsx          # 메인 컴포넌트
│   ├── KonvaCanvas.tsx            # Konva 캔버스 (드래그, 회전 등)
│   └── DesignPanel.tsx            # 왼쪽 컨트롤 패널
├── package.json                   # 의존성
├── tsconfig.json                  # TypeScript 설정
├── tailwind.config.ts             # Tailwind 설정
└── next.config.ts                 # Next.js 설정
```

## 기능

### ✅ 완료
- [x] 프로젝트 기본 구조
- [x] Konva 캔버스 (드래그, 회전, 크기 조절)
- [x] 옷 색상 선택
- [x] 디자인 요소 추가/삭제
- [x] PNG 내보내기
- [x] AI 디자인 생성 API 연결

### 🔄 예정
- [ ] 실제 옷 이미지 (무지 티셔츠 모양)
- [ ] 자동 배치 알고리즘
- [ ] 색상 조정 기능
- [ ] 다중 레이어 지원
- [ ] Undo/Redo
- [ ] 모바일 반응형

## 설치 & 실행

### 1. 프로젝트 설정

```bash
cd E:\rug-homepage\custom-homepage
npm install
```

### 2. 환경변수 설정

`.env.local` 파일 생성 후:

```
GOOGLE_API_KEY=your_api_key
```

**Google API Key 받는 법:**
1. https://aistudio.google.com/app/apikeys 방문
2. "Create API Key" 클릭
3. 키 복사해서 .env.local에 붙여넣기

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 사용법

1. **문구 입력** → "AI 디자인 생성" 버튼 클릭
2. **디자인 선택** → 캔버스에 자동 배치
3. **조정**:
   - 드래그로 위치 이동
   - 모서리로 크기 조절
   - 모서리 원으로 회전
4. **삭제**: 우클릭
5. **저장**: "PNG로 내보내기" 클릭

## API 문서

### POST /api/generate

**요청:**
```json
{
  "text": "우리의 이야기"
}
```

**응답:**
```json
{
  "imageUrl": "data:image/png;base64,...",
  "description": "디자인 설명"
}
```

## 다음 단계

1. **실제 옷 이미지 추가**
   - 무지 티셔츠 PNG 준비
   - KonvaCanvas에 배경 이미지로 추가

2. **Google Gemini 이미지 생성 활성화**
   - generate/route.ts에서 실제 이미지 생성 로직 구현

3. **고급 기능**
   - 텍스트 요소 추가
   - 색상 변경
   - 자동 배치 알고리즘

## 문제 해결

**Port 3000 이미 사용 중:**
```bash
npm run dev -- -p 3001
```

**모듈 찾을 수 없음:**
```bash
npm install --force
```

**API 키 오류:**
- .env.local 파일 존재 확인
- 올바른 Google API 키 확인
