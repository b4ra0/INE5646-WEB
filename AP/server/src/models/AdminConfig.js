import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema({
  maxQueueSize: { type: Number, default: 25 },
  inactivitySeconds: { type: Number, default: 60 },
  videoRetentionDays: { type: Number, default: 15 },
  maxVideoStorageBytes: { type: Number, default: 1 * 1024 * 1024 * 1024 } // 1 GB
});

export const AdminConfig = mongoose.model('AdminConfig', adminConfigSchema);
