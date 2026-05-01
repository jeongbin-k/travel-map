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
  type: "project" | "design" | "skill";
  description: string;
  tags: string[];
  link?: string;
  image?: string;
  github?: string;
  proficiency?: { label: string; value: number }[];
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
        image: "/public/projects/project1.png",
        proficiency: [
          { label: "Reat", value: 90 },
          { label: "TypeScript", value: 85 },
          { label: "supabase", value: 78 },
        ],
      },
      {
        title: "intflow",
        date: "2026.02",
        type: "design",
        description: "북마크 관리 및 공유를 위한 풀스택 서비스",
        tags: ["React", "TypeScript", "supabase"],
        link: "https://clippi-seven.vercel.app/",
      },
      {
        title: "JavaScript",
        date: "2026.02",
        type: "skill",
        description: "Math 객체 주요 메서드",
        tags: ["JavaScript"],
        link: "https://clippi-seven.vercel.app/",
      },
      {
        title: "TypeScript",
        date: "2026.02",
        type: "skill",
        description: "북마크 관리 및 공유를 위한 풀스택 서비스",
        tags: ["TypeScript"],
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
