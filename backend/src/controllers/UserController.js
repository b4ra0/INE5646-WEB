const User = require('../models/User');

module.exports = {
    // 1. Criar Usuário (Cadastro)
    async store(req, res) {
        try {
            // Desestruturação dos dados que chegam na requisição
            const { nickname, senha, idade, local, avatar } = req.body;

            // Verificação simples se o usuário já existe
            const userExists = await User.findOne({ nickname });
            if (userExists) {
                return res.status(400).json({ error: 'Nickname já cadastrado.' });
            }

            // Criação do usuário no banco
            // Nota: Em produção, aqui usaríamos bcrypt para hashear a senha antes de salvar
            const user = await User.create({
                nickname,
                senha,
                idade,
                local, // Espera um objeto { cidade, estado, pais }
                avatar
            });

            return res.status(201).json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
        }
    },

    // 2. Listar Usuários (Apenas para teste ou Ranking)
    async index(req, res) {
        try {
            const users = await User.find();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },

    // 3. Atualizar Usuário (Update - Requisito do CRUD)
    async update(req, res) {
        try {
            const { id } = req.params; // ID vem pela URL
            const { nickname, idade, local } = req.body;

            // findByIdAndUpdate retorna o antigo por padrão, o { new: true } retorna o atualizado
            const user = await User.findByIdAndUpdate(id, {
                nickname,
                idade,
                local
            }, { new: true });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
};