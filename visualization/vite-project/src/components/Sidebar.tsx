import type { ReactNode } from "react";
import { ExploreIcon, ExportIcon, GearIcon, InfoIcon, LogoMark, TeamIcon } from "./Icons";

type Page = "explore" | "project-info" | "creators";

const NAV_ITEMS: { label: string; page: Page; icon: ReactNode }[] = [
  { label: "Explore", page: "explore", icon: <ExploreIcon /> },
  { label: "Project Info", page: "project-info", icon: <InfoIcon /> },
  { label: "Creators", page: "creators", icon: <TeamIcon /> },
];

interface SidebarProps {
  page: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ page, onPageChange }: SidebarProps) {
  return (
    <div
      style={{
        width: 232,
        height: "100%",
        flexShrink: 0,
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-panel)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
        <LogoMark />
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Word2Vec Visualizer
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          marginBottom: 14,
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="panel-heading" style={{ fontSize: 11 }}>
          Vocabulary Engine
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--accent)",
            background: "var(--accent-dim)",
            borderRadius: 999,
            padding: "2px 7px",
            letterSpacing: "0.03em",
          }}
        >
          v2.4
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 4px" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onPageChange(item.page)}
            className={`nav-item ${page === item.page ? "active" : ""}`}
            style={{
              background: page === item.page ? undefined : "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
      </div>
    </div>
  );
}