import { View } from './View.js';

export class UserView extends View {
  #userSelect = document.querySelector('#userSelect');
  #userInfo = document.querySelector('#userInfo');
  #pastCards = document.querySelector('#pastCards');
  #onUserSelect = null;
  #pastCardTemplate = '';

  async init() {
    this.#pastCardTemplate = await this.loadTemplate('./src/view/templates/past-card.html');
  }

  registerUserSelectCallback(callback) {
    this.#onUserSelect = callback;
    this.#userSelect.addEventListener('change', (e) => {
      const id = e.target.value;
      if (!this.#onUserSelect) return;
      this.#onUserSelect(id ? Number(id) : null);
    });
  }

  renderUsers(users, selectedId) {
    const placeholder = `<option value="" ${selectedId == null ? 'selected' : ''}>Selecione um usuário</option>`;
    const options = users
      .map((u) => `<option value="${u.id}" ${u.id === selectedId ? 'selected' : ''}>${u.name}</option>`)
      .join('');

    this.#userSelect.innerHTML = `${placeholder}${options}`;
  }

  renderUser(user) {
    if (!user) {
      this.#userInfo.innerHTML = '<div class="small text-body-secondary">Nenhum perfil selecionado.</div>';
      this.#pastCards.innerHTML = '<span class="chip">Nenhum cartão</span>';
      return;
    }

    this.#userInfo.innerHTML = `
      <div class="small text-body-secondary">
        <strong>Idade:</strong> ${user.age} anos ·
        <strong>Renda:</strong> R$ ${Number(user.income).toLocaleString('pt-BR')} ·
        <strong>Gasto mensal:</strong> R$ ${Number(user.monthlySpend).toLocaleString('pt-BR')} ·
        <strong>Perfil viagem:</strong> ${user.travelProfile}
      </div>
    `;

    if (!user.cards?.length) {
      this.#pastCards.innerHTML = '<span class="chip">Sem cartões no momento</span>';
      return;
    }

    this.#pastCards.innerHTML = user.cards
      .map((card) => this.replaceTemplate(this.#pastCardTemplate, { name: card.name }))
      .join('');
  }
}
