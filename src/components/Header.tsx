import "./Header.css";

type Page = "world" | "project" | "detail";

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isPlaying: boolean;
  onSoundtrackClick: () => void;
}

const NAV_ITEMS: { label: string; value: Page }[] = [
  { label: "world", value: "world" },
  { label: "project", value: "project" },
  { label: "detail", value: "detail" },
];

export default function Header({
  currentPage,
  onPageChange,
  isPlaying,
  onSoundtrackClick,
}: HeaderProps) {
  return (
    <header className="header">
      <nav className="header-nav">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.value}
            className={`nav-item ${currentPage === item.value ? "active" : ""}`}
            onClick={() => onPageChange(item.value)}
          >
            {item.label}
            {i < NAV_ITEMS.length - 1 && <span className="nav-dot">·</span>}
          </button>
        ))}
      </nav>

      <button className="soundtrack-btn" onClick={onSoundtrackClick}>
        <span className="equalizer">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <span
              key={i}
              className={`bar bar-${i + 1} ${isPlaying ? "playing" : ""}`}
            />
          ))}
        </span>
        <span className="soundtrack-label">soundtrack</span>
      </button>
    </header>
  );
}
