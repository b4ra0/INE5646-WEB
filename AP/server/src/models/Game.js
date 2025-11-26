// server/src/models/Game.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const gameSchema = new Schema(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mode: {
      type: String,
      enum: ['bot', 'pvp'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    opponentNickname: {
      type: String,
    },
    // relação opcional com o vídeo gravado
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

const Game = mongoose.model('Game', gameSchema);
export default Game;
