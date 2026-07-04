const NAV_ITEMS = ["Explore", "Clusters", "History", "Metrics"];

export function Sidebar({ active }: { active: string }) {
  return (
    <div
      style={{
        width: 220,
        height: "100%",
        border: "1px dashed var(--accent)",
        boxShadow: "0 0 12px rgba(34, 211, 238, 0.15)",
        background: "var(--bg-panel)",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <div className="brand-heading" style={{ color: "var(--accent)", fontSize: 17 }}>
        LexiconExplorer
      </div>

      <div className="panel-heading" style={{ marginTop: 20, fontSize: 13 }}>
        Vocabulary Engine
      </div>
      <div className="data-mono" style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20 }}>
        V2.4 HIGH-DENSITY
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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