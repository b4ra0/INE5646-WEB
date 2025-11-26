// server/src/config/db.js
import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blackbox';

let videoBucket = null;

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado em', MONGO_URI);

    const conn = mongoose.connection;

    conn.once('open', () => {
      videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'videos',
      });
      console.log('GridFSBucket "videos" inicializado');
    });
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
    throw err;
  }
}

export function getVideoBucket() {
  if (!videoBucket) {
    const conn = mongoose.connection;
    if (conn.db) {
      videoBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'videos',
      });
      console.log('GridFSBucket "videos" inicializado (lazy)');
    } else {
      throw new Error('GridFS ainda não está pronto (sem conexão ativa)');
    }
  }
  return videoBucket;
}
