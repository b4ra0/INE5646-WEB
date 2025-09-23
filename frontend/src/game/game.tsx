export type RayResult = {
  result: 'HIT' | 'REFLECT' | 'EXIT';
  entry: { row: number, col: number };
  exit?: { row: number, col: number };
};

export class BlackBoxGame {
  public board: number[][];
  public atoms: { row: number; col: number }[];
  public rayHistory: RayResult[];

  private size: number;
  private boardSize: number;

  constructor(size = 8) {
    this.size = size;
    this.boardSize = size + 2;
    this.board = [];
    this.atoms = [];
    this.rayHistory = [];
    this.resetBoard();
  }

  public resetBoard(): void {
    this.board = Array(this.boardSize).fill(0).map(() => Array(this.boardSize).fill(0));
    this.atoms = [];
    this.rayHistory = [];
  }

  public toggleAtom(row: number, col: number): boolean {
    if (row <= 0 || row >= this.boardSize - 1 || col <= 0 || col >= this.boardSize - 1) {
      return false;
    }
    if (this.board[row][col] === 0) {
      this.board[row][col] = 1;
      this.atoms.push({ row, col });
    } else {
      this.board[row][col] = 0;
      this.atoms = this.atoms.filter(atom => atom.row !== row || atom.col !== col);
    }
    return true;
  }

  public shootRay(entryRow: number, entryCol: number): void {
    let currentRow = entryRow;
    let currentCol = entryCol;

    let deltaRow = 0;
    let deltaCol = 0;
    if (entryRow === 0) deltaRow = 1; // Entrou por cima, vai para baixo
    else if (entryRow === this.boardSize - 1) deltaRow = -1; // Entrou por baixo, vai para cima
    else if (entryCol === 0) deltaCol = 1; // Entrou pela esquerda, vai para a direita
    else if (entryCol === this.boardSize - 1) deltaCol = -1; // Entrou pela direita, vai para a esquerda

    // Loop de simulação (máximo de 50 passos para evitar loops infinitos)
    for (let i = 0; i < 50; i++) {
      const nextRow = currentRow + deltaRow;
      const nextCol = currentCol + deltaCol;

      // 1. VERIFICA ABSORÇÃO (Átomo bem na frente)
      if (this.isAtomAt(nextRow, nextCol)) {
        this.rayHistory.push({ result: 'HIT', entry: { row: entryRow, col: entryCol } });
        return; // Fim da trajetória
      }

      // Direita e esquerda são relativas à direção do movimento
      const [leftDeflectorRow, leftDeflectorCol] = this.getRelativeCoords(currentRow, currentCol, deltaRow, deltaCol, 'left');
      const [rightDeflectorRow, rightDeflectorCol] = this.getRelativeCoords(currentRow, currentCol, deltaRow, deltaCol, 'right');
      
      const hasLeftDeflector = this.isAtomAt(leftDeflectorRow, leftDeflectorCol);
      const hasRightDeflector = this.isAtomAt(rightDeflectorRow, rightDeflectorCol);

      if (hasLeftDeflector && hasRightDeflector) {
        this.rayHistory.push({ result: 'REFLECT', entry: { row: entryRow, col: entryCol } });
        return;
      }
      
      if (hasLeftDeflector) {
        [deltaRow, deltaCol] = this.turn(deltaRow, deltaCol, 'right');
      }
      
      if (hasRightDeflector) {
        [deltaRow, deltaCol] = this.turn(deltaRow, deltaCol, 'left');
      }

      currentRow += deltaRow;
      currentCol += deltaCol;

      // VERIFICA SE SAIU DO TABULEIRO
      if (currentRow < 0 || currentRow >= this.boardSize || currentCol < 0 || currentCol >= this.boardSize) {
        // O raio saiu por uma borda que não é a de entrada
        this.rayHistory.push({
          result: 'EXIT',
          entry: { row: entryRow, col: entryCol },
          exit: { row: currentRow - deltaRow, col: currentCol - deltaCol }
        });
        return;
      }
    }
    // Se o loop terminar (muitos passos), consideramos uma reflexão para evitar erros
    this.rayHistory.push({ result: 'REFLECT', entry: { row: entryRow, col: entryCol } });
  }

  // Verifica se há um átomo na posição dada
  private isAtomAt(row: number, col: number): boolean {
    if (row <= 0 || row >= this.boardSize - 1 || col <= 0 || col >= this.boardSize - 1) {
      return false; // Fora da área interna do tabuleiro
    } else {
      return this.board[row][col] === 1;
    }
  }
  
  // Retorna as coordenadas da diagonal esquerda ou direita relativa à direção
  private getRelativeCoords(r: number, c: number, dr: number, dc: number, side: 'left' | 'right'): [number, number] {
      if (side === 'left') {
        return [r + dr - dc, c + dc + dr];
      } else {
        return [r + dr + dc, c + dc - dr];
      }
  }

  // Gira a direção do raio 90 graus para a esquerda ou direita
  private turn(dr: number, dc: number, direction: 'left' | 'right'): [number, number] {
    if (direction === 'left') {
      return [-dc, dr];
    } else {
      return [dc, -dr];
    }
  }
}