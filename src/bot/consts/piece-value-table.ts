import { PieceType } from "../../model/piece";

export const PIECE_VALUE: Record<PieceType, number> = {
    [PieceType.PAWN]: 100,
    [PieceType.KNIGHT]: 320,
    [PieceType.BISHOP]: 330,
    [PieceType.ROOK]: 500,
    [PieceType.QUEEN]: 900,
    [PieceType.KING]: 20000,
};
