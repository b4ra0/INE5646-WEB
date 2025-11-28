const express = require('express');
const routes = express.Router();
const UserController = require('./controllers/UserController');
const PartidaController = require("./controllers/PartidaController");

// Rota de teste
routes.get('/', (req, res) => {
    return res.json({ message: 'Servidor Black Box Online!' });
});

// Rotas de Usuário
routes.post('/users', UserController.store);   // Criar
routes.get('/users', UserController.index);    // Listar
routes.put('/users/:id', UserController.update); // Atualizar (precisa do ID)

routes.post('/partidas', PartidaController.store); // Criar partida (Esconder átomos)
routes.post('/partidas/:id/jogar', PartidaController.jogar); // Atirar raio

module.exports = routes;