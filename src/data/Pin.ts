export interface PinData {
  id: number;
  projects: ProjectItem[];
  country: string;
  location1: string;
  location2: string;
  coords: [number, number];
  cardOffset: { x: number; y: number };
}

export interface ProjectItem {
  title: string;
  date: string;
  type: "project" | "study";
  description: string;
  tags: string[];
  link?: string;
}

export const pins: PinData[] = [
  {
    id: 1,
    projects: [
      {
        title: "Clippi",
        date: "2026.03",
        type: "project",
        description: "북마크 관리 및 공유를 위한 풀스택 서비스",
        tags: ["React", "TypeScript", "supabase"],
        link: "https://clippi-seven.vercel.app/",
      },
      {
        title: "intflow",
        date: "2026.02",
        type: "project",
        description: "북마크 관리 및 공유를 위한 풀스택 서비스",
        tags: ["React", "TypeScript", "supabase"],
        link: "https://clippi-seven.vercel.app/",
      },
    ],
    country: "south korea",
    location1: "se",
    location2: "oul",
    coords: [126.978, 37.5665],
    cardOffset: { x: -20, y: -380 },
  },

  {
    id: 2,
    projects: [
      {
        title: "Clippi",
        date: "2026.03",
        type: "project",
        description: "북마크 관리 및 공유를 위한 풀스택 서비스",
        tags: ["React", "TypeScript", "supabase"],
        link: "https://clippi-seven.vercel.app/",
      },
    ],
    country: "japan",
    location1: "to",
    location2: "kyo",
    coords: [139.6917, 35.6895],
    cardOffset: { x: 150, y: 50 },
  },
];
