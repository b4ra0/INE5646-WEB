// client/src/components/GameBoard.jsx
import React, { useMemo, useState } from 'react';
import { api } from '../api';

const SIZE = 8;
const N_ATOMS = 5;
const range = (n) => Array.from({ length: n }, (_, i) => i);

const DIRS = {
  UP:    { dr: -1, dc: 0, k: 'U' },
  DOWN:  { dr: 1,  dc: 0, k: 'D' },
  LEFT:  { dr: 0,  dc: -1, k: 'L' },
  RIGHT: { dr: 0,  dc: 1,  k: 'R' },
};

const inside = (r,c) => r>=0 && r<SIZE && c>=0 && c<SIZE;
const hasAtom = (atoms,r,c) => atoms.some(a=>a.r===r && a.c===c);

function randomAtoms(count){
  const cells=[];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) cells.push({r,c});
  const out=[];
  while(out.length<count && cells.length){
    const i = Math.floor(Math.random()*cells.length);
    out.push(cells[i]);
    cells.splice(i,1);
  }
  return out;
}

function entryFromEdgeIndex(idx){
  const per=SIZE;
  if(idx<per) return { r:-1, c:idx, dir:DIRS.DOWN };
  if(idx<per*2) return { r:idx-per, c:SIZE, dir:DIRS.LEFT };
  if(idx<per*3) return { r:SIZE, c:per-1-(idx-per*2), dir:DIRS.UP };
  return { r:per-1-(idx-per*3), c:-1, dir:DIRS.RIGHT };
}
function edgeIndexFromExit(r,c){
  if(r===-1 && c>=0 && c<SIZE) return c;
  if(c===SIZE && r>=0 && r<SIZE) return SIZE+r;
  if(r===SIZE && c>=0 && c<SIZE) return SIZE*2 + (SIZE-1-c);
  if(c===-1 && r>=0 && r<SIZE) return SIZE*3 + (SIZE-1-r);
  return null;
}

function shootRay(atoms, entryIdx){
  let {r,c,dir} = entryFromEdgeIndex(entryIdx);
  let nr=r+dir.dr, nc=c+dir.dc;
  if(inside(nr,nc) && hasAtom(atoms,nr,nc)) return { type:'HIT' };
  const aheadLeft = inside(nr,nc-1) && hasAtom(atoms,nr,nc-1);
  const aheadRight= inside(nr,nc+1) && hasAtom(atoms,nr,nc+1);
  if(aheadLeft && aheadRight) return { type:'REFLECTION' };

  let cr=r, cc=c, d=dir;
  for(let steps=0; steps<1000; steps++){
    const tr=cr+d.dr, tc=cc+d.dc;
    if(!inside(tr,tc)) return { type:'EXIT', exit: edgeIndexFromExit(tr,tc) };
    if(hasAtom(atoms,tr,tc)) return { type:'HIT' };

    const ld=inside(tr,tc-1) && hasAtom(atoms,tr,tc-1);
    const rd=inside(tr,tc+1) && hasAtom(atoms,tr,tc+1);
    if(ld && rd) return { type:'REFLECTION' };
    if(ld || rd){
      if(ld && !rd){
        if(d.k==='U') d=DIRS.RIGHT;
        else if(d.k==='D') d=DIRS.LEFT;
        else if(d.k==='L') d=DIRS.UP;
        else d=DIRS.DOWN;
      }else if(rd && !ld){
        if(d.k==='U') d=DIRS.LEFT;
        else if(d.k==='D') d=DIRS.RIGHT;
        else if(d.k==='L') d=DIRS.DOWN;
        else d=DIRS.UP;
      }
      continue;
    }
    cr=tr; cc=tc;
  }
  return { type:'EXIT', exit:null };
}

