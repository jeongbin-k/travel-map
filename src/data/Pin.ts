export interface PinData {
  id: number;
  title: string;
  country: string;
  location1: string;
  location2: string;
  coords: [number, number];
  description: string;
  date: string;
  tags: string[];
  type: "Project" | "study";
  link?: string;
  cardOffset: { x: number; y: number };
}

export const pins: PinData[] = [
  {
    id: 1,
    title: "Clippi",
    country: "south korea",
    location1: "se",
    location2: "oul",
    coords: [126.978, 37.5665],
    description: "북마크 관리 및 공유를 위한 풀스택 서비스",
    date: "2026.03",
    tags: ["React", "TypeScript", "Supabase"],
    type: "Project",
    link: "https://clippi-seven.vercel.app/",
    cardOffset: { x: -20, y: -380 },
  },

  {
    id: 2,
    title: "Clippi",
    country: "japan",
    location1: "to",
    location2: "kyo",
    coords: [139.6917, 35.6895],
    description: "북마크 관리 및 공유를 위한 풀스택 서비스",
    date: "2026.03",
    tags: ["React", "TypeScript", "Supabase"],
    type: "Project",
    link: "https://clippi-seven.vercel.app/",
    cardOffset: { x: 120, y: -100 },
  },
];
