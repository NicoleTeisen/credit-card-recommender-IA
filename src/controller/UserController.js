export class UserController {
  #userView;
  #userService;
  #events;
  #selectedUserId = null;

  constructor({ userView, userService, events }) {
    this.#userView = userView;
    this.#userService = userService;
    this.#events = events;
    void this.init();
  }

  async init() {
    await this.#userService.getDefaultUsers();
    const users = await this.#userService.getUsers();
    this.#selectedUserId = null;

    this.#userView.registerUserSelectCallback(this.handleUserSelected.bind(this));
    this.#userView.renderUsers(users, this.#selectedUserId);
    this.#userView.renderUser(null);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.#events.onCardAdded(async ({ user, card }) => {
      const updatedUser = {
        ...user,
        cards: [...user.cards, { id: card.id, name: card.name }],
      };

      await this.#userService.updateUser(updatedUser);
      this.#selectedUserId = updatedUser.id;
      this.#userView.renderUser(updatedUser);

      const users = await this.#userService.getUsers();
      this.#userView.renderUsers(users, this.#selectedUserId);

      this.#events.dispatchUsersUpdated(users);
      this.#events.dispatchUserSelected(updatedUser);
    });
  }

  async handleUserSelected(userId) {
    if (!userId) {
      this.#selectedUserId = null;
      this.#userView.renderUser(null);
      this.#events.dispatchUserSelected(null);
      return;
    }

    this.#selectedUserId = userId;
    const user = await this.#userService.getUserById(userId);
    this.#userView.renderUser(user);
    this.#events.dispatchUserSelected(user);
  }
}
