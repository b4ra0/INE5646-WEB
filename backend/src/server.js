const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(routes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API do Black Box rodando...');
});

// Definição da Porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});