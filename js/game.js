// js/game.js

class BlackBoxGame {
    constructor(size = 8) {
        this.size = size; // Tamanho do tabuleiro interno (8x8)
        this.boardSize = size + 2; // Tamanho total com as bordas (10x10)
        this.board = []; // Matriz que representa o tabuleiro
        this.atoms = []; // Array para guardar as coordenadas dos átomos
    }

    // Inicializa o jogo e posiciona os átomos do bot
    init(numAtoms = 4) {
        this.board = Array(this.boardSize).fill(0).map(() => Array(this.boardSize).fill(0));
        this.atoms = [];
        this._placeAtomsRandomly(numAtoms);
        console.log("Átomos escondidos em:", this.atoms); // Para depuração
    }

    // Método privado para posicionar átomos aleatoriamente
    _placeAtomsRandomly(numAtoms) {
        let placedAtoms = 0;
        while (placedAtoms < numAtoms) {
            // Gera coordenadas dentro do tabuleiro interno (de 1 a 8)
            const row = Math.floor(Math.random() * this.size) + 1;
            const col = Math.floor(Math.random() * this.size) + 1;

            // Verifica se já não existe um átomo no local
            if (this.board[row][col] === 0) {
                this.board[row][col] = 1; // 1 representa um átomo
                this.atoms.push({ row, col });
                placedAtoms++;
            }
        }
    }

    // **A LÓGICA PRINCIPAL VAI AQUI**
    // Por enquanto, uma função de exemplo
    shootRay(entryRow, entryCol) {
        console.log(`Raio disparado de: (${entryRow}, ${entryCol})`);

        // LÓGICA TEMPORÁRIA:
        // Se o raio entrar na linha 0, ele sai na linha 9 (e vice-versa)
        if (entryRow === 0) return { result: 'exit', exitRow: this.boardSize - 1, exitCol: entryCol };
        if (entryRow === this.boardSize - 1) return { result: 'exit', exitRow: 0, exitCol: entryCol };
        if (entryCol === 0) return { result: 'exit', exitRow: entryRow, exitCol: this.boardSize - 1 };
        if (entryCol === this.boardSize - 1) return { result: 'exit', exitRow: entryRow, exitCol: 0 };
        
        // Se algo der errado (não deveria acontecer), retorna um erro.
        return { result: 'error' };
    }
}