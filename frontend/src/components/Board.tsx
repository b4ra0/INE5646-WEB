import { RayResult } from '../game/game';

interface BoardProps {
  boardState: number[][];
  rayHistory: RayResult[];
  onCellClick: (row: number, col: number) => void; // Prop genérica para qualquer clique
}

export function Board({ boardState, rayHistory, onCellClick }: BoardProps) {
  const boardSize = boardState.length;

  const getCellClassName = (row: number, col: number): string => {
    // ... (mesma lógica anterior)
    const isEntry = rayHistory.find(r => r.entry.row === row && r.entry.col === col);
    const isExit = rayHistory.find(r => r.exit?.row === row && r.exit?.col === col);
    if(isEntry && isEntry.result === 'HIT') return 'ray-hit';
    if(isEntry) return 'ray-entry';
    if(isExit) return 'ray-exit';
    return '';
  };

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${boardSize}, 40px)` }}>
      {boardState.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => { // Agora usamos o valor da célula (0 ou 1)
          const isEdge = rowIndex === 0 || rowIndex === boardSize - 1 || colIndex === 0 || colIndex === boardSize - 1;
          const isCorner = isEdge && (rowIndex === 0 || rowIndex === boardSize - 1) && (colIndex === 0 || colIndex === boardSize - 1);
          
          let cellTypeClass = 'inner-cell';
          if (isCorner) cellTypeClass = 'corner-cell';
          else if (isEdge) cellTypeClass = 'edge-cell';

          const rayClass = getCellClassName(rowIndex, colIndex);
          const hasAtom = cellValue === 1; // Verifica se a célula tem um átomo

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cellTypeClass} ${rayClass}`}
              onClick={() => isCorner ? null : onCellClick(rowIndex, colIndex)}
            >
              {/* Renderiza o átomo se ele existir */}
              {hasAtom && <div className="atom"></div>}
            </div>
          );
        })
      )}
    </div>
  );
}