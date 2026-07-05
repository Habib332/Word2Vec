import { MinusIcon, PlusIcon, ResetIcon } from "./Icons";

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
        width: 220,
        flexShrink: 0,
        height: "fit-content",
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <div className="panel-heading" style={{ fontSize: 11 }}>Map controls</div>

      <div
        style={{
          background: "var(--bg-panel-alt)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 12px",
        }}
      >
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
          VECTOR DENSITY
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          {pointCount.toLocaleString()}
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 500, marginLeft: 6 }}>
            nodes
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onZoomIn} className="btn btn-secondary btn-icon" style={{ flex: 1 }} aria-label="Zoom in">
          <PlusIcon />
        </button>
        <button onClick={onZoomOut} className="btn btn-secondary btn-icon" style={{ flex: 1 }} aria-label="Zoom out">
          <MinusIcon />
        </button>
        <button onClick={onReset} className="btn btn-secondary btn-icon" style={{ flex: 1 }} aria-label="Reset view">
          <ResetIcon />
        </button>
      </div>
    </div>
  );
}