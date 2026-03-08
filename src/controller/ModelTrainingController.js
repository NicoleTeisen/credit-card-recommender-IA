export class ModelTrainingController {
  #events;
  #userService;
  #cardService;
  #view;

  constructor({ events, userService, cardService, modelTrainingView }) {
    this.#events = events;
    this.#userService = userService;
    this.#cardService = cardService;
    this.#view = modelTrainingView;
    void this.init();
  }

  async init() {
    this.#events.onUsersUpdated(async (users) => {
      const cards = await this.#cardService.getCards();
      this.#view.setTrainingStarted();
      this.#events.dispatchModelTrain({ users, cards });
    });

    this.#events.onModelProgressUpdate((payload) => {
      if (payload.type === 'started') {
        this.#view.setTrainingStarted(payload.message);
        this.#view.updateProgress(payload);
      }
      if (payload.type === 'log') {
        this.#view.updateMetrics(payload);
      }
      if (payload.type === 'progress') {
        this.#view.updateProgress(payload);
      }
      if (payload.type === 'error') {
        this.#view.setTrainingError(payload.message);
      }
    });

    this.#events.onTrainingComplete(() => {
      this.#view.setTrainingComplete();
    });

    const users = await this.#userService.getUsers();
    const cards = await this.#cardService.getCards();
    this.#view.setTrainingStarted();
    this.#events.dispatchModelTrain({ users, cards });
  }
}
