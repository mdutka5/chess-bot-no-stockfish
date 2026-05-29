import type { Piece } from "./piece";
import { PieceType, PieceColor } from "./piece";

export function createBoard(): (Piece | null)[] {
    const board = new Array(64);
    for (let i = 0; i < 64; ++i) {
        board[i] = createPiece(i);
    }
    return board;
}

function createPiece(coordinate: number): Piece | null {
    const rooks = new Set([0, 7, 56, 63]);
    const knights = new Set([1, 6, 57, 62]);
    const bishops = new Set([2, 5, 58, 61]);
    const queens = new Set([3, 59]);
    const kings = new Set([4, 60]);
    const pawns = new Set([8, 9, 10, 11, 12, 13, 14, 15, 48, 49, 50, 51, 52, 53, 54, 55]);

    const color = coordinate < 30 ? PieceColor.WHITE : PieceColor.BLACK;

    if (rooks.has(coordinate)) {
        return { type: PieceType.ROOK, color: color };
    } else if (knights.has(coordinate)) {
        return { type: PieceType.KNIGHT, color: color };
    } else if (bishops.has(coordinate)) {
        return { type: PieceType.BISHOP, color: color };
    } else if (queens.has(coordinate)) {
        return { type: PieceType.QUEEN, color: color };
    } else if (kings.has(coordinate)) {
        return { type: PieceType.KING, color: color };
    } else if (pawns.has(coordinate)) {
        return { type: PieceType.PAWN, color: color };
    } else {
        return null;
    }
}

export function notationToIndex(file: number, rank: number): number {
    if (file < 0 || file > 7) return -1;
    if (rank < 0 || rank > 7) return -1;
    return file + rank * 8;
}

export function indexToNotation(index: number): [number, number] {
    return [index % 8, Math.floor(index / 8)];
}
