import re

def tokenize(text):
    text = text.lower()
    tokens = re.findall(r'\b[a-z]+\b', text)
    return tokens
    

def build_vocab(tokens):
    # Remove duplicates and sort the words
    unique_words = sorted(set(tokens))

    # Create dictionaries
    word_to_id = {}
    id_to_word = {}

    # Assign an ID to each word
    for index in range(len(unique_words)):
        word = unique_words[index]
        word_to_id[word] = index
        id_to_word[index] = word

    return word_to_id, id_to_word

def generate_pairs(tokens, word_to_id, window_size=2):
    pairs = []

    # Convert words to their IDs
    token_ids = []
    for token in tokens:
        token_ids.append(word_to_id[token])

    # Go through each word
    for i in range(len(token_ids)):
        center_id = token_ids[i]

        # Check words around the current word
        start = max(0, i - window_size)
        end = min(len(token_ids), i + window_size + 1)

        for j in range(start, end):
            # Skip the center word itself
            if i == j:
                continue

            context_id = token_ids[j]
            pairs.append((center_id, context_id))

    return pairs

def load_text8(path, max_words=100_000):
    """
    Load a slice of the text8 corpus.
 
    text8 is already lowercased with punctuation stripped, and is one
    giant whitespace-separated stream of words (no sentence boundaries).
 
    Args:
        path (str): path to the text8 file (already unzipped).
        max_words (int): how many words to load. Use a small slice for
            fast experimentation — pure-Python training loops are slow
            on the full 100M-word file.
 
    Returns:
        list[str]: list of word tokens (already clean, minimal processing needed).
    """
    with open(path, "r", encoding="utf-8") as f:
        text = f.read(max_words * 7)  # rough byte estimate; avg word ~6 chars + space
 
    words = text.split()
    return words[:max_words]