import numpy as np 
from reduceDimensions import reduce_with_tsne, export_for_visualization
from train import load_embeddings

def cosine_similarity_all(query_vec, W_input):
    """
    Compute cosine similarity between query_vec and every row of W_input.
 
    Args:
        query_vec (np.ndarray): shape (embedding_dim,)
        W_input (np.ndarray): shape (vocab_size, embedding_dim)
 
    Returns:
        np.ndarray: similarity scores, shape (vocab_size,)
    """
    # Normalize the query vector
    query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)
 
    # Normalize every row of W_input at once
    W_norms = np.linalg.norm(W_input, axis=1, keepdims=True) + 1e-10
    W_normalized = W_input / W_norms
 
    # Dot product of normalized vectors = cosine similarity
    similarities = W_normalized @ query_norm
    return similarities
 
 
def most_similar(word, word_to_id, id_to_word, W_input, top_n=5):
    """
    Find the words most similar (cosine similarity) to a given word.
 
    Args:
        word (str): query word (must exist in word_to_id).
        word_to_id (dict): word -> ID mapping.
        id_to_word (dict): ID -> word mapping.
        W_input (np.ndarray): trained input embedding matrix.
        top_n (int): how many results to return.
 
    Returns:
        list[tuple(str, float)]: (word, similarity) pairs, sorted descending.
            Empty list if the word is unknown.
    """
    if word not in word_to_id:
        print(f"'{word}' not found in vocabulary — skipping.")
        return []
 
    word_id = word_to_id[word]
    query_vec = W_input[word_id]
 
    similarities = cosine_similarity_all(query_vec, W_input)
 
    # Exclude the query word itself from results
    similarities[word_id] = -np.inf
 
    top_ids = np.argsort(similarities)[::-1][:top_n]
    return [(id_to_word[i], similarities[i]) for i in top_ids]
 
 
def analogy(word_a, word_b, word_c, word_to_id, id_to_word, W_input, top_n=5):
    """
    Solve word analogies: word_a is to word_b as word_c is to ?
 
    E.g. analogy("king", "man", "woman", ...) computes
    king - man + woman, then finds the closest word to that result.
 
    Args:
        word_a, word_b, word_c (str): the three known words in the analogy.
        word_to_id (dict): word -> ID mapping.
        id_to_word (dict): ID -> word mapping.
        W_input (np.ndarray): trained input embedding matrix.
        top_n (int): how many candidate answers to return.
 
    Returns:
        list[tuple(str, float)]: (word, similarity) pairs, sorted descending.
            Empty list if any input word is unknown.
    """
    for w in (word_a, word_b, word_c):
        if w not in word_to_id:
            print(f"'{w}' not found in vocabulary — skipping.")
            return []
 
    v_a = W_input[word_to_id[word_a]]
    v_b = W_input[word_to_id[word_b]]
    v_c = W_input[word_to_id[word_c]]
 
    target_vec = v_a - v_b + v_c
 
    similarities = cosine_similarity_all(target_vec, W_input)
 
    # Exclude the three input words from the results
    for w in (word_a, word_b, word_c):
        similarities[word_to_id[w]] = -np.inf
 
    top_ids = np.argsort(similarities)[::-1][:top_n]
    return [(id_to_word[i], similarities[i]) for i in top_ids]    



if __name__ == "__main__":

    loaded = load_embeddings()
 
    W_input = loaded["W_input"]
    id_to_word = loaded["id_to_word"]
 
    print(f"\nReducing {W_input.shape[0]} words from "
          f"{W_input.shape[1]}D to 2D using t-SNE...")
 
    coords_2d = reduce_with_tsne(W_input)
 
    # --- Export for the React visualization ---
    output_path = "../data/embeddings_output/embeddings_2d.json"
    export_for_visualization(coords_2d, id_to_word, output_path)
    result = load_embeddings()
    print("\nCommands:")
    print("  similar <word>              - most similar words (cosine similarity)")
    print("  analogy <a> <b> <c>         - a is to b as c is to ?")
    print("  quit                        - exit")
 
    while True:
        raw = input("\n> ").strip().lower()
        if raw == "quit":
            break
 
        parts = raw.split()
        if not parts:
            continue
 
        command = parts[0]
 
        
        if command == "similar" and len(parts) == 2:
            word = parts[1]
            neighbors = most_similar(
                word, result["word_to_id"], result["id_to_word"],
                result["W_input"], top_n=5,
            )
            if neighbors:
                print(f"Most similar words to '{word}':")
                for neighbor_word, sim in neighbors:
                    print(f"  {neighbor_word:>15}  (cos_sim={sim:.4f})")
 
        elif command == "analogy" and len(parts) == 4:
            _, word_a, word_b, word_c = parts
            answers = analogy(
                word_a, word_b, word_c,
                result["word_to_id"], result["id_to_word"],
                result["W_input"], top_n=5,
            )
            if answers:
                print(f"'{word_a}' is to '{word_b}' as '{word_c}' is to:")
                for answer_word, sim in answers:
                    print(f"  {answer_word:>15}  (cos_sim={sim:.4f})")
 
        else:
            print("Unrecognized command. Use: context/similar/analogy/quit")
