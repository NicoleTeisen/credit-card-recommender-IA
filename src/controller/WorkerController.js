import { workerEvents } from '../events/constants.js';

export class WorkerController {
  #worker;
  #events;

  constructor({ events }) {
    this.#events = events;
    this.#worker = new Worker('./src/workers/modelTrainingWorker.js');
    this.setupWorkerListeners();
    this.setupEventListeners();
  }

  setupWorkerListeners() {
    this.#worker.addEventListener('message', (event) => {
      const data = event.data;

      if (data.type === workerEvents.trainingStarted) {
        this.#events.dispatchModelProgressUpdate({
          type: 'started',
          message: data.message,
          percent: 1,
        });
      }

      if (data.type === workerEvents.trainingLog) {
        this.#events.dispatchModelProgressUpdate({
          type: 'log',
          epoch: data.epoch,
          loss: data.loss,
          accuracy: data.accuracy,
        });
      }

      if (data.type === workerEvents.progressUpdate) {
        this.#events.dispatchModelProgressUpdate({
          type: 'progress',
          percent: data.percent,
        });
      }

      if (data.type === workerEvents.trainingComplete) {
        this.#events.dispatchTrainingComplete(data);
      }

      if (data.type === workerEvents.recommend) {
        this.#events.dispatchRecommendationsReady({
          user: data.user,
          recommendations: data.recommendations,
        });
      }

      if (data.type === workerEvents.embeddingsExtracted) {
        console.log('[WorkerController] 📤 Dispatching embeddingsReady event');
        this.#events.dispatchEmbeddingsReady({
          userEmbeddings: data.userEmbeddings,
          cardEmbeddings: data.cardEmbeddings,
        });
      }

      if (data.type === workerEvents.trainingError) {
        this.#events.dispatchModelProgressUpdate({
          type: 'error',
          message: data.message,
        });
      }
    });

    this.#worker.addEventListener('error', (event) => {
      this.#events.dispatchModelProgressUpdate({
        type: 'error',
        message: event.message || 'Erro no Web Worker durante treinamento.',
      });
    });
  }

  setupEventListeners() {
    this.#events.onModelTrain(({ users, cards }) => {
      this.#worker.postMessage({
        type: workerEvents.trainModel,
        users,
        cards,
      });
    });

    this.#events.onRecommend((user) => {
      this.#worker.postMessage({
        type: workerEvents.recommend,
        user,
      });
    });
  }
}
