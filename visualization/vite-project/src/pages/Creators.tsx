import { GithubIcon, LinkedinIcon } from "../components/Icons";

/**
 * "About the Creators" page for the Word2Vec Visualizer.
 * Renders as content inside the app shell, matching ProjectInfo's
 * container treatment so both info pages feel like the same product.
 */

type Creator = {
  initial: string;
  name: string;
  role: string;
  github: string;
  linkedin: string;
};

const creators: Creator[] = [
  { initial: "H", name: "Hamza Zeeshan", role: "CREATOR", github: "https://github.com/hamzaTheZeeshan", linkedin: "https://www.linkedin.com/in/hamza-zeeshan-0a1407332/" },
  { initial: "H", name: "Habib Ahmed", role: "CREATOR", github: "https://github.com/Habib332", linkedin: "https://www.linkedin.com/in/habibahmed5ba3004/" },
];

const techTags = ["Python", "NumPy", "scikit-learn", "React", "TypeScript", "Vite"];

export function AboutCreatorsPage() {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 40px 64px" }}>
        <div className="panel-heading" style={{ fontSize: 11, marginBottom: 8 }}>
          About
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 14px",
            color: "var(--text-primary)",
          }}
        >
          About the Creators
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14.5,
            lineHeight: 1.7,
            maxWidth: 580,
            margin: "0 0 40px",
          }}
        >
          The Word2Vec Visualizer was built by two people who wanted to stop
          treating word embeddings as a black box so they trained one from
          scratch, then built a way to actually see what it had learned.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          {creators.map((c) => (
            <CreatorRow key={c.name} creator={c} />
          ))}
        </div>

        <div
          style={{
            border: "1px solid var(--accent-dim)",
            borderRadius: "var(--radius-md)",
            padding: "28px 32px",
            background: "var(--bg-panel-alt)",
          }}
        >
          <h2 className="panel-heading" style={{ fontSize: 11, margin: "0 0 14px" }}>
            About Word2Vec Visualizer
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)", margin: "0 0 22px" }}>
            Word2Vec Visualizer is a from-scratch implementation of Skip-Gram
            with Negative Sampling, trained on real Wikipedia text (text8)
            using nothing but Python and NumPy, no PyTorch, TensorFlow, or
            Gensim. Every 50-dimensional embedding is reduced to 2D with
            t-SNE and rendered here as an explorable vector map, so you can
            see which words the model learned to place close together.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {techTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.02em",
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 999,
                  padding: "6px 14px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
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
        background: "var(--bg-panel-alt)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "20px 28px",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: "50%",
          background: "var(--accent-dim)",
          border: "1px solid var(--border-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 19,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "var(--accent)",
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
          <span style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display)" }}>
            {creator.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--accent)",
            }}
          >
            {creator.role}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a href={creator.github} className="btn btn-secondary" style={{ textDecoration: "none", padding: "7px 16px" }}>
            <GithubIcon />
            GitHub
          </a>
          <a
            href={creator.linkedin}
            className="btn"
            style={{
              textDecoration: "none",
              padding: "7px 16px",
              color: "var(--accent)",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <LinkedinIcon />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}