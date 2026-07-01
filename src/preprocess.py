"""
preprocess.py

Phase 1: Data Preparation.

Step 1: tokenize()       - raw text -> list of lowercase word tokens
Step 2: build_vocab()    - tokens -> word_to_id / id_to_word mappings
Step 3: generate_pairs() - tokens -> Skip-Gram (center, context) ID pairs
"""

import re


def tokenize(text):
    """
    Convert a raw text string into a list of lowercase word tokens.

    Args:
        text (str): raw input text.

    Returns:
        list[str]: list of tokens (lowercase words only).
    """
    text = text.lower()
    tokens = re.findall(r'\b[a-z]+\b', text)
    return tokens

#So there's no single "winner" — it's a tie among any word whose position is at least 2 away from both edges of the sentence. Only words near the start ("the" at 0, "quick" at 1) or the end ("lazy" at 7, "dog" at 8) fall short of 4, because part of their window runs off the sentence.


def build_vocab(tokens):
    """
    Build word_to_id and id_to_word mappings from a list of tokens.

    Args:
        tokens (list[str]): list of word tokens.

    Returns:
        tuple(dict, dict): (word_to_id, id_to_word)
    """
    unique_words = sorted(set(tokens))  #drops duplicates and sorts them
    word_to_id = {word: idx for idx, word in enumerate(unique_words)} #assign numbers
    id_to_word = {idx: word for word, idx in word_to_id.items()}
    return word_to_id, id_to_word


def generate_pairs(tokens, word_to_id, window_size=2):
    """
    Generate Skip-Gram (center, context) ID pairs from tokens.

    For each center word, pairs it with every context word within
    `window_size` positions to the left and right.

    Args:
        tokens (list[str]): list of word tokens (in original order).
        word_to_id (dict): mapping from word -> integer ID.
        window_size (int): number of words on each side to pair with.

    Returns:
        list[tuple(int, int)]: list of (center_id, context_id) pairs.
    """
    pairs = []
    token_ids = [word_to_id[token] for token in tokens]

    for center_pos, center_id in enumerate(token_ids):
        start = max(0, center_pos - window_size)
        end = min(len(token_ids), center_pos + window_size + 1)

        for context_pos in range(start, end):
            if context_pos == center_pos:
                continue  # skip the center word itself
            context_id = token_ids[context_pos]
            pairs.append((center_id, context_id))

    return pairs


if __name__ == "__main__":
    # Quick manual test of the full pipeline
    sample_text = "The quick brown fox jumps over the lazy dog."

    tokens = tokenize(sample_text)
    print("Tokens:", tokens)

    word_to_id, id_to_word = build_vocab(tokens)
    print("\nVocab size:", len(word_to_id))
    print("word_to_id:", word_to_id)

    pairs = generate_pairs(tokens, word_to_id, window_size=2)
    print(f"\nGenerated {len(pairs)} Skip-Gram pairs (window_size=2)")
    print("First 10 pairs (center_id, context_id):")
    for center_id, context_id in pairs[:10]:
        print(f"  ({id_to_word[center_id]!r}, {id_to_word[context_id]!r})  -> ids ({center_id}, {context_id})")