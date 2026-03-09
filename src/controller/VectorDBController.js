import { VectorDBService } from '../service/VectorDBService.js';

export class VectorDBController {
  #events;
  
  constructor({ events }) {
    this.#events = events;
    this.vectorDB = new VectorDBService();
    this.initialized = false;
    this.setupListeners();
  }

  async initialize() {
    if (!this.initialized) {
      await this.vectorDB.init();
      this.initialized = true;
      console.log('✅ VectorDB initialized');
    }
  }

  setupListeners() {
    // Listen for embeddings ready event from worker
    console.log('[VectorDBController] Setting up listeners for embeddingsReady');
    this.#events.onEmbeddingsReady(async (data) => {
      console.log('[VectorDBController] 📥 Received embeddingsReady event:', data);
      await this.handleEmbeddingsReady(data);
    });
  }

  async handleEmbeddingsReady(data) {
    try {
      const { userEmbeddings, cardEmbeddings } = data;

      console.log(`💾 Saving ${userEmbeddings.length} user embeddings and ${cardEmbeddings.length} card embeddings...`);

      // Save all user embeddings
      await this.vectorDB.saveEmbeddings(userEmbeddings, 'user');

      // Save all card embeddings
      await this.vectorDB.saveEmbeddings(cardEmbeddings, 'card');

      const totalCount = await this.vectorDB.count();

      console.log(`✅ Embeddings saved (total): ${totalCount}`);
    } catch (error) {
      console.error('❌ Error saving embeddings:', error);
    }
  }
}
