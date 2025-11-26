// client/src/components/ProfilePanel.jsx
import React, { useState } from 'react';
import { api } from '../api';
import AvatarPicker from './AvatarPicker';

export default function ProfilePanel({ currentUser, onUserChange }) {
  const [form, setForm] = useState({
    age: currentUser?.age || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    country: currentUser?.country || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleAvatarChange(value) {
    setForm((f) => ({ ...f, avatarUrl: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        age: form.age ? Number(form.age) : undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        avatarUrl: form.avatarUrl || undefined,
      };
      const res = await api.updateMe(payload);
      onUserChange?.(res.user);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card section" style={{ marginTop: 16 }}>
      <h3>Perfil</h3>
      <form
        onSubmit={handleSubmit}
        className="column"
        style={{ gap: 8, maxWidth: 400 }}
      >
        <div className="small">
          Nickname: <b>{currentUser.nickname}</b>
        </div>
        <input
          type="number"
          name="age"
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

        <AvatarPicker value={form.avatarUrl} onChange={handleAvatarChange} />

        {error && (
          <div style={{ color: 'red', fontSize: 12 }}>{error}</div>
        )}

        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
    </div>
  );
}
