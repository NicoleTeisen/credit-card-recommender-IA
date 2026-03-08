export class CardController {
  #cardView;
  #currentUser = null;
  #events;
  #cardService;

  constructor({ cardView, events, cardService }) {
    this.#cardView = cardView;
    this.#cardService = cardService;
    this.#events = events;
    void this.init();
  }

  async init() {
    this.setupCallbacks();
    this.setupEventListeners();
    const cards = await this.#cardService.getCards();
    this.#cardView.render(cards, true);
  }

  setupEventListeners() {
    this.#events.onUserSelected(async (user) => {
      this.#currentUser = user;
      this.#cardView.onUserSelected(user);

      if (!user) {
        const cards = await this.#cardService.getCards();
        this.#cardView.render(cards, true);
        return;
      }

      this.#events.dispatchRecommend(user);
    });

    this.#events.onRecommendationsReady(({ recommendations }) => {
      this.#cardView.render(recommendations, false);
    });

    this.#events.onCardAdded(({ card }) => {
      this.#cardView.showToast(`Cartão ${card.name} adicionado com sucesso!`, 'success');
    });
  }

  setupCallbacks() {
    this.#cardView.registerRequestCardCallback(this.handleRequestCard.bind(this));
  }

  async handleRequestCard(card) {
    const user = this.#currentUser;
    if (!user) return;

    if (user.cards.some((c) => c.id === card.id)) return;
    this.#events.dispatchCardAdded({ user, card });
  }
}
