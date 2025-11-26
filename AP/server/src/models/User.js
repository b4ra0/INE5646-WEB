// server/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true, unique: true, trim: true },
    age: { type: Number },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    avatarUrl: { type: String },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
