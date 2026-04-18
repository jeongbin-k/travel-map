export interface PinData {
  id: number;
  title: string;
  location: string;
  coords: [number, number];
  description: string;
  date: string;
  tags: string[];
  type: "Project" | "study";
  link?: string;
}

export const pins: PinData[] = [
  {
    id: 1,
    title: "Clippi",
    location: "Seoul",
    coords: [126.978, 37.5665],
    description: "북마크 관리 및 공유를 위한 풀스택 서비스",
    date: "2026.03",
    tags: ["React", "TypeScript", "Supabase"],
    type: "Project",
    link: "https://clippi-seven.vercel.app/",
  },
];
