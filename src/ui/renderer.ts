import { Game } from "../model/game";
import { PieceColor, PieceType } from "../model/piece";

export const pieceToSvg = {
    [PieceColor.WHITE]: {
        [PieceType.PAWN]: "/pieces/white-pawn.svg",
        [PieceType.ROOK]: "/pieces/white-rook.svg",
        [PieceType.BISHOP]: "/pieces/white-bishop.svg",
        [PieceType.KNIGHT]: "/pieces/white-knight.svg",
        [PieceType.QUEEN]: "/pieces/white-queen.svg",
        [PieceType.KING]: "/pieces/white-king.svg",
    },
    [PieceColor.BLACK]: {
        [PieceType.PAWN]: "/pieces/black-pawn.svg",
        [PieceType.ROOK]: "/pieces/black-rook.svg",
        [PieceType.BISHOP]: "/pieces/black-bishop.svg",
        [PieceType.KNIGHT]: "/pieces/black-knight.svg",
        [PieceType.QUEEN]: "/pieces/black-queen.svg",
        [PieceType.KING]: "/pieces/black-king.svg",
    },
};

export function renderBoard(game: Game): void {
    const board = document.querySelector<HTMLDivElement>("#board")!;
    let isWhite = false;

    let index = 0;

    const rows: HTMLDivElement[][] = [];

    for (let row = 0; row < 8; ++row) {
        const rowCells: HTMLDivElement[] = [];

        for (let i = 0; i < 8; ++i) {
            const cell = document.createElement("div");
            const piece = game.getPiece(index);
            if (piece !== null) {
                const pieceImg = document.createElement("img");
                pieceImg.src = pieceToSvg[piece.color][piece.type];
                pieceImg.classList.add("piece");
                cell.append(pieceImg);
            }
            cell.classList.add("board-cell");
            cell.classList.add(isWhite ? "white" : "black");
            cell.dataset.index = index.toString();
            rowCells.push(cell);

            index++;

            if ((i + 1) % 8 === 0) continue;
            isWhite = !isWhite;
        }

        rows.push(rowCells);
    }

    for (const row of rows.reverse()) {
        for (const cell of row) {
            board.append(cell);
        }
    }
}
