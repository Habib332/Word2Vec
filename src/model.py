"""
model.py

Phase 3: Build the Embedding Matrix.

Step 1 (done): init_embeddings()             - create and initialize W_input and W_output
Step 2 (done): forward()                     - center word -> embedding -> raw scores over vocab
Step 3 (done): build_negative_sampling_table() - freq^0.75 sampling distribution
Step 4 (done): sigmoid() + negative_sampling_loss() - Phase 5 loss function

Coming next (Phase 6+):
- backprop / weight updates
- training loop
"""

import numpy as np


def init_embeddings(vocab_size, embedding_dim, seed=None):
    """
    Initialize the two weight matrices for Skip-Gram.

    Args:
        vocab_size (int): number of unique words in vocabulary.
        embedding_dim (int): size of each word vector.
        seed (int, optional): random seed for reproducibility.

    Returns:
        tuple(np.ndarray, np.ndarray): (W_input, W_output)
            W_input:  shape (vocab_size, embedding_dim)
            W_output: shape (embedding_dim, vocab_size)
    """
    if seed is not None:
        np.random.seed(seed)

    limit = 0.5 / embedding_dim
    W_input = np.random.uniform(-limit, limit, size=(vocab_size, embedding_dim))
    W_output = np.zeros((embedding_dim, vocab_size))

    return W_input, W_output


def forward(center_id, W_input, W_output):
    """
    Skip-Gram forward pass: center word -> embedding -> raw scores.

    Args:
        center_id (int): ID of the center word.
        W_input (np.ndarray): shape (vocab_size, embedding_dim)
        W_output (np.ndarray): shape (embedding_dim, vocab_size)

    Returns:
        tuple(np.ndarray, np.ndarray):
            h: the embedding for center_id, shape (embedding_dim,)
            scores: raw scores over vocab, shape (vocab_size,)
    """
    h = W_input[center_id]        # lookup: shape (embedding_dim,)
    scores = h @ W_output          # shape (vocab_size,)
    return h, scores


def build_negative_sampling_table(word_counts, id_to_word, power=0.75):
    """
    Build a probability distribution over vocabulary IDs for negative
    sampling, following the paper's freq^0.75 weighting.

    Args:
        word_counts (dict): word (str) -> raw count (int).
        id_to_word (dict): ID (int) -> word (str).
        power (float): exponent applied to frequency (paper uses 0.75).

    Returns:
        np.ndarray: probability for each vocab ID, shape (vocab_size,).
                    Sums to 1.0. Index i = P(sampling word with id=i).
    """
    vocab_size = len(id_to_word)
    weighted_counts = np.zeros(vocab_size)

    for word_id in range(vocab_size):
        word = id_to_word[word_id]
        weighted_counts[word_id] = word_counts[word] ** power

    probs = weighted_counts / weighted_counts.sum()
    return probs


def sample_negatives(sampling_probs, positive_id, k, rng=None):
    """
    Sample k negative word IDs, avoiding the true positive_id.

    Args:
        sampling_probs (np.ndarray): distribution from build_negative_sampling_table.
        positive_id (int): the true context word ID (excluded from sampling).
        k (int): number of negatives to sample.
        rng (np.random.Generator, optional): random generator for reproducibility.

    Returns:
        np.ndarray: array of k negative word IDs.
    """
    if rng is None:
        rng = np.random.default_rng()

    vocab_size = len(sampling_probs)
    negatives = []

    while len(negatives) < k:
        candidate = rng.choice(vocab_size, p=sampling_probs)
        if candidate != positive_id:
            negatives.append(candidate)

    return np.array(negatives)


def sigmoid(x):
    """Numerically stable sigmoid."""
    return np.where(
        x >= 0,
        1 / (1 + np.exp(-x)),
        np.exp(x) / (1 + np.exp(x))
    )


def negative_sampling_loss(h, positive_id, negative_ids, W_output):
    """
    Compute Skip-Gram loss with negative sampling for one training pair.

    Args:
        h (np.ndarray): center word embedding, shape (embedding_dim,)
        positive_id (int): true context word ID.
        negative_ids (np.ndarray): sampled negative word IDs, shape (k,)
        W_output (np.ndarray): shape (embedding_dim, vocab_size)

    Returns:
        float: total loss for this (center, context) pair + its negatives.
    """
    # Positive example: want sigmoid(h . v_pos) close to 1
    v_pos = W_output[:, positive_id]              # shape (embedding_dim,)
    score_pos = h @ v_pos
    loss_pos = -np.log(sigmoid(score_pos) + 1e-10)  # +epsilon avoids log(0)

    # Negative examples: want sigmoid(-h . v_neg) close to 1
    v_neg = W_output[:, negative_ids]              # shape (embedding_dim, k)
    scores_neg = h @ v_neg                         # shape (k,)
    loss_neg = -np.log(sigmoid(-scores_neg) + 1e-10)  # shape (k,)

    total_loss = loss_pos + loss_neg.sum()
    return total_loss


if __name__ == "__main__":
    vocab_size = 8
    embedding_dim = 5

    W_input, W_output = init_embeddings(vocab_size, embedding_dim, seed=42)

    print("W_input shape:", W_input.shape)
    print("W_input:\n", W_input)
    print("\nW_output shape:", W_output.shape)
    print("W_output:\n", W_output)

    # Test forward pass using center word id=2 ("fox" in our earlier example)
    center_id = 2
    h, scores = forward(center_id, W_input, W_output)

    print(f"\n--- Forward pass for center_id={center_id} ---")
    print("Embedding (h) shape:", h.shape)
    print("Embedding (h):", h)
    print("\nRaw scores shape:", scores.shape)
    print("Raw scores:", scores)

    # --- Phase 5: Negative Sampling demo ---
    # Reuse the vocab/word_counts from our running "the quick brown fox..." example
    word_counts = {
        "the": 2, "quick": 1, "brown": 1, "fox": 1,
        "jumps": 1, "over": 1, "lazy": 1, "dog": 1
    }
    id_to_word = {0: "brown", 1: "dog", 2: "fox", 3: "jumps",
                  4: "lazy", 5: "over", 6: "quick", 7: "the"}

    sampling_probs = build_negative_sampling_table(word_counts, id_to_word, power=0.75)
    print("\n--- Negative sampling distribution (freq^0.75) ---")
    for word_id, prob in enumerate(sampling_probs):
        print(f"  {id_to_word[word_id]:>6}: {prob:.4f}")

    # Example training pair: center="fox" (id=2), true context="brown" (id=0)
    rng = np.random.default_rng(seed=42)
    positive_id = 0  # "brown"
    negative_ids = sample_negatives(sampling_probs, positive_id, k=3, rng=rng)
    print(f"\nSampled {len(negative_ids)} negatives for positive='brown':",
          [id_to_word[i] for i in negative_ids])

    loss = negative_sampling_loss(h, positive_id, negative_ids, W_output)
    print(f"\nLoss (center='fox', positive='brown'): {loss:.4f}")
    print("(High loss expected — W_output is still all zeros, i.e. untrained)")