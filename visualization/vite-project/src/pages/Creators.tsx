

/**
 * "About the Creators" page for the Word2Vec Visualizer.
 * Same dark theme as About.tsx (near-black bg, mono uppercase labels,
 * bordered panels, green accent), with a refreshed layout: creator cards
 * are now stacked as horizontal rows instead of side-by-side tiles, and
 * all copy is rewritten to describe this project. Inline styles only.
 */

const colors = {
  bg: "#0a0a0b",
  panelBg: "#111113",
  border: "#232327",
  borderSubtle: "#1c1c1f",
  textPrimary: "#e7e7ea",
  textSecondary: "#a2a2a8",
  textMuted: "#6b6b72",
  accentGreen: "#3ecf6b",
  accentGreenDim: "#1f4d31",
  chipBg: "#14201a",
};

const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const monoStack = "'JetBrains Mono', 'SF Mono', 'Consolas', monospace";

type Creator = {
  initial: string;
  name: string;
  role: string;
  github: string;
  linkedin: string;
};

const creators: Creator[] = [
  {
    initial: "H",
    name: "Hamza Zeeshan",
    role: "CREATOR",
    github: "#",
    linkedin: "#",
  },
  {
    initial: "H",
    name: "Habib Ahmed",
    role: "CREATOR",
    github: "#",
    linkedin: "#",
  },
];

const techTags = [
  "Python",
  "NumPy",
  "scikit-learn",
  "React",
  "TypeScript",
  "Vite",
];

export function AboutCreatorsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fontStack,
        padding: "56px 24px 72px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Eyebrow + heading */}
        <div
          style={{
            fontFamily: monoStack,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: colors.textMuted,
            marginBottom: 8,
          }}
        >
          ABOUT
        </div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            margin: "0 0 14px",
          }}
        >
          About the Creators
        </h1>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: 14.5,
            lineHeight: 1.7,
            maxWidth: 620,
            margin: "0 0 40px",
          }}
        >
          The Word2Vec Visualizer was built by two people who wanted to stop
          treating word embeddings as a black box — so they trained one from
          scratch, then built a way to actually see what it had learned.
        </p>

        {/* Creator rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {creators.map((c) => (
            <CreatorRow key={c.name} creator={c} />
          ))}
        </div>

        {/* About the project panel */}
        <div
          style={{
            border: `1px solid ${colors.accentGreenDim}`,
            borderRadius: 10,
            padding: "28px 32px",
            background: colors.panelBg,
            boxShadow: `0 0 24px rgba(62,207,107,0.06)`,
          }}
        >
          <h2
            style={{
              fontFamily: monoStack,
              fontSize: 11,
              letterSpacing: "0.07em",
              color: colors.textMuted,
              textTransform: "uppercase",
              margin: "0 0 14px",
              fontWeight: 600,
            }}
          >
            About Word2Vec Visualizer
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: colors.textSecondary,
              margin: "0 0 22px",
            }}
          >
            Word2Vec Visualizer is a from-scratch implementation of
            Skip-Gram with Negative Sampling, trained on real Wikipedia text
            (text8) using nothing but Python and NumPy — no PyTorch,
            TensorFlow, or Gensim. Every 50-dimensional embedding is reduced
            to 2D with t-SNE and rendered here as an explorable vector map,
            so you can see which words the model learned to place close
            together.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {techTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: monoStack,
                  letterSpacing: "0.02em",
                  color: colors.accentGreen,
                  background: colors.chipBg,
                  border: `1px solid ${colors.accentGreenDim}`,
                  borderRadius: 999,
                  padding: "6px 14px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Status bar, consistent with the rest of the app shell */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 14,
            borderTop: `1px solid ${colors.borderSubtle}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: monoStack,
            fontSize: 11,
            color: colors.textMuted,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colors.accentGreen,
              display: "inline-block",
            }}
          />
          ENGINE ONLINE
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function CreatorRow({ creator }: { creator: Creator }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        background: colors.panelBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "20px 28px",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: "50%",
          background: colors.chipBg,
          border: `1px solid ${colors.accentGreenDim}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 19,
          fontWeight: 700,
          color: colors.accentGreen,
        }}
      >
        {creator.initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {creator.name}
          </span>
          <span
            style={{
              fontFamily: monoStack,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: colors.accentGreen,
            }}
          >
            {creator.role}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a
            href={creator.github}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: monoStack,
              color: colors.textSecondary,
              background: "transparent",
              border: `1px solid ${colors.border}`,
              borderRadius: 999,
              padding: "7px 16px",
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
          <a
            href={creator.linkedin}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: monoStack,
              color: colors.accentGreen,
              background: colors.chipBg,
              border: `1px solid ${colors.accentGreenDim}`,
              borderRadius: 999,
              padding: "7px 16px",
              textDecoration: "none",
            }}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}