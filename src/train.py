"""
train.py

Phase 7: Training Loop.

Wires together preprocess.py and model.py to actually train
Skip-Gram word embeddings with negative sampling.
"""

import numpy as  np
from model import (
    init_embeddings,
    forward,
    build_negative_sampling_table,
    sample_negatives,
    negative_sampling_loss,
    backward,
    update_weights,
)
from preprocess import tokenize, build_vocab, generate_pairs

def count_words(tokens):
    """
    Count occurrences of each word in a token list.

    Args:
        tokens (list[str]): list of word tokens.

    Returns:
        dict: word (str) -> count (int)
    """
    word_counts = {}
    for token in tokens:
        word_counts[token] = word_counts.get(token, 0) + 1
    return word_counts

def train(text, embedding_dim=50, window_size=2, k_negatives=5,
          learning_rate=0.025, epochs=5, seed=42):
    """
    Train Skip-Gram word embeddings with negative sampling.

    Args:
        text (str): raw training corpus.
        embedding_dim (int): size of word vectors.
        window_size (int): Skip-Gram context window.
        k_negatives (int): number of negative samples per positive pair.
        learning_rate (float): gradient descent step size.
        epochs (int): number of passes over the full pair list.
        seed (int): random seed for reproducibility.

    Returns:
        dict with:
            'W_input'    : trained input embedding matrix (the final word vectors)
            'word_to_id' : word -> ID mapping
            'id_to_word' : ID -> word mapping
            'loss_history': list of average loss per epoch
    """
    rng = np.random.default_rng(seed)

    # --- Phase 1: Data prep ---
    tokens = tokenize(text)
    word_to_id, id_to_word = build_vocab(tokens)
    pairs = generate_pairs(tokens, word_to_id, window_size=window_size)
    word_counts = count_words(tokens)
    vocab_size = len(word_to_id)

    print(f"Vocab size: {vocab_size}")
    print(f"Training pairs: {len(pairs)}")

    # --- Phase 3: Init weights ---
    W_input, W_output = init_embeddings(vocab_size, embedding_dim, seed=seed)

    # --- Phase 5: Negative sampling distribution (built once, reused every step) ---
    sampling_probs = build_negative_sampling_table(word_counts, id_to_word)

    loss_history = []

    # --- Phase 7: The training loop itself ---
    for epoch in range(epochs):
        # Shuffle pair order each epoch
        shuffled_pairs = pairs.copy()
        rng.shuffle(shuffled_pairs)

        total_loss = 0.0

        for center_id, context_id in shuffled_pairs:
            # 1. Sample negatives
            negative_ids = sample_negatives(sampling_probs, context_id,
                                             k_negatives, rng=rng)

            # 2. Forward pass
            h, _ = forward(center_id, W_input, W_output)
            loss = negative_sampling_loss(h, context_id, negative_ids, W_output)
            total_loss += loss

            # 3. Backward pass
            grads = backward(h, center_id, context_id, negative_ids, W_output)

            # 4. Update weights
            update_weights(W_input, W_output, center_id, context_id,
                          negative_ids, grads, learning_rate=learning_rate)

        avg_loss = total_loss / len(shuffled_pairs)
        loss_history.append(avg_loss)

    return {
        "W_input": W_input,
        "W_output": W_output,
        "word_to_id": word_to_id,
        "id_to_word": id_to_word,
        "loss_history": loss_history,
    }

def save_embeddings(result, output_dir="."):
    """
    Save trained embeddings to disk (Phase 8).
 
    Saves two files:
        - embeddings.npy  : the W_input matrix (the actual word vectors)
        - vocab.json      : word_to_id and id_to_word mappings
 
    Args:
        result (dict): output of train() — must contain 'W_input',
            'word_to_id', and 'id_to_word'.
        output_dir (str): directory to save files into (default: current dir).
 
    Returns:
        None
    """
    import os
    import json
 
    os.makedirs(output_dir, exist_ok=True)
 
    embeddings_path = os.path.join(output_dir, "embeddings.npy")
    vocab_path = os.path.join(output_dir, "vocab.json")
 
    # Save the actual vectors
    np.save(embeddings_path, result["W_input"])
 
    # Save the word <-> id mappings
    # (id_to_word keys are ints, JSON keys must be strings — convert on save)
    vocab_data = {
        "word_to_id": result["word_to_id"],
        "id_to_word": {str(k): v for k, v in result["id_to_word"].items()},
    }
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)
 
    print(f"Saved embeddings to: {embeddings_path}")
    print(f"Saved vocab to: {vocab_path}")    




    