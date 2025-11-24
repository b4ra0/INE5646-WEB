const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true, // Não pode haver dois usuários com o mesmo nome
        trim: true
    },
    senha: {
        type: String,
        required: true
        // Nota: Vamos criptografar isso depois no Controller
    },
    idade: {
        type: Number,
        required: true
    },
    // Requisito: Local (Cidade, Estado, País)
    local: {
        cidade: String,
        estado: String,
        pais: String
    },
    // Requisito: Avatar (URL, disco, webcam)
    avatar: {
        type: String, // Vamos salvar o caminho da imagem ou URL
        default: 'default-avatar.png'
    },
    isAdmin: {
        type: Boolean,
        default: false // Para a seção "3. Administrador"
    },
    // Histórico simples para facilitar consultas de ranking e perfil
    partidasJogadas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partida'
    }],
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);