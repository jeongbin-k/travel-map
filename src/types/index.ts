export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface BugPin {
  id: number;
  title: string; // 에러명 (카드에 크게 표시)
  subtitle: string; // 한 줄 설명
  lat: number;
  lng: number;
  difficulty: Difficulty;
  tech_stack: string[];
  one_line_problem: string;
  one_line_solution: string;
  screenshot_url?: string;
  github_url?: string;
  demo_url?: string;
  days_spent: number;
  created_at?: string;
}
