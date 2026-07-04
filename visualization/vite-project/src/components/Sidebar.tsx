type Page = "explore" | "project-info" | "creators";

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: "Explore", page: "explore" },
  { label: "Project Info", page: "project-info" },
  { label: "Creators", page: "creators" },
];

interface SidebarProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ page, onPageChange }: SidebarProps) {
  return (
    <div
      style={{
        width: 220,
        height: "100%",
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-panel)",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <div
        className="panel-heading"
        style={{ fontSize: 15, color: "var(--text-primary)" }}
      >
        Word2Vec Visualizer
      </div>

      <div className="panel-heading" style={{ marginTop: 20, fontSize: 13 }}>
        Vocabulary Engine
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 20,
        }}
      >
        V2.4 HIGH-DENSITY
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onPageChange(item.page)}
            className={`nav-item ${page === item.page ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
              padding: 0,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button className="btn btn-primary">EXPORT VECTORS</button>

        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          System Settings
        </div>
      </div>
    </div>
  );
}