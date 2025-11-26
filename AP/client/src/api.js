// client/src/api.js

export const api = {
  async register(data) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async login(data) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    return res.json();
  },

  // ✅ A FUNÇÃO QUE FALTAVA
  async getMe() {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return { user: null };
    return res.json();
  },

  async saveGame(data) {
    const res = await fetch('/api/games/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getMyGames() {
    const res = await fetch('/api/games/mine', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getRanking() {
    const res = await fetch('/api/games/ranking', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
