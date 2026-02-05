# ShortsSettings 반응형 미리보기 구현

**버전**: v2.2.0
**작성자**: GenSpark AI Developer
**작성일**: 2026-02-05 13:01 KST

## 📋 개요

화면 크기에 따라 미리보기 표시 방식이 달라지는 반응형 레이아웃 구현:
- **큰 화면 (≥1024px)**: 설정 패널 옆에 sticky 미리보기
- **작은 화면 (<1024px)**: 플로팅 버튼 → 클릭 시 fadein 오버레이

## 🎯 사용자 요구사항

> "브라우저 창을 줄여서 설정부분 + 미리보기 가로폭보다 작아지면,  
> 미리보기는 버튼으로 바뀌고 클릭하면 미리보기가 설정 위에  
> fadein 레이어로 나타나고 숨겨지면 됨"

## ✅ 구현 내용

### 1. 큰 화면 (데스크톱, ≥1024px)

```
[    여백    ] [설정 700px] [미리보기 380px] [    여백    ]
                                ↑
                          sticky (따라다님)
```

**특징**:
- 미리보기가 설정 패널 오른쪽에 고정
- 스크롤 시 상단에 붙어서 따라다님 (sticky)
- 실시간 설정 변경 반영

### 2. 작은 화면 (모바일/태블릿, <1024px)

#### (1) 플로팅 버튼 (우하단)
```
┌───────────────┐
│               │
│   설정 패널    │
│               │
│          [📱] │ ← 미리보기 버튼
└───────────────┘
```

**버튼 특징**:
- 위치: 우하단 고정 (fixed bottom-6 right-6)
- 스타일: 그라데이션 (보라→핑크)
- 효과: hover 시 scale-110 확대
- 아이콘: 📱 + "미리보기" 텍스트

#### (2) Fadein 오버레이 (버튼 클릭 시)
```
┌───────────────────────────┐
│                           │
│   ┌─────────────────┐     │
│   │ 📱 실시간 미리보기 [X]│
│   ├─────────────────┤     │
│   │                 │     │
│   │   9:16 미리보기  │     │
│   │                 │     │
│   │   (270x480)     │     │
│   │                 │     │
│   └─────────────────┘     │
│                           │
└───────────────────────────┘
    ↑ 검은 반투명 배경 (bg-black/90)
```

**오버레이 특징**:
- 배경: 검은색 90% 투명도
- 애니메이션: fadein (opacity 0→1, scale 0.9→1, y 20→0)
- 닫기: 배경 클릭 또는 X 버튼
- 내용: 실시간 미리보기 (제목/자막/배경 모두 반영)

## 🔧 기술 구현

### 1. State 추가

```jsx
const [showMobilePreview, setShowMobilePreview] = useState(false);
```

### 2. 데스크톱 미리보기 (모바일에서 숨김)

```jsx
<div className="hidden lg:block w-[380px] flex-shrink-0">
  <div className="sticky top-8">
    {/* 기존 미리보기 코드 */}
  </div>
</div>
```

- `hidden lg:block`: 작은 화면에서 숨김, 큰 화면에서 표시

### 3. 모바일 미리보기 버튼

```jsx
<div className="lg:hidden fixed bottom-6 right-6 z-50">
  <button onClick={() => setShowMobilePreview(true)}>
    📱 미리보기
  </button>
</div>
```

- `lg:hidden`: 큰 화면에서 숨김
- `fixed bottom-6 right-6`: 우하단 고정
- `z-50`: 다른 요소 위에 표시

### 4. 모바일 미리보기 오버레이

```jsx
{showMobilePreview && (
  <div 
    className="fixed inset-0 bg-black/90 z-50"
    onClick={() => setShowMobilePreview(false)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 미리보기 내용 */}
    </motion.div>
  </div>
)}
```

**주요 기능**:
- 조건부 렌더링: `showMobilePreview && ...`
- 전체 화면 오버레이: `fixed inset-0`
- 배경 클릭으로 닫기: `onClick={() => setShowMobilePreview(false)}`
- 내용 클릭 시 닫히지 않음: `onClick={(e) => e.stopPropagation()}`
- Fadein 애니메이션: Framer Motion

## 📊 반응형 브레이크포인트

| 화면 크기 | Tailwind 클래스 | 미리보기 표시 방식 |
|-----------|-----------------|-------------------|
| < 1024px  | `lg:hidden`     | 플로팅 버튼 → 오버레이 |
| ≥ 1024px  | `hidden lg:block` | 오른쪽 sticky 패널 |

**Tailwind lg 브레이크포인트**: 1024px

## 🎨 스타일링

### 플로팅 버튼
- **배경**: `bg-gradient-to-r from-purple-500 to-pink-500`
- **패딩**: `px-6 py-4`
- **모양**: `rounded-full`
- **그림자**: `shadow-2xl`
- **호버**: `hover:scale-110 transition-transform`

### 오버레이 배경
- **색상**: `bg-black/90` (검은색 90% 불투명)
- **레이아웃**: `flex items-center justify-center`
- **z-index**: `z-50`

