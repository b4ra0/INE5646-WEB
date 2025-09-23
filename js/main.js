// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('game-board');
    const statusElement = document.getElementById('status-message');
    const newGameBtn = document.getElementById('new-game-btn');
    
    const game = new BlackBoxGame(8);

    function renderBoard() {
        boardElement.innerHTML = ''; // Limpa o tabuleiro antes de desenhar
        boardElement.style.gridTemplateColumns = `repeat(${game.boardSize}, 40px)`;
        boardElement.style.gridTemplateRows = `repeat(${game.boardSize}, 40px)`;

        for (let row = 0; row < game.boardSize; row++) {
            for (let col = 0; col < game.boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Estiliza as células das bordas e cantos
                const isEdge = row === 0 || row === game.boardSize - 1 || col === 0 || col === game.boardSize - 1;
                const isCorner = (row === 0 || row === game.boardSize - 1) && (col === 0 || col === game.boardSize - 1);

                if (isCorner) {
                    cell.classList.add('corner-cell');
                } else if (isEdge) {
                    cell.classList.add('edge-cell');
                    // Adiciona o evento de clique para atirar o raio
                    cell.addEventListener('click', handleRayShot);
                } else {
                    cell.classList.add('inner-cell');
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    function handleRayShot(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        const result = game.shootRay(row, col);

        // Atualiza a interface com o resultado
        statusElement.textContent = `Raio atirado de (${row}, ${col}). Resultado: ${result.result}`;
        
        // Mostra a entrada e saída do raio
        event.target.textContent = 'IN';
        if (result.result === 'exit') {
            const exitCell = document.querySelector(`[data-row='${result.exitRow}'][data-col='${result.exitCol}']`);
            if (exitCell) exitCell.textContent = 'OUT';
        }
    }

    function startNewGame() {
        game.init(4); // Começa um novo jogo com 4 átomos
        renderBoard();
        statusElement.textContent = 'Novo jogo iniciado! Atire um raio.';
    }

    newGameBtn.addEventListener('click', startNewGame);

    // Inicia o primeiro jogo
    startNewGame();
});