import { events } from './constants.js';

export class Events {
  #target = new EventTarget();

  #on(name, callback) {
    this.#target.addEventListener(name, (e) => callback(e.detail));
  }

  #dispatch(name, detail) {
    this.#target.dispatchEvent(new CustomEvent(name, { detail }));
  }

  onUserSelected(callback) { this.#on(events.userSelected, callback); }
  onUsersUpdated(callback) { this.#on(events.usersUpdated, callback); }
  onCardAdded(callback) { this.#on(events.cardAdded, callback); }
  onModelTrain(callback) { this.#on(events.modelTrain, callback); }
  onTrainingComplete(callback) { this.#on(events.trainingComplete, callback); }
  onModelProgressUpdate(callback) { this.#on(events.modelProgressUpdate, callback); }
  onRecommendationsReady(callback) { this.#on(events.recommendationsReady, callback); }
  onRecommend(callback) { this.#on(events.recommend, callback); }

  dispatchUserSelected(user) { this.#dispatch(events.userSelected, user); }
  dispatchUsersUpdated(users) { this.#dispatch(events.usersUpdated, users); }
  dispatchCardAdded(payload) { this.#dispatch(events.cardAdded, payload); }
  dispatchModelTrain(payload) { this.#dispatch(events.modelTrain, payload); }
  dispatchTrainingComplete(payload) { this.#dispatch(events.trainingComplete, payload); }
  dispatchModelProgressUpdate(payload) { this.#dispatch(events.modelProgressUpdate, payload); }
  dispatchRecommendationsReady(payload) { this.#dispatch(events.recommendationsReady, payload); }
  dispatchRecommend(user) { this.#dispatch(events.recommend, user); }
}
