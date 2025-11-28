const Partida = require('../models/Partida');
const { verificarRaio } = require('../utils/gameLogic');

module.exports = {
    // Iniciar uma nova partida (Setup)
    async store(req, res) {
        const { jogadorId, modoJogo, atomos } = req.body;

        // Aqui criamos a partida com os átomos ESCONDIDOS
        // "Um dos jogadores escolhe secretamente a posição de átomos" [cite: 2]
        const partida = await Partida.create({
            modoJogo,
            jogadores: [{ usuario: jogadorId, funcao: 'escondedor' }],
            posicaoAtomos: atomos, // Array de {x, y}
            status: 'em_andamento'
        });

        return res.json(partida);
    },

    // Realizar uma jogada (Disparar Raio)
    async jogar(req, res) {
        const { id } = req.params; // ID da partida
        const { entrada } = req.body; // { x, y, direcao }

        const partida = await Partida.findById(id);

        if (!partida) return res.status(404).json({ error: 'Partida não encontrada' });

        // CALCULAR A FÍSICA DO RAIO
        // "O outro deve atirar raios... para tentar descobrir a posição" [cite: 3]
        const resultado = verificarRaio(entrada, partida.posicaoAtomos);

        // Salvar o movimento no histórico da partida
        partida.movimentos.push({
            entrada: { x: entrada.x, y: entrada.y },
            saida: resultado.saida || null,
            tipoResultado: resultado.tipo // absorcao, reflexao, etc.
        });

        // Atualizar pontuação (Exemplo: +1 por raio gasto)
        partida.pontuacao += 1;

        await partida.save();

        // Retornar o resultado para o Front-end desenhar
        return res.json({
            resultado: resultado.tipo,
            detalhes: resultado
        });
    }
};