### 오버레이 카드
- **배경**: `bg-gray-800`
- **모양**: `rounded-xl`
- **패딩**: `p-6`
- **최대 너비**: `max-w-md`
- **최대 높이**: `max-h-[90vh]`
- **스크롤**: `overflow-y-auto`

## 📦 배포 정보

- **빌드 파일**: `index-BlgE7Ipj.js`
- **빌드 크기**: 555.72 kB (gzip: 160.73 kB)
- **CSS 파일**: `index-BJCiXDtN.css` (46.31 kB)
- **빌드 시간**: 1.76초
- **배포 시각**: 2026-02-05 13:01 KST

## 🔧 수정 파일

**파일**: `/home/shorts/frontend/src/pages/ShortsSettingsPage.jsx`

**변경사항**:
1. Import에 `X` 아이콘 추가
2. `showMobilePreview` state 추가
3. 데스크톱 미리보기에 `hidden lg:block` 적용
4. 모바일 플로팅 버튼 추가
5. 모바일 오버레이 팝업 추가

## 🧪 테스트 방법

### 데스크톱 테스트 (≥1024px)
1. 브라우저 창을 1024px 이상으로 확대
2. 설정 패널 오른쪽에 미리보기가 나타나는지 확인
3. 스크롤 시 미리보기가 따라다니는지 확인 (sticky)
4. 플로팅 버튼이 **보이지 않는지** 확인

### 모바일 테스트 (<1024px)
1. 브라우저 창을 1024px 미만으로 축소  
   (또는 Chrome DevTools → Device Toolbar → iPhone/iPad 선택)
2. 오른쪽 미리보기가 **숨겨졌는지** 확인
3. 우하단에 **플로팅 버튼**이 나타나는지 확인
4. 플로팅 버튼 클릭 → 오버레이 fadein 애니메이션 확인
5. 오버레이에서 실시간 미리보기 표시 확인
6. 배경 또는 X 버튼 클릭 → 오버레이 닫힘 확인

### Chrome DevTools 테스트
```
1. F12 (DevTools 열기)
2. Ctrl+Shift+M (Device Toolbar 토글)
3. 상단에서 기기 선택:
   - Desktop (1920x1080) → sticky 미리보기
   - iPad (1024x768) → sticky 미리보기 (경계)
   - iPhone 14 Pro (393x852) → 플로팅 버튼
4. 각 화면 크기에서 동작 확인
```

## ✅ 체크리스트

- [x] 큰 화면에서 sticky 미리보기 표시
- [x] 작은 화면에서 미리보기 숨김
- [x] 작은 화면에서 플로팅 버튼 표시
- [x] 플로팅 버튼 클릭 시 오버레이 표시
- [x] Fadein 애니메이션 (0.3초)
- [x] 배경 클릭으로 오버레이 닫기
- [x] X 버튼으로 오버레이 닫기
- [x] 오버레이 내용 클릭 시 닫히지 않음
- [x] 실시간 미리보기 반영 (제목/자막/배경)
- [x] 빌드 성공
- [x] 배포 완료

## 🌐 테스트 URL

- **설정 페이지**: https://shorts.neuralgrid.kr/shorts-settings
- **생성 페이지**: https://shorts.neuralgrid.kr/shorts-generate

## 📝 사용자 가이드

### 데스크톱 사용자
- 설정을 변경하면 오른쪽 미리보기에 즉시 반영됩니다
- 스크롤해도 미리보기가 상단에 고정되어 따라다닙니다

### 모바일/태블릿 사용자
- 우하단의 📱 미리보기 버튼을 탭하세요
- 전체 화면으로 미리보기가 나타납니다
- 설정 변경사항이 실시간으로 반영됩니다
- 배경 또는 X 버튼을 탭하면 닫힙니다

## 🎯 핵심 포인트

1. **반응형**: 화면 크기에 따라 자동으로 레이아웃 변경
2. **Fadein**: 부드러운 애니메이션으로 사용자 경험 향상
3. **실시간**: 오버레이에서도 설정 변경이 즉시 반영
4. **직관적**: 플로팅 버튼으로 쉽게 미리보기 접근
5. **성능**: 조건부 렌더링으로 불필요한 DOM 생성 방지

## 🔄 이전 버전과의 차이

| 항목 | 이전 (v2.1.4) | 현재 (v2.2.0) |
|------|--------------|--------------|
| 데스크톱 | Sticky 미리보기 | 동일 (유지) |
| 모바일 | 미리보기가 아래로 | 플로팅 버튼 → 오버레이 |
| 접근성 | 스크롤 필요 | 버튼 클릭 한 번 |
| 공간 효율 | 세로 배치로 길어짐 | 설정만 표시, 버튼 하나 |

---

**완료!** 이제 https://shorts.neuralgrid.kr/shorts-settings 에서 반응형 미리보기를 체험할 수 있습니다! 🎉

**테스트 권장**: 
1. 데스크톱 (1920x1080) - 오른쪽 sticky 미리보기
2. 브라우저 창 축소 - 플로팅 버튼 출현
3. 버튼 클릭 - fadein 오버레이 확인
