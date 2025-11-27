// client/src/components/Ranking.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Ranking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getRanking();
        const data = res.ranking || [];
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Erro ao carregar ranking', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="card ranking-card">
        <div className="ranking-header">
          <div>
            <h3>High score (menor pontuação)</h3>
            <p className="ranking-subtitle">Carregando ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card ranking-card">
        <div className="ranking-header">
          <div>
            <h3>High score (menor pontuação)</h3>
            <p className="ranking-subtitle">
              Ainda não há partidas registradas para o ranking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card ranking-card">
      <div className="ranking-header">
        <div>
          <h3>High score (menor pontuação)</h3>
          <p className="ranking-subtitle">
            Melhor partida com menor score registrado.
          </p>
        </div>
        <span className="ranking-badge">Top {rows.length}</span>
      </div>

      <div className="ranking-table-wrapper">
        <table className="score-table ranking-table">
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
            {rows.map((row, idx) => {
              const rowClass =
                'ranking-row' + (idx === 0 ? ' ranking-row-first' : '');

              return (
                <tr key={row.playerId ?? idx} className={rowClass}>
                  <td>{row.position ?? idx + 1}</td>
                  <td>{row.nickname}</td>
                  <td>{row.bestScore}</td>
                  <td>{row.mode || '-'}</td>
                  <td>{row.opponent || '-'}</td>
                  <td>
                    {row.lastGameAt
                      ? new Date(row.lastGameAt).toLocaleString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
