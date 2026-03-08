import { View } from './View.js';

export class CardView extends View {
  #cardList = document.querySelector('#cardList');
  #categoryFilter = document.querySelector('#categoryFilter');
  #benefitFilter = document.querySelector('#benefitFilter');
  #showLowCompatibility = document.querySelector('#showLowCompatibility');
  #cardTemplate = '';
  #onRequestCard = null;
  #currentUser = null;
  #allCards = [];

  async init() {
    this.#cardTemplate = await this.loadTemplate('./src/view/templates/card-card.html');
    this.setupFilters();
  }

  setupFilters() {
    this.#categoryFilter?.addEventListener('change', () => this.applyFilters());
    this.#benefitFilter?.addEventListener('change', () => this.applyFilters());
    this.#showLowCompatibility?.addEventListener('change', () => this.applyFilters());
  }

  applyFilters() {
    const category = this.#categoryFilter?.value || '';
    const benefit = this.#benefitFilter?.value || '';
    const showLow = Boolean(this.#showLowCompatibility?.checked);

    const filtered = this.#allCards.filter(card => {
      const matchCategory = !category || card.category === category;
      const matchBenefit = !benefit || card.benefitType === benefit;
      const isScored = Number.isFinite(card.score);
      const isLowCompatibility = isScored && (card.score < 0.2 || card.incomeCompatible === false);
      const matchCompatibility = showLow || !isLowCompatibility;
      return matchCategory && matchBenefit && matchCompatibility;
    });

    this.renderCards(filtered);
  }

  onUserSelected(user) {
    this.#currentUser = user;
  }

  registerRequestCardCallback(callback) {
    this.#onRequestCard = callback;
  }

  render(cards, disableButtons = true) {
    this.#allCards = cards;
    this.applyFilters();
  }

  renderCards(cards) {
    const topScore = cards[0]?.score || 0;
    
    const html = cards.map((card, index) => {
      const alreadyOwned = this.#currentUser?.cards?.some((c) => c.id === card.id);
      const incomeCompatible = card.incomeCompatible !== false;
      const isBestMatch = index === 0 && card.score > 0.7;
      
      const reasonsList = (card.reasons || [])
        .map(reason => `<li>${reason}</li>`)
        .join('');
      
      return this.replaceTemplate(this.#cardTemplate, {
        id: card.id,
        name: card.name,
        category: card.category,
        annualFee: Number(card.annualFee).toFixed(2),
        benefitType: card.benefitType,
        incomeRequired: Number(card.incomeRequired).toFixed(2),
        score: Number.isFinite(card.score),
        scoreValue: Number.isFinite(card.score) ? (card.score * 100).toFixed(1) : '',
        owned: alreadyOwned ? 'Sim' : 'Não',
        cardEncoded: encodeURIComponent(JSON.stringify(card)),
        bestMatch: isBestMatch,
        incomeWarning: !incomeCompatible,
        incomeClass: !incomeCompatible ? 'card-disabled' : '',
        hasReasons: reasonsList.length > 0,
        reasonsList,
        disabledAttr: alreadyOwned ? 'disabled' : '',
      });
    }).join('');

    this.#cardList.innerHTML = html || '<div class="col-12 text-center text-muted py-4">Nenhum cartão encontrado com os filtros selecionados.</div>';
    this.attachRequestButtonListeners();
  }

  attachRequestButtonListeners() {
    this.#cardList.querySelectorAll('.request-card-btn').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.#onRequestCard || button.disabled) return;
        const encoded = button.getAttribute('data-card');
        const card = JSON.parse(decodeURIComponent(encoded));
        this.#onRequestCard(card);
      });
    });
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : 'bg-danger';
    
    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-check-circle me-2"></i>${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
  }
}
