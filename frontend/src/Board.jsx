import React, { useState, useEffect } from 'react';
import api from './api';

const BOARD_SIZE = 10; // 8x8 interno + 2 bordas

export default function Board({ partidaId }) {
    const [feedback, setFeedback] = useState({}); // Guarda as cores/textos do tabuleiro

    // Reseta o tabuleiro se mudar o ID da partida
    useEffect(() => {
        setFeedback({});
    }, [partidaId]);

    const handleShot = async (row, col) => {
        if (!partidaId) {
            alert("Clique em 'Iniciar Nova Partida' primeiro!");
            return;
        }

        // Traduz clique visual (0-9) para lógica do jogo (0-7) e direção
        let direcao = '';
        let entradaX = -1;
        let entradaY = -1;

        if (row === 0) { direcao = 'TOP'; entradaX = col - 1; entradaY = 0; }
        else if (row === 9) { direcao = 'BOTTOM'; entradaX = col - 1; entradaY = 7; }
        else if (col === 0) { direcao = 'LEFT'; entradaX = 0; entradaY = row - 1; }
        else if (col === 9) { direcao = 'RIGHT'; entradaX = 7; entradaY = row - 1; }
        else return; // Clique inválido

        // Ignora cantos
        if ((row === 0 || row === 9) && (col === 0 || col === 9)) return;

        try {
            // CHAMA O BACKEND!
            const response = await api.post(`/partidas/${partidaId}/jogar`, {
                entrada: { x: entradaX, y: entradaY, direcao }
            });

            const { resultado, detalhes } = response.data;
            const keyEntrada = `${row}-${col}`;

            console.log("Resultado do Backend:", resultado);

            // Lógica de visualização do resultado
            let novoFeedback = { ...feedback };

            if (resultado === 'absorcao') {
                // Raio sumiu (Hit) -> Marcamos 'H' (Hit) ou cor preta
                novoFeedback[keyEntrada] = 'H';
            }
            else if (resultado === 'reflexao') {
                // Raio voltou pro mesmo lugar -> 'R' (Return)
                novoFeedback[keyEntrada] = 'R';
            }
            else if (resultado === 'saida') {
                // O raio saiu em outro lugar! Precisamos marcar a entrada e a saída.
                // Precisamos converter a coordenada de saída (0-7) de volta para o visual (0-9)
                // Isso é meio chatinho matematicamente, mas segue a lógica inversa:

                const saidaX = detalhes.saida.x;
                const saidaY = detalhes.saida.y;
                let saidaVisualRow, saidaVisualCol;

                // Descobre onde ele saiu no visual
                if (saidaY < 0) { saidaVisualRow = 0; saidaVisualCol = saidaX + 1; } // Saiu por cima
                else if (saidaY > 7) { saidaVisualRow = 9; saidaVisualCol = saidaX + 1; } // Saiu por baixo
                else if (saidaX < 0) { saidaVisualRow = saidaY + 1; saidaVisualCol = 0; } // Saiu pela esq
                else if (saidaX > 7) { saidaVisualRow = saidaY + 1; saidaVisualCol = 9; } // Saiu pela dir

                // Atribui um número para o par Entrada-Saída (ex: 1, 2, 3...)
                const numPar = Object.keys(feedback).length + 1;
                novoFeedback[keyEntrada] = numPar;
                novoFeedback[`${saidaVisualRow}-${saidaVisualCol}`] = numPar;
            }

            setFeedback(novoFeedback);

        } catch (error) {
            console.error("Erro na jogada:", error);
            alert("Erro ao processar jogada.");
        }
    };

    const renderGrid = () => {
        let cells = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const isRim = r === 0 || r === 9 || c === 0 || c === 9;
                const isCorner = isRim && (r === 0 || r === 9) && (c === 0 || c === 9);
                const key = `${r}-${c}`;
                const valorCelula = feedback[key];

                // Define cores baseadas no resultado
                let style = {};
                if (valorCelula === 'H') style = { backgroundColor: 'red', color: 'white' }; // Hit (Absorção)
                else if (valorCelula === 'R') style = { backgroundColor: 'yellow', color: 'black' }; // Reflexão
                else if (typeof valorCelula === 'number') style = { backgroundColor: '#4caf50', color: 'white' }; // Saída normal

                cells.push(
                    <div
                        key={key}
                        className={`cell ${isRim ? 'rim' : ''} ${isCorner ? 'corner' : ''}`}
                        onClick={() => isRim && !isCorner ? handleShot(r, c) : null}
                        style={style}
                    >
                        {valorCelula || (isRim && !isCorner ? '•' : '')}
                    </div>
                );
            }
        }
        return cells;
    };

    return (
        <div className="board-wrapper">
            <div className="board-grid">
                {renderGrid()}
            </div>
        </div>
    );
}