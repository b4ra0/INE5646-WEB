// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import AvatarPicker from './components/AvatarPicker';
import RecordingControls from './components/RecordingControls';
import MyGames from './components/MyGames';
import Ranking from './components/Ranking';
import { api } from './api';
import './gameboard.css';
import './layout.css';

export default function App() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({
    nickname: '',
    password: '',
    age: '',
    city: '',
    state: '',
    country: '',
  });

  const [lastGameId, setLastGameId] = useState(null);

  // --------- THEME (LIGHT / DARK) ---------
  const [theme, setTheme] = useState('light');

  // carrega tema salvo ou preferência do SO
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch {
      // se der erro, fica no default 'light'
    }
  }, []);

  // aplica data-theme no <html> e persiste
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  // --------- CARREGA USUÁRIO LOGADO ---------
  useEffect(() => {
    api
      .getMe()
      .then((res) => {
        if (res && res.user) {
          setCurrentUser(res.user);
          const url =
            res.user.avatarUrl ||
            res.user.avatar ||
            res.user.photoUrl ||
            res.user.picture ||
            '';
          setAvatarUrl(url);
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError('');

    try {
      const res =
        tab === 'login'
          ? await api.login({
              nickname: form.nickname,
              password: form.password,
            })
          : await api.register(form);

      setCurrentUser(res.user);
      const url =
        res.user.avatarUrl ||
        res.user.avatar ||
        res.user.photoUrl ||
        res.user.picture ||
        '';
      setAvatarUrl(url);
    } catch (err) {
      setAuthError(err.message || 'Erro ao realizar a operação');
    }
  }

  async function handleLogout() {
    await api.logout();
    setCurrentUser(null);
    setLastGameId(null);
  }

  function handleGameSaved(gameId) {
    setLastGameId(gameId);
  }

  function handleVideoAttached({ gameId }) {
    if (gameId) setLastGameId(gameId);
  }

  const themeLabel = theme === 'dark' ? 'Modo claro' : 'Modo escuro';

  // ---------- LOGIN / CADASTRO ----------
  if (!currentUser) {
    return (
      <div className="page-root center-all">
        <div className="card auth-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 8,
            }}
          >
            <button className="btn dark" type="button" onClick={toggleTheme}>
              {themeLabel}
            </button>
          </div>

          <h1 className="title-main">Black Box — Bot &amp; 1v1</h1>
          <p className="subtitle">
            Faça login ou cadastro para jogar e aparecer no ranking.
          </p>

          <div className="tab-row">
            <button
              className={'btn ' + (tab === 'login' ? 'primary' : 'gray')}
              onClick={() => {
                setTab('login');
                setAuthError('');
              }}
            >
              Login
            </button>

            <button
              className={'btn ' + (tab === 'register' ? 'primary' : 'gray')}
              onClick={() => {
                setTab('register');
                setAuthError('');
              }}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-col">
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Nickname"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Senha"
            />

            {tab === 'register' && (
              <>
                <input
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Idade"
                />
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Cidade"
                />
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Estado"
                />
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="País"
                />
              </>
            )}

            {authError && <div className="error-text">{authError}</div>}

            <button type="submit" className="btn primary submit-btn">
              {tab === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- TELA PRINCIPAL ----------
  return (
    <div className="page-root content-center">
      {/* topo */}
      <div className="top-row">
        <p className="small">
          Olá, <b>{currentUser.nickname}</b> — jogue, grave suas partidas e veja
          seu desempenho no ranking.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn dark" type="button" onClick={toggleTheme}>
            {themeLabel}
          </button>
          <button className="btn gray" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className="card profile-card">
        {/* Avatar grande + nickname */}
        <div className="profile-top">
          <div className="profile-avatar-wrapper">
            <img
              src={
                avatarUrl ||
                currentUser.avatarUrl ||
                currentUser.avatar ||
                currentUser.photoUrl ||
                currentUser.picture
              }
              alt="Avatar"
              className="profile-avatar"
            />
          </div>

          <div className="profile-top-info">
            <div className="profile-nickname">@{currentUser.nickname}</div>
            <div className="profile-subtext">Conta vinculada ao ranking</div>
          </div>
        </div>

        {/* Informações */}
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="label">Idade</span>
            <span className="value">{currentUser.age ?? '-'}</span>
          </div>

          <div className="profile-info-item">
            <span className="label">Cidade</span>
            <span className="value">{currentUser.city || '-'}</span>
          </div>

          <div className="profile-info-item">
            <span className="label">Estado</span>
            <span className="value">{currentUser.state || '-'}</span>
          </div>

          <div className="profile-info-item">
            <span className="label">País</span>
            <span className="value">{currentUser.country || '-'}</span>
          </div>
        </div>

        {/* Texto auxiliar */}
        <p className="profile-helper">
          Atualize seu avatar abaixo. Informações do perfil aparecem no ranking
          e nas partidas.
        </p>

        <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
      </div>

      {/* gravação */}
      <div className="card">
        <RecordingControls
          lastGameId={lastGameId}
          onVideoAttached={handleVideoAttached}
        />
      </div>

      {/* tabuleiro */}
      <div className="board-wrapper">
        <GameBoard currentUser={currentUser} onGameSaved={handleGameSaved} />
      </div>

      {/* minhas partidas + ranking */}
      <div className="two-lists">
        <MyGames />
        <Ranking />
      </div>
    </div>
  );
}
