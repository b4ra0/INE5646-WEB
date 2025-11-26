// server/src/models/Video.js
import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    filename: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    mimeType: { type: String, default: 'video/webm' },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Video', VideoSchema);
