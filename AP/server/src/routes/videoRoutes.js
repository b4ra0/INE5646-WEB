// server/src/routes/videoRoutes.js
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { getVideoBucket } from '../config/db.js';
import Video from '../models/Video.js';
import Game from '../models/Game.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/videos/upload
router.post(
  '/upload',
  requireAuth,
  upload.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Arquivo de vídeo não enviado.' });
      }

      console.log(
        'Recebendo upload de vídeo:',
        req.file.originalname,
        'size =',
        req.file.size
      );

      const { gameId } = req.body;
      let gameObjectId = null;
      if (gameId && mongoose.Types.ObjectId.isValid(gameId)) {
        gameObjectId = new mongoose.Types.ObjectId(gameId);
      }

      const bucket = getVideoBucket();
      const filename =
        req.file.originalname || `partida-${Date.now()}.webm`;

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype || 'video/webm',
      });

      uploadStream.on('error', (err) => {
        console.error('Erro ao salvar vídeo em GridFS:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro ao salvar vídeo.' });
        }
      });

      uploadStream.on('finish', async () => {
        try {
          const videoDoc = await Video.create({
            owner: req.userId,
            filename,
            fileId: uploadStream.id,
            mimeType: req.file.mimetype || 'video/webm',
          });

          console.log('Vídeo salvo com ID', videoDoc._id.toString());

          if (gameObjectId) {
            await Game.findByIdAndUpdate(gameObjectId, {
              video: videoDoc._id,
            });
            console.log(
              'Vídeo vinculado ao game',
              gameObjectId.toString()
            );
          }

          const shareUrl = `/api/videos/${videoDoc._id}/stream`;

          res.json({
            videoId: videoDoc._id,
            gameId: gameObjectId,
            shareUrl,
          });
        } catch (err) {
          console.error('Erro ao criar documento de vídeo:', err);
          if (!res.headersSent) {
            res
              .status(500)
              .json({ error: 'Erro ao registrar vídeo no banco.' });
          }
        }
      });

      uploadStream.end(req.file.buffer);
    } catch (err) {
      console.error('upload vídeo error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro no upload de vídeo.' });
      }
    }
  }
);

// GET /api/videos/:id/stream
router.get('/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const videoDoc = await Video.findById(id);
    if (!videoDoc) {
      return res.status(404).json({ error: 'Vídeo não encontrado.' });
    }

    const bucket = getVideoBucket();
    res.setHeader('Content-Type', videoDoc.mimeType || 'video/webm');

    const downloadStream = bucket.openDownloadStream(videoDoc.fileId);

    downloadStream.on('error', (err) => {
      console.error('Erro ao ler vídeo do GridFS:', err);
      if (!res.headersSent) {
        res.sendStatus(500);
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('stream vídeo error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao carregar vídeo.' });
    }
  }
});

export default router;
