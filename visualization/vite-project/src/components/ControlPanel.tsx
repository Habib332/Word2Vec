export function ControlPanel({
  pointCount,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  pointCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        width: 240,
        height: "fit-content",
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="panel-heading" style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 0.5 }}>
        MAP CONTROLS
      </div>

      <div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
          VECTOR DENSITY
        </div>
        <div style={{ fontSize: 14 }}>{pointCount} nodes</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onZoomIn} className="btn btn-secondary" style={{ flex: 1 }}>+</button>
        <button onClick={onZoomOut} className="btn btn-secondary" style={{ flex: 1 }}>−</button>
        <button onClick={onReset} className="btn btn-secondary" style={{ flex: 1 }}>⤢</button>
      </div>
    </div>
  );
}