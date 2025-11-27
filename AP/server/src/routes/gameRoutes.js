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
 * Lista as partidas do usuário logado (da mais recente para a mais antiga).
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.userId);

    const games = await Game.aggregate([
      { $match: { player: playerId } },
      {
        $addFields: {
          effectiveDate: {
            $ifNull: ['$finishedAt', '$createdAt'],
          },
        },
      },
      { $sort: { effectiveDate: -1 } },
    ]);

    return res.json({ games });
  } catch (err) {
    console.error('Erro ao carregar partidas', err);
    return res.status(500).json({ error: 'Erro ao carregar partidas.' });
  }
});

/**
 * GET /api/games/ranking
 * Ranking por melhor score de cada jogador.
 */

router.get('/ranking', async (req, res) => {
  try {
    // por padrão, top 5 – pode sobrescrever com ?limit=10
    const limit = Number(req.query.limit || 5);

    const bestGames = await Game.aggregate([
      // data efetiva: finishedAt ou createdAt
      {
        $addFields: {
          effectiveDate: {
            $ifNull: ['$finishedAt', '$createdAt'],
          },
        },
      },
      // ordena por melhor score e, em caso de empate, pela partida mais antiga
      {
        $sort: {
          score: 1,
          effectiveDate: 1,
        },
      },
      // pega as N melhores partidas
      { $limit: limit },
    ]);

    // carrega nicknames dos jogadores envolvidos
    const playerIds = bestGames.map((g) => g.player);
    const users = await User.find({ _id: { $in: playerIds } })
      .select('nickname')
      .lean();

    const byId = new Map(users.map((u) => [u._id.toString(), u]));

    const ranking = bestGames.map((g, index) => ({
      position: index + 1,
      playerId: g.player,
      nickname: byId.get(g.player.toString())?.nickname || 'Jogador',
      bestScore: g.score,
      mode: g.mode || null,
      opponent: g.opponentNickname || null, // campo salvo na partida
      lastGameAt: g.effectiveDate,
    }));

    return res.json({ ranking });
  } catch (err) {
    console.error('Erro ao gerar ranking:', err);
    return res.status(500).json({ error: 'Erro ao carregar ranking.' });
  }
});


export default router;
