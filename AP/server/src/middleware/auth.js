// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token =
    req.cookies?.bbx_token ||
    req.cookies?.BBX_TOKEN ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
