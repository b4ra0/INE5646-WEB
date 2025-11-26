// server/src/routes/gameRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/games/save
 * Salva uma tentativa de partida para o usuário logado.
 */
router.post('/save', requireAuth, async (req, res) => {
  try {
    let { mode, score, opponentNickname } = req.body;

    // score pode vir como string -> convertemos pra número
    const numericScore = Number(score);
    if (!mode || Number.isNaN(numericScore)) {
      return res
        .status(400)
        .json({ error: 'Campos obrigatórios: mode, score (numérico).' });
    }

    const game = await Game.create({
      player: req.userId,
      mode,
      score: numericScore,
      opponentNickname: opponentNickname || undefined,
      // marca o fim da partida explicitamente
      finishedAt: new Date(),
    });

    return res.status(201).json({
      gameId: game._id,
      game,
    });
  } catch (err) {
    console.error('Erro ao salvar partida:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao salvar partida no banco.' });
  }
});

/**
 * GET /api/games/mine
 * Lista as partidas do usuário logado.
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const games = await Game.find({ player: req.userId })
      // ordena pela data efetiva (finishedAt se existir, senão createdAt)
      .sort({ finishedAt: -1, createdAt: -1 })
      .lean();

    return res.json({ games });
  } catch (err) {
    console.error('Erro ao buscar partidas do usuário:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao carregar partidas do usuário.' });
  }
});

/**
 * GET /api/games/ranking
 * Ranking simples: pega melhor score de cada jogador e ordena.
 */
router.get('/ranking', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);

    // agrega menor score de cada player (melhor partida)
    const bestPerPlayer = await Game.aggregate([
      // cria um campo de data efetiva: finishedAt ou createdAt
      {
        $addFields: {
          effectiveDate: {
            $ifNull: ['$finishedAt', '$createdAt'],
          },
        },
      },
      {
        $group: {
          _id: '$player',
          bestScore: { $min: '$score' },
          lastGameAt: { $max: '$effectiveDate' },
        },
      },
      { $sort: { bestScore: 1, lastGameAt: -1 } },
      { $limit: limit },
    ]);

    // carrega nicknames
    const playerIds = bestPerPlayer.map((g) => g._id);
    const users = await User.find({ _id: { $in: playerIds } })
      .select('nickname')
      .lean();

    const byId = new Map(users.map((u) => [u._id.toString(), u]));
    const ranking = bestPerPlayer.map((g, index) => ({
      position: index + 1,
      playerId: g._id,
      nickname: byId.get(g._id.toString())?.nickname || 'Jogador',
      bestScore: g.bestScore,
      lastGameAt: g.lastGameAt,
    }));

    return res.json({ ranking });
  } catch (err) {
    console.error('Erro ao gerar ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar ranking.' });
  }
});

export default router;
