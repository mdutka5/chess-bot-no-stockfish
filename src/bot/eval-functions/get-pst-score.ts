import type { Game } from "../../model/game";
import { PieceColor } from "../../model/piece";
import { PIECE_SQUARE_TABLES } from "../consts/piece-square-tables";

export function getPSTScore(game: Game): number {
    const score = game.getBoard().reduce((sum, piece, index) => {
        if (piece === null) return sum;
        const pstIndex = piece.color === PieceColor.WHITE ? 63 - index : index;
        const value = PIECE_SQUARE_TABLES[piece.type][pstIndex];
        return sum + (piece.color === PieceColor.WHITE ? value : -value);
    }, 0);

    return game.getCurrentPlayer() === PieceColor.WHITE ? score : -score;
}
