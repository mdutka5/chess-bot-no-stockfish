export const PieceType = {
    PAWN: 1,
    ROOK: 2,
    KNIGHT: 3,
    BISHOP: 4,
    QUEEN: 5,
    KING: 6,
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

export const PieceColor = {
    WHITE: 0,
    BLACK: 1,
} as const;

export type PieceColor = (typeof PieceColor)[keyof typeof PieceColor];

export interface Piece {
    type: PieceType;
    color: PieceColor;
}
