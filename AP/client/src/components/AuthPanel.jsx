// client/src/components/AuthPanel.jsx
import React, { useState } from 'react';
import { api } from '../api';

export default function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    nickname: '',
    password: '',
    age: '',
    city: '',
    state: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload =
        mode === 'register'
          ? {
              nickname: form.nickname,
              password: form.password,
              age: form.age ? Number(form.age) : undefined,
              city: form.city || undefined,
              state: form.state || undefined,
              country: form.country || undefined,
            }
          : {
              nickname: form.nickname,
              password: form.password,
            };

      const res =
        mode === 'register' ? await api.register(payload) : await api.login(payload);

      onAuth(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, width: '100%' }}>
      <h2 style={{ marginTop: 0 }}>Entrar</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          className={'btn ' + (mode === 'login' ? 'primary' : 'gray')}
          type="button"
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={'btn ' + (mode === 'register' ? 'primary' : 'gray')}
          type="button"
          onClick={() => setMode('register')}
        >
          Cadastro
        </button>
      </div>

      <form onSubmit={handleSubmit} className="column" style={{ gap: 8 }}>
        <input
          name="nickname"
          placeholder="Nickname"
          value={form.nickname}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          required
        />

        {mode === 'register' && (
          <>
            <input
              name="age"
              type="number"
              placeholder="Idade"
              value={form.age}
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="Cidade"
              value={form.city}
              onChange={handleChange}
            />
            <input
              name="state"
              placeholder="Estado"
              value={form.state}
              onChange={handleChange}
            />
            <input
              name="country"
              placeholder="País"
              value={form.country}
              onChange={handleChange}
            />
          </>
        )}

        {error && (
          <div style={{ color: 'red', fontSize: 12 }}>
            {error}
          </div>
        )}

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}
