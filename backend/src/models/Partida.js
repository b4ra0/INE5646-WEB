const mongoose = require('mongoose');

const PartidaSchema = new mongoose.Schema({
    // Requisito: Modo de jogo (Bot ou Humanos)
    modoJogo: {
        type: String,
        enum: ['humanos', 'bot'],
        default: 'humanos'
    },
    jogadores: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        funcao: {
            type: String,
            enum: ['escondedor', 'adivinhador'] // Quem esconde vs Quem atira raios
        }
    }],
    // O Tabuleiro e os Átomos
    // "Um dos jogadores escolhe secretamente a posição de átomos"
    posicaoAtomos: [{
        x: Number,
        y: Number
    }],
    // Histórico de jogadas (Raios)
    // "O outro deve atirar raios... indicando o local por onde entram"
    movimentos: [{
        entrada: { x: Number, y: Number },
        saida: { x: Number, y: Number },
        tipoResultado: {
            type: String,
            enum: ['absorcao', 'reflexao', 'deflexao', 'passagem', 'saida']
        },
        timestamp: { type: Date, default: Date.now }
    }],
    vencedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pontuacao: {
        type: Number,
        default: 0
    },
    // Requisito: Gravação (Vídeo) gerenciado pelo MongoDB
    videoUrl: {
        type: String // URL para o arquivo .webm gerado pelo FFMPEG
    },
    status: {
        type: String,
        enum: ['aguardando', 'em_andamento', 'finalizada'],
        default: 'aguardando'
    },
    dataInicio: {
        type: Date,
        default: Date.now
    },
    dataFim: Date
});

module.exports = mongoose.model('Partida', PartidaSchema);