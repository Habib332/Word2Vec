export function StatusBar({ cursor }: { cursor: { x: number; y: number } | null }) {
  return (
    <div
      style={{
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-panel)",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 6px var(--success)",
            display: "inline-block",
          }}
        />
        ENGINE ONLINE
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span>X {cursor ? cursor.x.toFixed(2) : "—"}</span>
        <span>Y {cursor ? cursor.y.toFixed(2) : "—"}</span>
      </div>
    </div>
  );
}