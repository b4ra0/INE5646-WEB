// server/src/controllers/userController.js
import User from '../models/User.js';

export async function updateMe(req, res) {
  try {
    const { age, city, state, country, avatarUrl } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (typeof age !== 'undefined') user.age = age;
    if (typeof city !== 'undefined') user.city = city;
    if (typeof state !== 'undefined') user.state = state;
    if (typeof country !== 'undefined') user.country = country;
    if (typeof avatarUrl !== 'undefined') user.avatarUrl = avatarUrl;

    await user.save();

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
    console.error('updateMe error', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}
