// server/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',                      // Para desenvolvimento local
  'https://web.lucas.barao.vms.ufsc.br'         // SEU DOMÍNIO DE PRODUÇÃO
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como Postman ou servidor-para-servidor)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS deste site não permite acesso desta origem.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// rotas
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

export default app;