function useGame(){
  const [mode,setMode] = useState('bot');
  const [atoms,setAtoms] = useState(()=>randomAtoms(N_ATOMS));
  const [flags,setFlags] = useState(new Set());
  const [shots,setShots] = useState([]);
  const [revealed,setRevealed] = useState(false);
  const [locked,setLocked] = useState(false);

  // PvP
  const [pvpPhase,setPvpPhase] = useState('setup'); // 'setup' | 'play'
  const [pvpRound,setPvpRound] = useState(1); // 1 or 2
  const [setter,setSetter] = useState('A');
  const [shooter,setShooter] = useState('B');
  const [pvpScores,setPvpScores] = useState({A:0,B:0});
  const [roundFinished,setRoundFinished] = useState(false);
  const [matchOver,setMatchOver] = useState(false);

  function resetCommon(){
    setFlags(new Set());
    setShots([]);
    setRevealed(false);
    setLocked(false);
    setRoundFinished(false);
  }

  function resetForMode(next){
    setMode(next);
    if(next==='bot'){
      setAtoms(randomAtoms(N_ATOMS));
    } else{
      setAtoms([]);
      setPvpPhase('setup');
      setPvpRound(1);
      setSetter('A');
      setShooter('B');
      setPvpScores({A:0,B:0});
      setMatchOver(false);
    }
    resetCommon();
  }

  function toggleFlag(r,c){
    if(locked) return;
    if(mode==='pvp' && pvpPhase!=='play') return;
    const key=r*SIZE+c;
    setFlags(prev=>{
      const n=new Set(prev);
      if(n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  }

  function toggleAtomSetup(r,c){
    if(mode!=='pvp' || pvpPhase!=='setup') return;
    setAtoms(prev=>{
      const exists = prev.some(a=>a.r===r&&a.c===c);
      if(exists) return prev.filter(a=>!(a.r===r&&a.c===c));
      if(prev.length>=N_ATOMS) return prev;
      return [...prev,{r,c}];
    });
  }

  function startPvpRound(){
    if(mode!=='pvp') return;
    if(atoms.length!==N_ATOMS) return;
    setPvpPhase('play');
  }

  function fire(edgeIdx){
    if(locked) return;
    if(mode==='pvp' && pvpPhase!=='play') return;
    const res = shootRay(atoms, edgeIdx);
    setShots(s=>[...s, {entry:edgeIdx, result:res, id:s.length+1}]);
  }

  function reveal(){ setRevealed(true); }

  const attemptScore = useMemo(()=>{
    const rays = shots.length;
    let wrong = 0;
    flags.forEach(key=>{
      const r=Math.floor(key/SIZE), c=key%SIZE;
      if(!hasAtom(atoms,r,c)) wrong+=1;
    });
    return rays + wrong*5;
  }, [shots,flags,atoms]);

  function checkGuesses(){
    setLocked(true);
    if(mode==='pvp' && pvpPhase==='play' && !roundFinished){
      setPvpScores(sc=>({...sc, [shooter]: sc[shooter] + attemptScore}));
      setRoundFinished(true);
    }
  }

  function nextRoundSwap(){
    if(mode!=='pvp' || !roundFinished || pvpRound!==1) return;
    setPvpRound(2);
    setSetter('B');
    setShooter('A');
    setAtoms([]);
    setPvpPhase('setup');
    resetCommon();
  }

  function endMatchNewPvp(){
    if(mode!=='pvp') return;
    setMatchOver(true);
  }

  function newGame(){
    if(mode==='bot'){
      setAtoms(randomAtoms(N_ATOMS));
      resetCommon();
    } else {
      resetForMode('pvp');
    }
  }

  return {
    mode,setMode,
    atoms,flags,shots,revealed,locked,
    attemptScore,
    resetForMode,toggleFlag,fire,reveal,checkGuesses,newGame,
    pvpPhase,pvpRound,setter,shooter,pvpScores,roundFinished,matchOver,
    toggleAtomSetup,startPvpRound,nextRoundSwap,endMatchNewPvp
  };
}

function Cell({ r,c, onClick, flagged, showAtom, highlight }){
  const cls = 'cell' + (flagged?' flag':'') + (showAtom?' atom':'') + (highlight?' hl':'');
  return (
    <button
      className={cls}
      onClick={onClick}
      title={`(${r+1},${c+1})`}
    >
      {flagged ? '⚑' : showAtom ? '●' : ''}
    </button>
  );
}

function EdgeButton({ idx, onFire, label, disabled }){
  return (
    <button
      className="edgeBtn"
      onClick={()=>onFire(idx)}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function ShotBadge({ s }){
  let text='';
  if(s.result.type==='HIT') text=`HIT ${s.entry}`;
  else if(s.result.type==='REFLECTION') text=`REFLECT ${s.entry}`;
  else if(s.result.type==='EXIT') text=`EXIT ${s.entry}->${s.result.exit}`;
  return <span className="badge">{text}</span>;
}

// agora recebe onGameSaved pra avisar o App do gameId salvo
export default function GameBoard({ currentUser, onGameSaved }) {
  const g = useGame();

  // handler que trava a tentativa E salva a partida
  async function handleCheckAndSave() {
    // se já está travado, ignora clique duplo
    if (g.locked) return;

    // 1) trava a tentativa e atualiza placar PvP
    g.checkGuesses();

    // 2) se não há usuário logado, não tenta salvar no backend
    if (!currentUser) return;

    try {
      const res = await api.saveGame({
        mode: g.mode === 'pvp' ? 'pvp' : 'bot',
        score: g.attemptScore,
        opponentNickname:
          g.mode === 'pvp'
            ? (g.shooter === 'A' ? 'Jogador B' : 'Jogador A')
            : undefined,
      });

      const gameId = res?.gameId || res?.game?._id;
      if (gameId && typeof onGameSaved === 'function') {
        onGameSaved(gameId);
      }
    } catch (err) {
      console.error('Erro ao salvar partida', err);
    }
  }

  const showAtoms = g.revealed || (g.mode==='pvp' && g.pvpPhase==='setup');
  const edgesDisabled = g.locked;


  const winner = g.matchOver
    ? (g.pvpScores.A===g.pvpScores.B
        ? 'Empate'
        : (g.pvpScores.A<g.pvpScores.B?'Jogador A':'Jogador B'))
    : null;

  const sideOf = (edge)=>{
    if(edge==null) return '?';
    if(edge<SIZE) return 'Top';
    if(edge<SIZE*2) return 'Right';
    if(edge<SIZE*3) return 'Bottom';
    return 'Left';
  };

  const historyStats = useMemo(()=>{
    const bySide={Top:0,Right:0,Bottom:0,Left:0};
    const results={HIT:0,REFLECTION:0,EXIT:0};
    const exitsBySide={Top:0,Right:0,Bottom:0,Left:0};
    g.shots.forEach(s=>{
      bySide[sideOf(s.entry)]++;
      results[s.result.type]=(results[s.result.type]||0)+1;
      if(s.result.type==='EXIT') exitsBySide[sideOf(s.result.exit)]++;
    });
    return { bySide, results, exitsBySide };
  }, [g.shots]);

  // não usamos mais "container" aqui pra não forçar min-height
  return (
    <div style={{ width: '100%' }}>
      <h1>Black Box — Bot &amp; 1v1</h1>
      <p className="small">
        Dispare raios pelas bordas para deduzir onde estão os {N_ATOMS} átomos
        na grade {SIZE}×{SIZE}. Clique nas células internas para marcar
        palpites. Pontuação: 1 por raio + 5 por palpite errado.
      </p>

      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <button
          className={'btn '+(g.mode==='bot'?'primary':'gray')}
          onClick={()=>g.resetForMode('bot')}
        >
          vs Bot
        </button>
        <button
          className={'btn '+(g.mode==='pvp'?'primary':'gray')}
          onClick={()=>g.resetForMode('pvp')}
        >
          1v1 (pass-and-play)
        </button>
      </div>

      {g.mode==='pvp' && (
        <div className="card section">
          {!g.matchOver ? (
            <>
              <div>
                <b>Rodada {g.pvpRound}</b> — Setter: <b>{g.setter}</b> · Shooter:{' '}
                <b>{g.shooter}</b>
              </div>
              {g.pvpPhase==='setup'
                ? (
                  <div>
                    Jogador {g.setter}: coloque exatamente {N_ATOMS} átomos
                    clicando nas casas (aparecem como ●). Depois clique em{' '}
                    <b>Iniciar rodada</b> e entregue ao Jogador {g.shooter}.
                  </div>
                ) : (
                  <div>
                    Jogador {g.shooter}: dispare raios nas bordas e marque seus
                    palpites (⚑). Ao terminar, clique em{' '}
                    <b>Check guesses &amp; lock</b>.
                  </div>
                )
              }
              <div className="small">
                Placar — A: <b>{g.pvpScores.A}</b> · B:{' '}
                <b>{g.pvpScores.B}</b>
              </div>
            </>
          ) : (
            <div>
              <b>Partida encerrada — Vencedor: {winner}</b>
              <div className="small">
                Placar final — A: <b>{g.pvpScores.A}</b> · B:{' '}
                <b>{g.pvpScores.B}</b>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board with edges */}
      <div
        className="row"
        style={{
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        {/* Top edge */}
        <div className="edgeRow" style={{gap:6}}>
          {range(SIZE).map(c=>(
            <EdgeButton
              key={c}
              idx={c}
              onFire={g.fire}
              label={`T${c+1}`}
              disabled={edgesDisabled}
            />
          ))}
        </div>

        <div className="row" style={{gap:8}}>
          {/* Left edge */}
          <div className="edgeCol" style={{gap:6}}>
            {range(SIZE).map(r=>(
              <EdgeButton
                key={r}
                idx={SIZE*3 + (SIZE-1-r)}
                onFire={g.fire}
                label={`L${r+1}`}
                disabled={edgesDisabled}
              />
            ))}
          </div>

          {/* Grid */}
          <div className="grid">
            {range(SIZE).flatMap(r =>
              range(SIZE).map(c => {
                const key = r*SIZE+c;
                const isAtom = hasAtom(g.atoms, r, c);
                const flagged = g.flags.has(key);
                const canPlace = g.mode==='pvp' && g.pvpPhase==='setup';
                return (
                  <Cell
                    key={key}
                    r={r}
                    c={c}
                    flagged={flagged}
                    showAtom={showAtoms && isAtom}
                    onClick={() =>
                      canPlace ? g.toggleAtomSetup(r,c) : g.toggleFlag(r,c)
                    }
                  />
                );
              })
            )}
          </div>

          {/* Right edge */}
          <div className="edgeCol" style={{gap:6}}>
            {range(SIZE).map(r=>(
              <EdgeButton
                key={r}
                idx={SIZE + r}
                onFire={g.fire}
                label={`R${r+1}`}
                disabled={edgesDisabled}
              />
            ))}
          </div>
        </div>

        {/* Bottom edge */}
        <div className="edgeRow" style={{gap:6}}>
          {range(SIZE).map(c=>(
            <EdgeButton
              key={c}
              idx={SIZE*2 + (SIZE-1-c)}
              onFire={g.fire}
              label={`B${c+1}`}
              disabled={edgesDisabled}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div
        className="row"
        style={{
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {g.mode==='pvp' && g.pvpPhase==='setup' && !g.matchOver && (
          <button
            className="btn purple"
            onClick={g.startPvpRound}
            disabled={g.atoms.length!==N_ATOMS}
          >
            Iniciar rodada (entregar ao Shooter)
          </button>
        )}
        <button
          className="btn primary"
          onClick={handleCheckAndSave}
          disabled={g.locked}
        >
          Check guesses &amp; lock
        </button>
        <button
          className="btn green"
          onClick={g.reveal}
        >
          Reveal atoms
        </button>
        <button
          className="btn dark"
          onClick={g.newGame}
        >
          {g.mode==='bot' ? 'New game' : 'New match (1v1)'}
        </button>
        <span className="badge">
          Attempt score: {g.attemptScore}
        </span>
      </div>

      {/* Round flow controls */}
      {g.mode==='pvp' && !g.matchOver && g.roundFinished && (
        <div className="row" style={{ marginBottom: 16 }}>
          {g.pvpRound===1 ? (
            <button
              className="btn orange"
              onClick={g.nextRoundSwap}
            >
              Próxima rodada (trocar papéis)
            </button>
          ) : (
            <button
              className="btn pink"
              onClick={g.endMatchNewPvp}
            >
              Encerrar partida
            </button>
          )}
        </div>
      )}

      {/* History + stats */}
      <div className="section" style={{marginTop:8}}>
        <div className="row" style={{alignItems:'flex-start'}}>
          <div style={{flex:1, minWidth:300}}>
            <h3>Ray history</h3>
            <div className="row">
              {g.shots.map(s=>(
                <ShotBadge key={s.id} s={s} />
              ))}
              {g.shots.length===0 && (
                <span className="small">
                  Nenhum raio ainda. Clique em uma borda (T/L/R/B).
                </span>
              )}
            </div>
            {g.shots.length>0 && (
              <div style={{marginTop:8, overflow:'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Entrada</th>
                      <th>Lado ent.</th>
                      <th>Resultado</th>
                      <th>Saída</th>
                      <th>Lado saída</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.shots.map((s,i)=>{
                      const sideOfLocal = (edge)=>{
                        if(edge==null) return '?';
                        if(edge<SIZE) return 'Top';
                        if(edge<SIZE*2) return 'Right';
                        if(edge<SIZE*3) return 'Bottom';
                        return 'Left';
                      };
                      return (
                        <tr key={s.id}>
                          <td>{i+1}</td>
                          <td>{s.entry}</td>
                          <td>{sideOfLocal(s.entry)}</td>
                          <td>{s.result.type}</td>
                          <td>{s.result.type==='EXIT'?s.result.exit:'-'}</td>
                          <td>{s.result.type==='EXIT'?sideOfLocal(s.result.exit):'-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{flex:1, minWidth:300}}>
            <h3>Histórico / Estatísticas</h3>
            <div className="stats">
              <div className="card">
                <div><b>Entradas por lado</b></div>
                <ul>
                  <li>Top: <b>{historyStats.bySide.Top}</b></li>
                  <li>Right: <b>{historyStats.bySide.Right}</b></li>
                  <li>Bottom: <b>{historyStats.bySide.Bottom}</b></li>
                  <li>Left: <b>{historyStats.bySide.Left}</b></li>
                </ul>
              </div>
              <div className="card">
                <div><b>Resultados</b></div>
                <ul>
                  <li>HIT: <b>{historyStats.results.HIT}</b></li>
                  <li>REFLECTION: <b>{historyStats.results.REFLECTION}</b></li>
                  <li>EXIT: <b>{historyStats.results.EXIT}</b></li>
                </ul>
              </div>
              <div className="card" style={{gridColumn:'1 / span 2'}}>
                <div><b>Saídas por lado</b></div>
                <ul style={{columns:2}}>
                  <li>Top: <b>{historyStats.exitsBySide.Top}</b></li>
                  <li>Right: <b>{historyStats.exitsBySide.Right}</b></li>
                  <li>Bottom: <b>{historyStats.exitsBySide.Bottom}</b></li>
                  <li>Left: <b>{historyStats.exitsBySide.Left}</b></li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
