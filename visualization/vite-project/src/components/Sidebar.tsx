const NAV_ITEMS = ["Explore", "Clusters", "History", "Metrics"];

export function Sidebar({ active }: { active: string }) {
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
      <div className="panel-heading" style={{ fontSize: 15, color: "var(--text-primary)" }}>
        LexiconExplorer
      </div>

      <div className="panel-heading" style={{ marginTop: 20, fontSize: 13 }}>
        Vocabulary Engine
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20 }}>
        V2.4 HIGH-DENSITY
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <div key={item} className={`nav-item ${item === active ? "active" : ""}`}>
            {item}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn btn-primary">EXPORT VECTORS</button>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>System Settings</div>
      </div>
    </div>
  );
}