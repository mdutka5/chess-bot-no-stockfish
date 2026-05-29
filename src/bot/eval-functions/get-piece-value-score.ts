import type { Game } from "../../model/game";
import { PieceColor } from "../../model/piece";
import { PIECE_VALUE } from "../consts/piece-value-table";

export function getPieceValueScore(game: Game): number {
    const score = game.getBoard().reduce((sum, piece) => {
        if (piece === null) return sum;
        const value = PIECE_VALUE[piece.type];
        return sum + (piece.color === PieceColor.WHITE ? value : -value);
    }, 0);

    return game.getCurrentPlayer() === PieceColor.WHITE ? score : -score;
}
