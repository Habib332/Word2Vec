# Word2Vec From Scratch

A from-scratch implementation of **Word2Vec (Skip-Gram with Negative Sampling)**, based on Mikolov et al., 2013 ("Efficient Estimation of Word Representations in Vector Space"). Built using only Python and NumPy — no ML libraries (no PyTorch, TensorFlow, Keras, or Gensim) — to understand the algorithm at the level of tokenization, forward/backward passes, and gradient descent, rather than treating it as a black box.

## What's in here

- **Tokenization & vocabulary building** — raw text → word IDs
- **Skip-Gram pair generation** — sliding window over text to produce (center, context) training pairs
- **Embedding matrices** (`W_input`, `W_output`) — built and initialized from scratch
- **Forward pass** — center word → embedding → scores
- **Negative sampling loss** — the efficient alternative to full softmax used in the original paper
- **Backpropagation** — manually derived gradients, no autograd
- **Training loop** — with real Wikipedia text (`text8` corpus)
- **Evaluation** — nearest-neighbor similarity and word analogies (`king - man + woman ≈ queen`) via cosine similarity
- **Visualization** — 2D projection of embeddings (t-SNE) rendered in an interactive React/TypeScript scatter plot

## Setup

**1. Clone and enter the project, then set up the Python environment:**

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**2. Download the corpus** (real Wikipedia text, ~100MB zipped):

```powershell
cd data
Invoke-WebRequest -Uri "http://mattmahoney.net/dc/text8.zip" -OutFile "text8.zip"
Expand-Archive -Path "text8.zip" -DestinationPath "."
cd ..
```

## Running it

All commands below are run from the `src/` folder:

```powershell
cd src
```

**Train the model** (loads a slice of text8, trains, saves embeddings to `data/embeddings_output/`):
```powershell
python eval.py
```

**Reduce embeddings to 2D for visualization** (run after training, once embeddings exist in `data/embeddings_output/`):
```powershell
python postTrain.py
```
This writes `embeddings_2d.json` directly into `visualization/public/`, ready for the frontend to load.

**Run the visualization** (from the `visualization/` folder):
```powershell
cd ../visualization/vite-project
npm install
npm run dev
```

## Notes on scale

This is a pure-Python/NumPy implementation with no batching — it's built for clarity over speed. Training on the full 100M-word text8 file would take a very long time; the default setup uses a smaller slice (configurable in `evaluate.py`) to keep iteration fast while still training on real text. Increase `max_words` and `epochs` for better-quality embeddings once you're ready for a longer run.
This trains on the first 100,000 words by default and drops you into an interactive prompt once done. Available commands:

