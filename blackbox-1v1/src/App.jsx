import React from 'react'
import { N_ATOMS } from './game/constants'
import useGame from './hooks/useGame'
import Board from './components/Board'
import History from './components/History'
import Stats from './components/Stats'

export default function App(){
  const g = useGame();
  const showAtoms = g.revealed || (g.mode==='pvp' && g.pvpPhase==='setup');
  const edgesDisabled = g.locked || (g.mode==='pvp' && g.pvpPhase!=='play');

  const winner = g.matchOver ? (g.pvpScores.A===g.pvpScores.B ? 'Empate' : (g.pvpScores.A<g.pvpScores.B?'Jogador A':'Jogador B')) : null;

  return (
    <div className="container">
      <h1>Black Box — Bot & 1v1</h1>
      <p className="small">Dispare raios pelas bordas para deduzir onde estão os {N_ATOMS} átomos na grade. Clique nas células internas para marcar palpites. Pontuação: 1 por raio + 5 por palpite errado.</p>

      <div className="row">
        <button className={"btn "+(g.mode==='bot'?'primary':'gray')} onClick={()=>g.resetForMode('bot')}>vs Bot</button>
        <button className={"btn "+(g.mode==='pvp'?'primary':'gray')} onClick={()=>g.resetForMode('pvp')}>1v1 (pass‑and‑play)</button>
      </div>

      {g.mode==='pvp' && (
        <div className="card section">
          {!g.matchOver ? (<>
            <div><b>Rodada {g.pvpRound}</b> — Setter: <b>{g.setter}</b> · Shooter: <b>{g.shooter}</b></div>
            {g.pvpPhase==='setup'
              ? <div>Jogador {g.setter}: coloque exatamente {N_ATOMS} átomos clicando nas casas (aparecem como ●). Depois clique em <b>Iniciar rodada</b> e entregue ao Jogador {g.shooter}.</div>
              : <div>Jogador {g.shooter}: dispare raios nas bordas e marque seus palpites (⚑). Ao terminar, clique em <b>Check guesses & lock</b>.</div>}
            <div className="small">Placar — A: <b>{g.pvpScores.A}</b> · B: <b>{g.pvpScores.B}</b></div>
          </>) : (
            <div><b>Partida encerrada — Vencedor: {winner}</b><div className="small">Placar final — A: <b>{g.pvpScores.A}</b> · B: <b>{g.pvpScores.B}</b></div></div>
          )}
        </div>
      )}

      <Board
        atoms={g.atoms}
        flags={g.flags}
        revealAtoms={showAtoms}
        canPlaceAtoms={g.mode==='pvp' && g.pvpPhase==='setup'}
        onToggleFlag={g.toggleFlag}
        onToggleAtom={g.toggleAtomSetup}
        onFire={g.fire}
        edgesDisabled={edgesDisabled}
      />

      <div className="row">
        {g.mode==='pvp' && g.pvpPhase==='setup' && !g.matchOver && (
          <button className="btn purple" onClick={g.startPvpRound} disabled={g.atoms.length!==N_ATOMS}>Iniciar rodada (entregar ao Shooter)</button>
        )}
        <button className="btn primary" onClick={g.checkGuesses} disabled={g.locked}>Check guesses & lock</button>
        <button className="btn green" onClick={g.reveal}>Reveal atoms</button>
        <button className="btn dark" onClick={g.newGame}>{g.mode==='bot'?'New game':'New match (1v1)'}</button>
        <span className="badge">Attempt score: {g.attemptScore}</span>
      </div>

      {g.mode==='pvp' && !g.matchOver && g.roundFinished && (
        <div className="row">
          {g.pvpRound===1
            ? <button className="btn orange" onClick={g.nextRoundSwap}>Próxima rodada (trocar papéis)</button>
            : <button className="btn pink" onClick={g.endMatchNewPvp}>Encerrar partida</button>}
        </div>
      )}

      <div className="section" style={{marginTop:8}}>
        <div className="row" style={{alignItems:'flex-start'}}>
          <div style={{flex:1, minWidth:300}}><History shots={g.shots} /></div>
          <div style={{flex:1, minWidth:300}}><Stats shots={g.shots} /></div>
        </div>
      </div>
    </div>
  )
}
