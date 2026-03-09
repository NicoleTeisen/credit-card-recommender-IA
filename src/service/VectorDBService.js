// Vector Database usando ChromaDB (real vector database)
// Usando Bridge Server (Python Flask)
export class VectorDBService {
  #baseURL = 'http://localhost:8002';
  #initialized = false;

  async init() {
    console.log('[ChromaDB] Connecting to ChromaDB Bridge...');
    
    try {
      // Health check
      const health = await fetch(`${this.#baseURL}/health`);
      if (!health.ok) {
        throw new Error('Bridge server não está acessível');
      }
      
      // Inicializar collection
      const initResp = await fetch(`${this.#baseURL}/init`, { method: 'POST' });
      if (!initResp.ok) {
        throw new Error('Falha ao inicializar collection');
      }
      
      this.#initialized = true;
      console.log('[ChromaDB] Connected successfully');
    } catch (error) {
      console.error('[ChromaDB] Connection error:', error);
      throw new Error(`ChromaDB error: ${error.message}. Certifique-se que o Bridge está rodando`);
    }
  }

  async saveEmbeddings(embeddings, type) {
    if (!this.#initialized) await this.init();
    
    console.log(`[ChromaDB] Saving ${embeddings.length} ${type} embeddings...`);
    
    const ids = embeddings.map(e => `${type}_${e.id}`);
    const vectors = embeddings.map(e => e.vector);
    const metadatas = embeddings.map(e => ({ type, originalId: String(e.id) }));
    
    try {
      const response = await fetch(`${this.#baseURL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          embeddings: vectors,
          metadatas
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save embeddings: ${error}`);
      }
      
      console.log(`[ChromaDB] ✅ Saved ${embeddings.length} ${type} embeddings`);
    } catch (error) {
      console.error('[ChromaDB] Error saving embeddings:', error);
      throw error;
    }
  }

  async count() {
    if (!this.#initialized) await this.init();
    
    try {
      const response = await fetch(`${this.#baseURL}/count`);
      
      if (!response.ok) {
        return 0;
      }
      
      const count = await response.json();
      return count;
    } catch (error) {
      console.error('[ChromaDB] Count error:', error);
      return 0;
    }
  }
}
