import type { Game } from "../../model/game";
import type { PieceColor } from "../../model/piece";

export abstract class Bot {
    protected game: Game;
    protected player: PieceColor;

    constructor(game: Game, player: PieceColor) {
        this.game = game;
        this.player = player;
    }

    public abstract chooseAction(): [number, number];

    protected allPossibleMoves(state: Game): [number, number][] {
        const allMoves: [number, number][] = [];

        for (const [index, piece] of state.getBoard().entries()) {
            if (piece === null || piece.color !== state.getCurrentPlayer()) continue;
            const [valid, capturable] = state.allValidAndCapturableCells(index);
            if (valid !== null) {
                valid.forEach((dst) => allMoves.push([index, dst]));
            }
            if (capturable !== null) {
                capturable.forEach((dst) => allMoves.push([index, dst]));
            }
        }

        return allMoves;
    }
}
