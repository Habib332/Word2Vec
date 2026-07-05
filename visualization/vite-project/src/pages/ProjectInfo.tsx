import React from "react";

/**
 * "About This Project" page for the Word2Vec Visualizer.
 * Renders as content inside the app shell (Sidebar/TopBar/StatusBar
 * already come from App), so this file only owns the scrollable
 * content column — no page-level background or width here.
 */

export function ProjectInfo() {
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
            margin: "0 0 36px",
            color: "var(--text-primary)",
          }}
        >
          About This Project
        </h1>

        <Section title="What This Is">
          <p style={pStyle}>
            An implementation of Word2Vec (Skip-Gram with Negative Sampling)
            built entirely from scratch using Python and NumPy no machine
            learning libraries like PyTorch, TensorFlow, or Gensim. Based on
            Mikolov et al.'s 2013 paper,{" "}
            <em style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              "Efficient Estimation of Word Representations in Vector Space."
            </em>
          </p>
        </Section>

        <Section title="Why Build It From Scratch">
          <p style={pStyle}>
            Instead of using an existing library as a black box, this
            project implements every piece of the algorithm manually:
            tokenization, vocabulary building, the embedding matrices, the
            forward pass, the negative sampling loss function,
            backpropagation, and the training loop itself. The goal was to
            genuinely understand how word embeddings are learned, not just
            how to call a library function that produces them.
          </p>
        </Section>

        <Section title="What You're Looking At">
          <p style={pStyle}>
            Each point in this visualization represents a single word from
            the training corpus. Its position was produced in three steps:
          </p>
          <ol style={{ ...pStyle, paddingLeft: 20, margin: "12px 0 12px" }}>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: "var(--text-primary)" }}>Training</strong>{" "}
               : a 50-dimensional vector ("embedding") was learned for every
              word, based on which words tended to appear near each other in
              the training text.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: "var(--text-primary)" }}>
                Dimensionality reduction
              </strong>{" "}
              : those 50-dimensional vectors were compressed down to 2D using
              t-SNE, a technique designed to keep similar vectors visually
              close together.
            </li>
            <li>
              <strong style={{ color: "var(--text-primary)" }}>Rendering</strong> —
              : each word is plotted at its resulting (x, y) position.
            </li>
          </ol>
          <p style={pStyle}>
           Words positioned close together were considered similar by the
            model — meaning they tended to occur in similar contexts
            throughout the training text.
          </p>
        </Section>

        <Section title="Training Data">
          <p style={pStyle}>
            The model was trained on a slice of text8, a cleaned and
            lowercased extract of English Wikipedia (all punctuation
            removed, commonly used as a benchmark corpus for word embedding
            research). The full text8 corpus contains roughly 17 million
            words; this project trained on a smaller slice of it for
            practicality, since the implementation is pure Python without
            GPU acceleration or batching.
          </p>
        </Section>

        <Section title="Tech Stack">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
            Because this was trained on a limited slice of the full corpus
            for the sake of reasonable training time, the semantic
            relationships shown here may be rougher than what you'd see from
            a production word2vec model trained on the full dataset with
            more epochs. This project prioritizes understanding the
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
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              link to repository
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ---------------- Shared sub-components ---------------- */

const pStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "var(--text-secondary)",
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
        borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <h2
        className="panel-heading"
        style={{
          fontSize: 11,
          margin: "0 0 12px",
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
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-panel-alt)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
      }}
    >
      <span
        style={{
          color: "var(--text-primary)",
          fontWeight: 600,
          flexShrink: 0,
          minWidth: 190,
        }}
      >
        {name}
      </span>
      <span style={{ color: "var(--text-muted)" }}>{desc}</span>
    </div>
  );
}