"""
reduce_dimensions.py

Phase 10 (Python side): Dimensionality Reduction for Visualization.

Loads trained embeddings (from Phase 8's saved files), reduces them
from embedding_dim down to 2D using PCA or t-SNE, and exports
{word, x, y} coordinates as JSON for the React/TypeScript visualization.
"""

import json
import os

from train import load_embeddings


def reduce_with_tsne(W_input, n_components=2, perplexity=30, seed=42):
    """
    Reduce embeddings to 2D using t-SNE.

    t-SNE is slower than PCA but generally preserves local neighborhood
    structure (which words are close to which) better, which is usually
    what you actually want to SEE in a word embedding visualization.

    Args:
        W_input (np.ndarray): shape (vocab_size, embedding_dim)
        n_components (int): target dimensions (2 for a scatter plot)
        perplexity (int): roughly "how many neighbors" t-SNE considers
            per point. Must be less than vocab_size. Typical range: 5-50.
        seed (int): random seed for reproducibility

    Returns:
        np.ndarray: shape (vocab_size, n_components)
    """
    from sklearn.manifold import TSNE

    # perplexity must be less than number of samples
    vocab_size = W_input.shape[0]
    safe_perplexity = min(perplexity, max(5, vocab_size - 1))

    tsne = TSNE(n_components=n_components, perplexity=safe_perplexity,
                random_state=seed, init="pca")
    coords_2d = tsne.fit_transform(W_input)
    return coords_2d


def export_for_visualization(coords_2d, id_to_word, output_path):
    """
    Export 2D coordinates + word labels as JSON for the React app.

    Args:
        coords_2d (np.ndarray): shape (vocab_size, 2)
        id_to_word (dict): ID -> word mapping
        output_path (str): path to write the JSON file

    Returns:
        None
    """
    points = []
    for word_id in range(len(id_to_word)):
        word = id_to_word[word_id]
        x, y = coords_2d[word_id]
        points.append({
            "word": word,
            "x": float(x),
            "y": float(y),
        })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(points, f, ensure_ascii=False, indent=2)

    os.makedirs(os.path.dirname("../visualization/vite-project/public"), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(points, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(points)} points to: {output_path}")


