// server/src/controllers/gameController.js
import Game from '../models/Game.js';
import User from '../models/User.js';

export async function createGame(req, res) {
  try {
    const { mode, score, opponentNickname } = req.body;

    if (!mode || typeof score !== 'number') {
      return res.status(400).json({ error: 'mode e score são obrigatórios.' });
    }

    const game = await Game.create({
      mode,
      score,
      player: req.userId,
      opponentNickname: opponentNickname || null,
      atomsCount: 5,
      boardSize: 8,
    });

    res.status(201).json({ gameId: game._id });
  } catch (err) {
    console.error('createGame error', err);
    res.status(500).json({ error: 'Erro ao registrar partida.' });
  }
}

export async function getRanking(req, res) {
  try {
    const limit = Number(req.query.limit || 10);

    const games = await Game.find({})
      .sort({ score: 1, finishedAt: 1 })
      .limit(limit)
      .populate('player', 'nickname avatarUrl')
      .lean();

    const ranking = games.map((g, idx) => ({
      position: idx + 1,
      player: g.player?.nickname || '??',
      avatarUrl: g.player?.avatarUrl || null,
      score: g.score,
      mode: g.mode,
      finishedAt: g.finishedAt,
      opponentNickname: g.opponentNickname || null,
      gameId: g._id,
    }));

    res.json({ ranking });
  } catch (err) {
    console.error('getRanking error', err);
    res.status(500).json({ error: 'Erro ao carregar ranking.' });
  }
}

export async function getMyGames(req, res) {
  try {
    const games = await Game.find({ player: req.userId })
      .sort({ finishedAt: -1 })
      .lean();

    if (games.length === 0) {
      return res.json({ games: [] });
    }

    const gameIds = games.map((g) => g._id);

    const videos = await Video.find({
      owner: req.userId,
      game: { $in: gameIds },
    })
      .lean();

    const videoByGame = new Map(
      videos.map((v) => [v.game.toString(), v])
    );

    const items = games.map((g) => {
      const v = videoByGame.get(g._id.toString());
      return {
        id: g._id,
        mode: g.mode,
        score: g.score,
        opponentNickname: g.opponentNickname || null,
        finishedAt: g.finishedAt,
        shareUrl: `/game/${g._id}`, // rota futura de detalhes
        videoUrl: v
          ? `/api/videos/${v._id}/stream`
          : null,
      };
    });

    res.json({ games: items });
  } catch (err) {
    console.error('getMyGames error', err);
    res.status(500).json({ error: 'Erro ao carregar partidas do usuário.' });
  }
}