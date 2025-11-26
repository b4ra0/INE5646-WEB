// client/src/components/MyGames.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function MyGames() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMyGames()
      .then((res) => setGames(res.games || []))
      .catch((err) => setError(err.message || 'Erro ao carregar partidas'));
  }, []);

  return (
    <div className="card section" style={{ marginTop: 16 }}>
      <h3>Minhas partidas</h3>
      {error && (
        <div style={{ color: 'red', fontSize: 12 }}>{error}</div>
      )}

      {games.length === 0 ? (
        <p className="small">
          Você ainda não tem partidas registradas. Jogue contra o bot ou em 1v1 e clique
          em <b>Check guesses &amp; lock</b> para salvar a tentativa.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Modo</th>
                <th>Oponente</th>
                <th>Score</th>
                <th>Vídeo</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g, idx) => {
                const dt = g.finishedAt || g.createdAt;
                const videoId = g.video; // ObjectId ou undefined
                return (
                  <tr key={g._id || idx}>
                    <td>
                      {dt
                        ? new Date(dt).toLocaleString('pt-BR')
                        : '-'}
                    </td>
                    <td>{g.mode}</td>
                    <td>{g.opponentNickname || '-'}</td>
                    <td>{g.score}</td>
                    <td>
                      {videoId ? (
                        <a
                          href={`/api/videos/${videoId}/stream`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12 }}
                        >
                          Assistir
                        </a>
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            color: '#9ca3af',
                          }}
                        >
                          sem vídeo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
