# 🔧 Scene Count 위치 수정

## 문제

"총 10개 장면 · 예상 시간: 61초" 문구가 미리보기 옆(flex-row 컨테이너 밖)에 위치했습니다.

### Before
```
┌─────────────────────────────────────┐
│ 설정 (700px)  │  미리보기 (380px)  │
│               │                     │
└─────────────────────────────────────┘
                    "총 10개 장면..." ← 여기 (잘못된 위치)
```

## 해결

Scene Count를 설정 패널 맨 아래로 이동:

### After
```
┌─────────────────────────────────────┐
│ 설정 (700px)  │  미리보기 (380px)  │
│               │                     │
│ "총 10개 장면...  │                 │
│  (여기!)        │                   │
└─────────────────────────────────────┘
```

## 변경 내용

### 위치 이동
- **From**: flex-row 컨테이너 밖 (1940번 라인)
- **To**: 설정 패널 맨 아래, "생성 페이지로" 버튼 아래 (1788번 라인)

### 구조
```jsx
<div className="w-[700px] space-y-6">
  {/* 모든 설정 카드들 */}
  
  {/* 버튼들 */}
  <div className="flex gap-4">
    <button>실시간 자동저장</button>
    <button>생성 페이지로</button>
  </div>
  
  {/* Scene Count Info */}
  <motion.div className="mt-4 text-center text-gray-500 text-sm">
    <p>총 {scenes.length}개 장면 · 예상 시간: {scenes.reduce(...)}초</p>
  </motion.div>
</div>
```

## 배포 정보

- **빌드 파일**: `index-CpQrKTN-.js`
- **배포 시각**: 2026-02-05 15:05 KST
- **테스트 URL**: https://shorts.neuralgrid.kr/shorts-settings

## 확인 사항

✅ Scene Count가 설정 패널 내부에 위치
✅ 미리보기 옆이 아닌 설정 아래에 표시
✅ 가로 레이아웃 유지 (설정 700px + 미리보기 380px)
