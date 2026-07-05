import { useState } from "react";
import { SearchIcon } from "./Icons";

export function TopBar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
}: {
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 20px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-panel)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: 1,
          maxWidth: 420,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 12,
            display: "flex",
            color: focused ? "var(--accent)" : "var(--text-muted)",
            transition: "color 0.15s ease",
          }}
        >
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search vectors (e.g. 'consciousness')..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "9px 12px 9px 34px",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${focused ? "var(--accent)" : "var(--border-subtle)"}`,
            background: "var(--bg-panel-alt)",
            color: "var(--text-primary)",
            fontSize: 13.5,
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            boxShadow: focused ? "0 0 0 3px var(--accent-dim)" : "none",
          }}
        />
      </div>
    </div>
  );
}