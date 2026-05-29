import type { Game } from "../../model/game";
import type { PieceColor } from "../../model/piece";
import type { Evaluator } from "../evaluator";
import type { MoveOrderer } from "../move-orderer";
import { Bot } from "./bot-base-class";

export class NegamaxAlphaBetaBot extends Bot {
    private evaluator: Evaluator;
    private orderer: MoveOrderer;
    private bestMove: [number, number] | null;
    private MAX_DEPTH: number;

    constructor(
        game: Game,
        player: PieceColor,
        evaluator: Evaluator,
        orderer: MoveOrderer,
        MAX_DEPTH: number,
    ) {
        super(game, player);
        this.evaluator = evaluator;
        this.orderer = orderer;
        this.bestMove = null;
        this.MAX_DEPTH = MAX_DEPTH;
    }

    public chooseAction(): [number, number] {
        this.bestMove = null;

        const start = performance.now();

        this.negamaxAlphaBeta(this.game, -Infinity, Infinity, this.MAX_DEPTH);

        const elapsed = performance.now() - start;
        console.log(`Time: ${elapsed.toFixed(0)}ms`);

        if (this.bestMove === null) throw new Error("No move found");
        return this.bestMove;
    }

    private negamaxAlphaBeta(state: Game, alpha: number, beta: number, depthLeft: number): number {
        if (state.isGameOver()) return -100000 + (this.MAX_DEPTH - depthLeft);
        if (state.isStalemate()) return 0;
        if (depthLeft === 0) return this.evaluator.evaluatePosition(state);

        let bestValue = -Infinity;
        for (const [src, dst] of this.orderer.order(this.allPossibleMoves(state), state)) {
            const nextState = state.clone();
            nextState.makeMove(src, dst);
            const score = -this.negamaxAlphaBeta(nextState, -beta, -alpha, depthLeft - 1);

            if (score > bestValue) {
                bestValue = score;
                if (depthLeft === this.MAX_DEPTH) {
                    this.bestMove = [src, dst];
                }
                if (score > alpha) {
                    alpha = score;
                }
            }
            if (score >= beta) {
                return bestValue;
            }
        }

        return bestValue;
    }
}
