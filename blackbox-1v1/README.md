# Black Box — Vite (arquitetura refatorada)

## Rodar
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Estrutura
- `src/game/` — regras do jogo (constantes, ray tracing, utilitários do tabuleiro)
- `src/hooks/` — `useGame` encapsula estado e regras da partida
- `src/components/` — UI desacoplada (Board, Cell, EdgeButton, History, Stats)
- `src/App.jsx` — composição da tela

Pronto para evoluir para TypeScript, testes e novos recursos.
