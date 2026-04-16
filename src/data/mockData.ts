import type { BugPin } from "../types";

export const mockBugs: BugPin[] = [
  {
    id: 1,
    title: "INFINITE LOOP",
    subtitle: "useEffect 의존성 배열 실수",
    lat: 37.5665,
    lng: 126.978,
    difficulty: 2,
    tech_stack: ["React", "TypeScript"],
    one_line_problem: "useEffect 안에서 state를 업데이트했는데 deps에 넣어버림",
    one_line_solution: "의존성 배열에서 해당 state 제거 + useCallback 분리",
    days_spent: 1,
  },
  {
    id: 2,
    title: "CORS ERROR",
    subtitle: "API 연동 첫날의 지옥",
    lat: 35.1796,
    lng: 129.0756,
    difficulty: 3,
    tech_stack: ["Node.js", "Express"],
    one_line_problem: "프론트-백엔드 도메인이 달라서 브라우저가 요청을 막음",
    one_line_solution: "서버에 cors 미들웨어 추가 + origin 설정",
    days_spent: 2,
  },
  {
    id: 3,
    title: "TYPE HELL",
    subtitle: "제네릭 타입 추론 실패",
    lat: 33.4996,
    lng: 126.5312,
    difficulty: 4,
    tech_stack: ["TypeScript"],
    one_line_problem:
      "제네릭 함수에서 타입이 unknown으로 추론되어 전체 타입 붕괴",
    one_line_solution: "명시적 타입 파라미터 전달 + 타입 가드 추가",
    days_spent: 3,
  },
];
