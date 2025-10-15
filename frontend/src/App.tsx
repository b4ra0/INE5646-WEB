// src/App.tsx
import { useState, useMemo } from 'react';
import { BlackBoxGame } from './game/game';
import { Board } from './components/Board';

type GamePhase = 'PLACEMENT' | 'SHOOTING';

function App() {
  const game = useMemo(() => new BlackBoxGame(), []);
  const [updater, setUpdater] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('PLACEMENT');

  const forceUpdate = () => setUpdater(prev => prev + 1);

  function handleCellClick(row: number, col: number) {
    if (gamePhase === 'PLACEMENT') {
      // No modo de posicionamento, o clique adiciona/remove átomos
      const isCell = row > 0 && row < game.board.length - 1 && col > 0 && col < game.board.length - 1;
      if (isCell) {
        game.toggleAtom(row, col);
        forceUpdate();
      }
    } else {
      // SHOOTING
      const isEdge = row === 0 || row === game.board.length - 1 || col === 0 || col === game.board.length - 1;
      if (isEdge) {
        game.shootRay(row, col);
        forceUpdate();
      }
    }

    //TODO: ADICIONAR FASES ADICIONAIS
  }

  function handleStartShooting() {
    setGamePhase('SHOOTING');
    game.rayHistory = []; 
    forceUpdate();
  }
  
  function handleReset() {
    game.resetBoard();
    setGamePhase('PLACEMENT');
    forceUpdate();
  }

  const lastShot = game.rayHistory[game.rayHistory.length - 1];

  return (
    <div className="game-container">
      <h1>Black Box - Modo Solitário</h1>
      <p>
        <strong>Modo Atual:</strong> {gamePhase === 'PLACEMENT' ? 'Posicionando Átomos' : 'Disparando Raios'}
      </p>
      <Board 
        boardState={game.board}
        rayHistory={game.rayHistory}
        onCellClick={handleCellClick}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {gamePhase === 'PLACEMENT' && (
          <button onClick={handleStartShooting}>Iniciar Disparos</button>
        )}
        {gamePhase === 'SHOOTING' && (
          <button onClick={() => setGamePhase('PLACEMENT')}>Voltar a Posicionar</button>
        )}
        <button onClick={handleReset}>Resetar Tabuleiro</button>
      </div>
      <div>
        <strong>Última Jogada:</strong>
        {lastShot ? ` Entrada em (${lastShot.entry.row}, ${lastShot.entry.col}) resultou em ${lastShot.result}` : 'Nenhuma'}
      </div>
    </div>
  );
}

export default App;