// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const COOKIE_NAME = 'bbx_token';
const JWT_EXPIRES = '7d';

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

export async function register(req, res) {
  try {
    const { nickname, password, age, city, state, country } = req.body;
    if (!nickname || !password) {
      return res.status(400).json({ error: 'Nickname e senha são obrigatórios.' });
    }

    const exists = await User.findOne({ nickname });
    if (exists) {
      return res.status(409).json({ error: 'Nickname já em uso.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      nickname,
      passwordHash: hash,
      age,
      city,
      state,
      country,
    });

    const token = signToken(user._id);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // HTTPS depois
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        user: {
          id: user._id,
          nickname: user.nickname,
          age: user.age,
          city: user.city,
          state: user.state,
          country: user.country,
          avatarUrl: user.avatarUrl,
        },
      });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}

export async function login(req, res) {
  try {
    const { nickname, password } = req.body;
    if (!nickname || !password) {
      return res.status(400).json({ error: 'Nickname e senha são obrigatórios.' });
    }
    const user = await User.findOne({ nickname });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = signToken(user._id);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          nickname: user.nickname,
          age: user.age,
          city: user.city,
          state: user.state,
          country: user.country,
          avatarUrl: user.avatarUrl,
        },
      });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Erro ao autenticar.' });
  }
}

export function logout(req, res) {
  res
    .clearCookie(COOKIE_NAME)
    .json({ ok: true });
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({
      user: {
        id: user._id,
        nickname: user.nickname,
        age: user.age,
        city: user.city,
        state: user.state,
        country: user.country,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('me error', err);
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
}
