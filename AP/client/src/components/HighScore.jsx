// client/src/components/HighScore.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function HighScore() {
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getRanking()
      .then((res) => setRanking(res.ranking || []))
      .catch((err) => setError(err.message || 'Erro ao carregar ranking'));
  }, []);

  return (
    <div className="card section" style={{ marginTop: 16 }}>
      <h3>High score (menor pontuação)</h3>
      {error && <div style={{ color: 'red', fontSize: 12 }}>{error}</div>}

      {ranking.length === 0 ? (
        <p className="small">Nenhuma partida no ranking ainda.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>Score</th>
                <th>Modo</th>
                <th>Oponente</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, idx) => (
                <tr key={r.playerId || idx}>
                  <td>{idx + 1}</td>
                  <td>{r.nickname}</td>
                  <td>{r.bestScore}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    {r.lastGameAt
                      ? new Date(r.lastGameAt).toLocaleString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
