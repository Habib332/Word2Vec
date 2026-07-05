import React from "react";

/**
 * About page for the Word2Vec Visualizer.
 * Matches the existing app shell: dark theme, sidebar nav, monospace-style
 * uppercase labels, and bordered panel cards. Written with inline styles
 * only (no external CSS / Tailwind) so it can drop into the existing
 * vite-project as a single file.
 */

const colors = {
  bg: "#0a0a0b",
  panelBg: "#111113",
  border: "#232327",
  borderSubtle: "#1c1c1f",
  sidebarActive: "#19191c",
  textPrimary: "#e7e7ea",
  textSecondary: "#a2a2a8",
  textMuted: "#6b6b72",
  accentGreen: "#3ecf6b",
};

const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const monoStack =
  "'JetBrains Mono', 'SF Mono', 'Consolas', monospace";

export function ProjectInfo() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: fontStack,
      }}
    >
     

      {/* ---------------- Main content ---------------- */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "48px 56px 64px",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.015em",
                margin: "0 0 36px",
                color: colors.textPrimary,
              }}
            >
              About This Project
            </h1>

            <Section title="What This Is">
              <p style={pStyle}>
                This is an implementation of Word2Vec (Skip-Gram with Negative
                Sampling) built entirely from scratch using Python and
                NumPy with no machine learning libraries like PyTorch,
                TensorFlow, or Gensim. Based on Mikolov et al.'s 2013 paper,{" "}
                <em style={{ color: colors.textSecondary, fontStyle: "italic" }}>
                  "Efficient Estimation of Word Representations in Vector
                  Space."
                </em>
              </p>
            </Section>

            <Section title="Why Build It From Scratch">
              <p style={pStyle}>
                Instead of using a built-in library, this project implements
                every step of the algorithm manually. Tokenization, vocabulary building,
                 initializing embedding matrices, backpropagation and updating weights. The main
                 reason to build it from scratch is to understand how word embeddings work instead of calling 
                 a library function.
              </p>
            </Section>

            <Section title="What You're Looking At">
              <p style={pStyle}>
                Each point in this visualization represents a single word
                from the training corpus. Its position was produced in three
                steps:
              </p>
              <ol style={{ ...pStyle, paddingLeft: 20, margin: "12px 0 12px" }}>
                <li style={{ marginBottom: 10 }}>
                  <strong style={{ color: colors.textPrimary }}>
                    Training
                  </strong>{" "}
                  : a 50-dimensional vector ("embedding") was learned for
                  every word, based on which words tended to appear near each
                  other in the training text.
                </li>
                <li style={{ marginBottom: 10 }}>
                  <strong style={{ color: colors.textPrimary }}>
                    Reduction
                  </strong>{" "}
                  : those 50-dimensional vectors were compressed down to 2D
                  using t-SNE, a technique designed to keep similar vectors
                  visually close together.
                </li>
                <li>
                  <strong style={{ color: colors.textPrimary }}>
                    Plotting
                  </strong>{" "}
                  : each word is plotted at its resulting (x, y) position.
                </li>
              </ol>
              <p style={pStyle}>
                Words positioned close together were considered similar by
                the model meaning they often occur in same context or are related
                to each other.
              </p>
            </Section>

            <Section title="Training Data">
              <p style={pStyle}>
                The model was trained on a slice of text8, a cleaned and
                lowercased extract of English Wikipedia (all punctuation
                removed, commonly used as a benchmark corpus for word
                embedding research). The full text8 corpus contains roughly
                17 million words; this project trained on a smaller slice of
                it for practicality, since the implementation is pure Python
                without GPU acceleration or batching.
              </p>
            </Section>

            <Section title="Tech Stack">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <TechRow
                  name="Python + NumPy"
                  desc="the core Word2Vec implementation (tokenization, model, training, evaluation)"
                />
                <TechRow
                  name="scikit-learn"
                  desc="used only for t-SNE dimensionality reduction, not for the model itself"
                />
                <TechRow
                  name="React + TypeScript + Vite"
                  desc="this interactive visualization"
                />
              </div>
            </Section>

            <Section title="Limitations">
              <p style={pStyle}>
                Because this was trained on a limited slice of the full
                corpus for the sake of reasonable training time, the semantic
                relationships shown here may be rougher than what you'd see
                from a production word2vec model trained on the full dataset
                with more epochs. This project prioritizes understanding the
                algorithm's mechanics over producing state-of-the-art
                embeddings.
              </p>
            </Section>

            <Section title="Source Code" last>
              <p style={pStyle}>
                The full implementation, including the training pipeline and
                this visualization, is available on GitHub:{" "}
                <a
                  href="https://github.com/Habib332/Word2Vec"
                  style={{
                    color: colors.accentGreen,
                    textDecoration: "none",
                  }}
                >
                  link to repository
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Shared sub-components ---------------- */

const pStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: colors.textSecondary,
  margin: 0,
};

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        marginBottom: last ? 0 : 30,
        paddingBottom: last ? 0 : 30,
        borderBottom: last ? "none" : `1px solid ${colors.borderSubtle}`,
      }}
    >
      <h2
        style={{
          fontFamily: monoStack,
          fontSize: 11,
          letterSpacing: "0.07em",
          color: colors.textMuted,
          textTransform: "uppercase",
          margin: "0 0 12px",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function TechRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        fontSize: 14,
        lineHeight: 1.6,
        border: `1px solid ${colors.borderSubtle}`,
        background: colors.panelBg,
        borderRadius: 6,
        padding: "10px 14px",
      }}
    >
      <span
        style={{
          color: colors.textPrimary,
          fontWeight: 600,
          flexShrink: 0,
          minWidth: 190,
        }}
      >
        {name}
      </span>
      <span style={{ color: colors.textMuted }}>{desc}</span>
    </div>
  );
}