export function TopBar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
}: {
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: () => void;
}) {
  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <input
        type="text"
        placeholder="Search vectors (e.g. 'consciousness')..."
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
        style={{
          flex: 1,
          maxWidth: 400,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-panel-alt)",
          color: "var(--text-primary)",
          fontSize: 13,
        }}
      />
    </div>
  );
}