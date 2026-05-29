# chess-bot-no-stockfish

🔗 [Play here](https://chess-bot-no-stockfish.vercel.app/)

A fully playable chess game built in TypeScript where you play as white against a bot playing as black. The project started as a way to learn TypeScript/JavaScript and ended up being a full chess engine with a bot using classic AI search algorithm and position evaluation heuristics.

## Technologies Used

- TypeScript
- Vite

## About Bot

The bot uses **Negamax with Alpha-Beta pruning** — a variant of Minimax that simplifies implementation by negating the score at each level. Alpha-Beta pruning cuts branches that cannot influence the final decision, reducing the number of nodes evaluated without affecting the result.

Move ordering is done with **MVV-LVA** (Most Valuable Victim, Least Valuable Attacker) — captures are evaluated first, prioritizing taking the most valuable piece with the cheapest one. This improves Alpha-Beta efficiency by ensuring the best moves are searched first.

Due to very high branching factor nature of chess and only MVV-LVA as move ordering heuristic current version of this Bot is running only to depth 3 for reasonable search time, which means Bot sees only 3 moves ahead.

Position is evaluated using two scoring functions:

- **Material count** — each piece has a fixed value (pawn=100, knight=320, bishop=330, rook=500, queen=900)
- **Piece-Square Tables** — bonus/penalty based on the piece's position on the board, encouraging control of the center, good piece development, and king safety

## Resources Used As Guidance

- [General position evaluation.](https://www.chessprogramming.org/Evaluation)
- [Value of chess figures.](https://www.chessprogramming.org/Point_Value)
- [Alpha-Beta details and Negamax framework.](https://www.chessprogramming.org/Alpha-Beta)
- [Bonus for good piece position.](https://www.chessprogramming.org/Simplified_Evaluation_Function#Piece-Square_Tables)
- [MVV-LVA move ordering.](https://www.chessprogramming.org/MVV-LVA)
- [More resources from best website about chess programming.](https://www.chessprogramming.org/Main_Page)

## Chess Features Implemented

- ✅ All legal moves
- ✅ Castling
- ❌ En passant
- ✅ Promotion (only to queen)
- ✅ Check detection
- ✅ Checkmate
- ✅ Stalemate
- ❌ 50 move rule
- ❌ 3 repetitions rule

## Future Updates Idea

### Evaluation:

- King safety evaluation.
- Pawn structure evaluation (doubled, isolated pawns).
- Bishop pair bonus

### Algorithm Performance:

- Iterative Deepening version of Alpha-Beta.
- More/Better heuristics for better pruning.

## Project Structure

```
src/
├── bot
│   ├── consts
│   │   ├── piece-square-tables.ts
│   │   └── piece-value-table.ts
│   ├── eval-functions
│   │   ├── get-piece-value-score.ts
│   │   └── get-pst-score.ts
│   ├── evaluator.ts
│   ├── models
│   │   ├── bot-base-class.ts
│   │   ├── negamax-alpha-beta-bot.ts
│   │   └── random-bot.ts
│   ├── move-orderer.ts
│   └── order-functions
│       └── mvv-lva.ts
├── main.ts
├── model
│   ├── board.ts
│   ├── game.ts
│   ├── move.ts
│   └── piece.ts
└── ui
    ├── renderer.ts
    └── style.css
```

---

## Run Locally

```bash
git clone https://github.com/yourusername/chess-bot-no-stockfish
cd chess-bot-no-stockfish
npm install
npm run dev
```
