export class UserService {
  #users = [];
  #defaultUsers = [];

  async getDefaultUsers() {
    if (this.#defaultUsers.length) return this.#defaultUsers;
    const response = await fetch('./data/users.json');
    this.#defaultUsers = await response.json();
    this.#users = JSON.parse(JSON.stringify(this.#defaultUsers));
    return this.#defaultUsers;
  }

  async getUsers() {
    return this.#users;
  }

  async getUserById(id) {
    return this.#users.find((user) => user.id === Number(id));
  }

  async updateUser(updatedUser) {
    const index = this.#users.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      this.#users[index] = JSON.parse(JSON.stringify(updatedUser));
    }
    return updatedUser;
  }

  addUser(user) {
    this.#users.unshift(user);
  }
}
