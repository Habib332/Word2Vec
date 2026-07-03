"""
evaluate.py

Phase 9: Evaluate Results.

Loads a slice of the text8 corpus, trains Skip-Gram embeddings on it,
then lets the user query predicted context words for an input word.
"""

import numpy as np
from preprocess import load_text8
from train import train
from model import forward, sigmoid


def predict_context(word, word_to_id, id_to_word, W_input, W_output, top_n=5):
    """
    Predict the most likely context words for a given input word.

    Args:
        word (str): the input word (must exist in word_to_id).
        word_to_id (dict): word -> ID mapping.
        id_to_word (dict): ID -> word mapping.
        W_input (np.ndarray): trained input embedding matrix.
        W_output (np.ndarray): trained output matrix.
        top_n (int): how many top predictions to return.

    Returns:
        list[tuple(str, float)]: (word, probability) pairs, sorted by
            probability descending. Empty list if the word is unknown.
    """
    if word not in word_to_id:
        print(f"'{word}' not found in vocabulary — skipping.")
        return []

    word_id = word_to_id[word]
    h, scores = forward(word_id, W_input, W_output)
    probs = sigmoid(scores)

    top_ids = np.argsort(probs)[::-1][:top_n]
    return [(id_to_word[i], probs[i]) for i in top_ids]


if __name__ == "__main__":
    # --- Load a slice of text8 (real Wikipedia text) ---
    corpus_path = "../data/text8"
    max_words = 100_000  # keep small for fast pure-Python training

    print(f"Loading first {max_words} words from text8...")
    tokens = load_text8(corpus_path, max_words=max_words)
    text = " ".join(tokens)  # train() expects raw text, it re-tokenizes internally
    print(f"Loaded {len(tokens)} words.")

    # --- Train ---
    result = train(
        text,
        embedding_dim=50,
        window_size=2,
        k_negatives=5,
        learning_rate=0.025,
        epochs=3,
        seed=42,
    )

    print("\nTraining complete. Loss history:",
          [f"{l:.4f}" for l in result["loss_history"]])

    # --- Interactive query loop ---
    print("\nEnter a word to see predicted context words (or 'quit' to exit).")
    while True:
        word = input("\nEnter word: ").strip().lower()
        if word == "quit":
            break

        predictions = predict_context(
            word,
            result["word_to_id"],
            result["id_to_word"],
            result["W_input"],
            result["W_output"],
            top_n=5,
        )

        if predictions:
            print(f"Predicted context words for '{word}':")
            for context_word, prob in predictions:
                print(f"  {context_word:>15}  (p={prob:.4f})")