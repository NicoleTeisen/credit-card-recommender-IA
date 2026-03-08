export class CardService {
  #cards = [];

  async getCards() {
    if (this.#cards.length) return this.#cards;
    const response = await fetch('./data/cards.json');
    this.#cards = await response.json();
    return this.#cards;
  }
}
