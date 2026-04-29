# 🗺️ [프로젝트 이름]

> D3.js 기반 인터랙티브 지도 포트폴리오

<br />

## 소개

지도를 탐색하듯 프로젝트를 둘러볼 수 있는 포트폴리오 사이트입니다.
단순한 리스트나 블로그 형식 대신, D3.js 월드맵 위에 핀을 배치하고
핀을 클릭하면 해당 장소와 연결된 프로젝트들을 3D 캐러셀로 탐색할 수 있습니다.

<br />

## 기술 스택

| 분류       | 기술                      |
| ---------- | ------------------------- |
| 프레임워크 | React                     |
| 언어       | TypeScript                |
| 시각화     | D3.js                     |
| 스타일링   | CSS (순수 CSS 애니메이션) |

<br />

## 주요 기능

**월드맵 인터랙션**

- D3.js로 렌더링한 SVG 세계지도
- 핀 클릭 시 해당 장소의 프로젝트 패널로 전환
- 줌 / 팬 인터랙션 지원

**3D 프로젝트 캐러셀**

- CSS `perspective` + `rotateY` + `translateZ` 기반 3D 카드 전환
- 마우스 휠 또는 도트 네비게이션으로 탐색
- `project` / `skill` 타입별 카드 디자인 구분

**도시명 타이핑 애니메이션**

- 패널 진입 시 도시명이 한 글자씩 등장하는 blur fade 효과

<br />

## 프로젝트 구조

```
src/
├── components/
│   ├── PinCard.tsx          # 지도 위 핀 카드
│   └── ProjectPanel.tsx     # 프로젝트 목록 패널 (3D 캐러셀)
├── data/
│   └── Pin.ts               # 핀 및 프로젝트 데이터
└── App.tsx
```

<br />

## 데이터 구조

```typescript
interface PinData {
  id: number;
  country: string;
  location1: string;
  location2: string;
  coords: [number, number];
  projects: ProjectItem[];
}

interface ProjectItem {
  title: string;
  date: string;
  type: "project" | "skill";
  description: string;
  tags: string[];
  link?: string;
}
```

<br />

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

<br />

## 제작 의도

프론트엔드 개발자로서 단순히 프로젝트 목록을 나열하는 것보다,
인터랙티브한 웹 구현 자체로 기술력을 보여주고 싶었습니다.
D3.js 지도, CSS 3D transform, 커스텀 애니메이션 등을
하나의 흐름으로 엮어 경험 중심의 포트폴리오를 구성했습니다.
