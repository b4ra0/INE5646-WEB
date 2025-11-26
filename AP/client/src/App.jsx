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

  // ---------- LOGIN / CADASTRO ----------
  if (!currentUser) {
    return (
      <div className="page-root center-all">
        <div className="card auth-card">
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

        <button className="btn gray" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* perfil */}
      <div className="card">
        <h3>Perfil</h3>
        <p className="small" style={{ marginBottom: 12 }}>
          Atualize seu avatar. Seus dados de cadastro aparecem abaixo.
        </p>

        {/* grid de informações do usuário */}
        <div className="profile-info">
          <div>
            <span className="profile-label">Nickname:</span>
            <span>{currentUser.nickname}</span>
          </div>
          {currentUser.age && (
            <div>
              <span className="profile-label">Idade:</span>
              <span>{currentUser.age}</span>
            </div>
          )}
          {currentUser.city && (
            <div>
              <span className="profile-label">Cidade:</span>
              <span>{currentUser.city}</span>
            </div>
          )}
          {currentUser.state && (
            <div>
              <span className="profile-label">Estado:</span>
              <span>{currentUser.state}</span>
            </div>
          )}
          {currentUser.country && (
            <div>
              <span className="profile-label">País:</span>
              <span>{currentUser.country}</span>
            </div>
          )}
        </div>

        {/* preview do avatar atual */}
        {(() => {
          const src =
            avatarUrl ||
            currentUser.avatarUrl ||
            currentUser.avatar ||
            currentUser.photoUrl ||
            currentUser.picture;

          if (!src) return null;

          return (
            <div className="avatar-preview">
              <img src={src} alt="Avatar do usuário" />
            </div>
          );
        })()}


        <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
      </div>

      {/* gravação */}
      <div className="card">
        <RecordingControls
          lastGameId={lastGameId}
          onVideoAttached={handleVideoAttached}
        />
      </div>

      {/* tabuleiro – sem card em volta para não criar espaço gigante */}
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
