export function StatusBar({ cursor }: { cursor: { x: number; y: number } | null }) {
  return (
    <div
      style={{
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: 11,
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
          }}
        />
        ENGINE ONLINE
      </div>
      <div>
        LOC_X: {cursor ? cursor.x.toFixed(2) : "--"} &nbsp; LOC_Y:{" "}
        {cursor ? cursor.y.toFixed(2) : "--"}
      </div>
    </div>
  );
}