import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Ranking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getRanking();

        // tenta achar o array dentro da resposta
        const data =
          res.ranking ||
          res.highscores ||
          res.games ||
          res.items ||
          res.data ||
          res;

        const arr = Array.isArray(data) ? data : [];
        console.log('RANKING RAW:', res);
        console.log('RANKING SAMPLE:', arr[0]);
        setRows(arr);
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
      <div className="card">
        <h3>High score (menor pontuação)</h3>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card">
        <h3>High score (menor pontuação)</h3>
        <p>Nenhum score registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>High score (menor pontuação)</h3>

      <div className="table-wrapper">
        <table className="score-table">
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
              // jogador
              const jogador =
                row.userNickname ||
                row.nickname ||
                row.playerName ||
                row.player ||
                row.user ||
                '-';

              // tenta achar score por nomes conhecidos
              let score =
                row.score ??
                row.bestScore ??
                row.minScore ??
                row.highscore ??
                row.points ??
                row.pontuacao;

              // se ainda não tiver score, tenta pegar algum número "razoável"
              if (score == null) {
                const candidates = Object.entries(row).filter(
                  ([key, value]) =>
                    typeof value === 'number' &&
                    ![
                      'id',
                      'userId',
                      'user_id',
                      'rank',
                      'position',
                      'games',
                      'gamesCount',
                    ].includes(key)
                );
                if (candidates.length > 0) {
                  score = candidates[0][1];
                }
              }

              const modo =
                row.mode ||
                row.gameMode ||
                row.modeName ||
                row.type ||
                row.game_type ||
                '';

              const oponente =
                row.opponentNickname ||
                row.opponent ||
                row.oponente ||
                row.enemy ||
                '-';

              const rawDate =
                row.createdAt ||
                row.created_at ||
                row.date ||
                row.playedAt ||
                row.firstGameAt ||
                row.lastGameAt ||
                row.data;

              const dateStr = rawDate
                ? new Date(rawDate).toLocaleString('pt-BR')
                : '-';

              return (
                <tr key={row.id ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{jogador}</td>
                  <td>{score ?? '-'}</td>
                  <td>{modo || '-'}</td>
                  <td>{oponente || '-'}</td>
                  <td>{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
