import { createBoard, indexToNotation, notationToIndex } from "./board";
import { PieceType, PieceColor, type Piece } from "./piece";

export class Game {
    private board: (Piece | null)[];
    private currentPlayer: PieceColor;
    private killedBlack: Piece[];
    private killedWhite: Piece[];
    private whiteKingIndex: number;
    private blackKingIndex: number;
    private whiteCastleQueen: boolean;
    private whiteCastleKing: boolean;
    private blackCastleQueen: boolean;
    private blackCastleKing: boolean;

    public constructor() {
        this.board = createBoard();
        this.currentPlayer = PieceColor.WHITE;
        this.killedBlack = [];
        this.killedWhite = [];
        this.whiteKingIndex = 4;
        this.blackKingIndex = 60;
        this.whiteCastleQueen = true;
        this.whiteCastleKing = true;
        this.blackCastleQueen = true;
        this.blackCastleKing = true;
    }

    public getPiece(index: number): Piece | null {
        return this.board[index];
    }

    private isCoordValid(index: number): boolean {
        const [file, rank] = indexToNotation(index);
        if (file < 0 || file >= 8) return false;
        if (rank < 0 || rank >= 8) return false;
        return true;
    }

    private moveCoordOverBy(index: number, x: number, y: number): number {
        const [file, rank] = indexToNotation(index);
        return notationToIndex(file + x, rank + y);
    }

    private orthogonalMoves(): number[][] {
        return [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
        ];
    }

    private diagonalMoves(): number[][] {
        return [
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1],
        ];
    }

    private knightMoves(): number[][] {
        return [
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1],
            [-1, 2],
            [1, 2],
            [-1, -2],
            [1, -2],
        ];
    }

    private opponent(): PieceColor {
        return this.currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }

    private isPawnOnInitialRow(index: number): boolean {
        const piece = this.getPiece(index);
        if (piece === null || piece.type !== PieceType.PAWN) return false;

        return piece.color === PieceColor.WHITE
            ? 8 <= index && index <= 15
            : 48 <= index && index <= 55;
    }

    public allValidAndCapturableCells(index: number): [number[], number[]] | [null, null] {
        const piece = this.getPiece(index);

        const valid: number[] = [];
        const capturable: number[] = [];

        if (piece === null) return [valid, capturable];
        if (piece.color === this.opponent()) return [null, null];

        switch (piece.type) {
            case PieceType.PAWN:
                return this.pawnValidAndCapturablesCells(index);
            case PieceType.ROOK:
                return this.rookValidAndCapturablesCells(index);
            case PieceType.KNIGHT:
                return this.knightValidAndCapturablesCells(index);
            case PieceType.BISHOP:
                return this.bishopValidAndCapturablesCells(index);
            case PieceType.QUEEN:
                return this.queenValidAndCapturablesCells(index);
            case PieceType.KING:
                return this.kingValidAndCapturablesCells(index);
            default:
                throw new Error("This shouldn't have happend!");
        }
    }

    private pawnValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];

        const direction = this.currentPlayer == PieceColor.WHITE ? 1 : -1;
        const indexCopy = index;
        const steps = this.isPawnOnInitialRow(index) ? 2 : 1;

        for (let i = 0; i < steps; ++i) {
            index = this.moveCoordOverBy(index, 0, direction);
            if (this.isCoordValid(index) && this.board[index] === null) {
                valid.push(index);
            } else {
                break;
            }
        }

        index = indexCopy;

        const candidates = [
            this.moveCoordOverBy(index, -1, direction),
            this.moveCoordOverBy(index, 1, direction),
        ];

        for (const candidate of candidates) {
            if (!this.isCoordValid(candidate) || this.board[candidate] === null) {
                continue;
            }
            if (this.board[candidate].color === this.opponent()) {
                capturable.push(candidate);
            }
        }

        return [
            valid.filter((x) => this.isKingSafeAfterThisMove(index, x)),
            capturable.filter((x) => this.isKingSafeAfterThisMove(index, x)),
        ];
    }

    private rookValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];
        const indexCopy = index;

        for (const [x, y] of this.orthogonalMoves()) {
            for (let i = 0; i < 8; ++i) {
                index = this.moveCoordOverBy(index, x, y);
                if (this.isCoordValid(index) && this.board[index] === null) {
                    valid.push(index);
                } else {
                    if (!this.isCoordValid(index)) break;
                    const piece = this.board[index];
                    if (piece !== null && piece.color === this.opponent()) {
                        capturable.push(index);
                    }
                    break;
                }
            }
            index = indexCopy;
        }

        return [
            valid.filter((x) => this.isKingSafeAfterThisMove(index, x)),
            capturable.filter((x) => this.isKingSafeAfterThisMove(index, x)),
        ];
    }

    private knightValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];
        const indexCopy = index;

        for (const [x, y] of this.knightMoves()) {
            index = this.moveCoordOverBy(index, x, y);
            if (!this.isCoordValid(index)) {
                index = indexCopy;
                continue;
            }
            const piece = this.board[index];
            if (piece === null) {
                valid.push(index);
            } else if (piece.color === this.opponent()) {
                capturable.push(index);
            }
            index = indexCopy;
        }

        return [
            valid.filter((x) => this.isKingSafeAfterThisMove(index, x)),
            capturable.filter((x) => this.isKingSafeAfterThisMove(index, x)),
        ];
    }

    private bishopValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];

        const indexCopy = index;

        for (const [x, y] of this.diagonalMoves()) {
            for (let i = 0; i < 8; ++i) {
                index = this.moveCoordOverBy(index, x, y);
                if (this.isCoordValid(index) && this.board[index] === null) {
                    valid.push(index);
                } else {
                    if (!this.isCoordValid(index)) break;
                    const piece = this.board[index];
                    if (piece !== null && piece.color === this.opponent()) {
                        capturable.push(index);
                    }
                    break;
                }
            }
            index = indexCopy;
        }

        return [
            valid.filter((x) => this.isKingSafeAfterThisMove(index, x)),
            capturable.filter((x) => this.isKingSafeAfterThisMove(index, x)),
        ];
    }

    private queenValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];

        const indexCopy = index;
        const moves = [...this.orthogonalMoves(), ...this.diagonalMoves()];

        for (const [x, y] of moves) {
            for (let i = 0; i < 8; ++i) {
                index = this.moveCoordOverBy(index, x, y);
                if (this.isCoordValid(index) && this.board[index] === null) {
                    valid.push(index);
                } else {
                    if (!this.isCoordValid(index)) break;
                    const piece = this.board[index];
                    if (piece !== null && piece.color === this.opponent()) {
                        capturable.push(index);
                    }
                    break;
                }
            }
            index = indexCopy;
        }

        return [
            valid.filter((x) => this.isKingSafeAfterThisMove(index, x)),
            capturable.filter((x) => this.isKingSafeAfterThisMove(index, x)),
        ];
    }

    private kingValidAndCapturablesCells(index: number): [number[], number[]] {
        const valid: number[] = [];
        const capturable: number[] = [];

        const indexCopy = index;
        const moves = [...this.orthogonalMoves(), ...this.diagonalMoves()];

        const king = this.board[index];
        this.board[index] = null;

        for (const [x, y] of moves) {
            index = this.moveCoordOverBy(index, x, y);
            if (!this.isCoordValid(index)) {
                index = indexCopy;
                continue;
            }

            if (this.isUnderAttack(index)) {
                index = indexCopy;
                continue;
            }

            const piece = this.board[index];
            if (piece === null) {
                valid.push(index);
            } else if (piece.color === this.opponent()) {
                capturable.push(index);
            }
            index = indexCopy;
        }

        this.board[index] = king;

        if (this.canCastleKingSide(index)) valid.push(this.moveCoordOverBy(index, 2, 0));
        if (this.canCastleQueenSide(index)) valid.push(this.moveCoordOverBy(index, -2, 0));

        return [valid, capturable];
    }

    private canCastleKingSide(kingIndex: number): boolean {
        if (this.isUnderAttack(kingIndex)) return false;
        const king = this.getPiece(kingIndex)!;
        if (king.color === PieceColor.WHITE) {
            if (!this.whiteCastleKing) return false;
        } else {
            if (!this.blackCastleKing) return false;
        }

        const indicesToCheck: number[] = [
            this.moveCoordOverBy(kingIndex, 1, 0),
            this.moveCoordOverBy(kingIndex, 2, 0),
        ];

        for (const index of indicesToCheck) {
            if (this.getPiece(index) !== null || this.isUnderAttack(index)) return false;
        }

        return true;
    }

    private canCastleQueenSide(kingIndex: number): boolean {
        if (this.isUnderAttack(kingIndex)) return false;
        const king = this.getPiece(kingIndex)!;
        if (king.color === PieceColor.WHITE) {
            if (!this.whiteCastleQueen) return false;
        } else {
            if (!this.blackCastleQueen) return false;
        }

        const indicesToCheck: number[] = [
            this.moveCoordOverBy(kingIndex, -1, 0),
            this.moveCoordOverBy(kingIndex, -2, 0),
        ];

        for (const index of indicesToCheck) {
            if (this.getPiece(index) !== null || this.isUnderAttack(index)) return false;
        }

        return this.getPiece(this.moveCoordOverBy(kingIndex, -3, 0)) === null;
    }

    public getKingIndex(): number {
        return this.currentPlayer == PieceColor.WHITE ? this.whiteKingIndex : this.blackKingIndex;
    }

    public getCurrentPlayer(): PieceColor {
        return this.currentPlayer;
    }

    public isKingUnderAttack(color: PieceColor): boolean {
        if (color === PieceColor.WHITE) {
            return this.isUnderAttack(this.whiteKingIndex);
        } else {
            return this.isUnderAttack(this.blackKingIndex);
        }
    }

    private isUnderAttack(index: number): boolean {
        const indexCopy = index;
        const moves = [...this.orthogonalMoves(), ...this.diagonalMoves()];

        if (this.opponent() == PieceColor.WHITE) {
            const right = this.moveCoordOverBy(index, 1, -1);
            const left = this.moveCoordOverBy(index, -1, -1);
            const rightPiece = this.getPiece(right);
            const leftPiece = this.getPiece(left);
            if (rightPiece?.color == PieceColor.WHITE && rightPiece.type == PieceType.PAWN)
                return true;
            if (leftPiece?.color == PieceColor.WHITE && leftPiece.type == PieceType.PAWN)
                return true;
        } else if (this.opponent() == PieceColor.BLACK) {
            const right = this.moveCoordOverBy(index, 1, 1);
            const left = this.moveCoordOverBy(index, -1, 1);
            const rightPiece = this.getPiece(right);
            const leftPiece = this.getPiece(left);
            if (rightPiece?.color == PieceColor.BLACK && rightPiece.type == PieceType.PAWN)
                return true;
            if (leftPiece?.color == PieceColor.BLACK && leftPiece.type == PieceType.PAWN)
                return true;
        }

        for (const [x, y] of moves) {
            const piece = this.getPiece(this.moveCoordOverBy(index, x, y));
            if (piece?.color === this.opponent() && piece.type === PieceType.KING) return true;

            index = indexCopy;

            while (true) {
                index = this.moveCoordOverBy(index, x, y);
                if (!this.isCoordValid(index)) break;

                const piece = this.getPiece(index);

                if (piece === null) continue;
                if (this.isPieceFriendly(piece)) break;

                if (
                    piece.type === PieceType.QUEEN ||
                    (piece.type === PieceType.ROOK && (x === 0 || y === 0)) ||
                    (piece.type === PieceType.BISHOP && x !== 0 && y !== 0)
                )
                    return true;

                break;
            }
            index = indexCopy;
        }

        for (const [x, y] of this.knightMoves()) {
            index = this.moveCoordOverBy(index, x, y);
            if (!this.isCoordValid(index)) {
                index = indexCopy;
                continue;
            }
            const piece = this.getPiece(index);
            if (
                piece !== null &&
                piece.color === this.opponent() &&
                piece.type == PieceType.KNIGHT
            ) {
                return true;
            }
            index = indexCopy;
        }

        return false;
    }

    private isPieceFriendly(piece: Piece): boolean {
        return piece.color !== this.opponent();
    }

    public makeMove(src: number, dst: number): void {
        const piece = this.getPiece(dst);

        if (piece !== null) {
            if (this.opponent() === PieceColor.WHITE) {
                this.killedWhite.push(piece);
            } else {
                this.killedBlack.push(piece);
            }
        }

        if (src === this.whiteKingIndex) {
            this.whiteKingIndex = dst;
        } else if (src == this.blackKingIndex) {
            this.blackKingIndex = dst;
        }

        this.updateCastling(src, dst);

        if (this.isThisCastling(src, dst)) {
            this.castle(src, dst);
            this.afterCastling(dst);
        } else {
            this.board[dst] = this.board[src];
            this.board[src] = null;
        }

        this.currentPlayer = this.opponent();

        if (this.canPromote(dst)) {
            this.board[dst]!.type = PieceType.QUEEN;
        }
    }

    private castle(src: number, dst: number) {
        const king = this.getPiece(src)!;
        if (king.color === PieceColor.WHITE) {
            if (dst === 2) {
                this.board[dst] = this.board[src];
                this.board[src] = null;
                this.board[3] = this.board[0];
                this.board[0] = null;
            } else {
                this.board[dst] = this.board[src];
                this.board[src] = null;
                this.board[5] = this.board[7];
                this.board[7] = null;
            }
        } else {
            if (dst === 58) {
                this.board[dst] = this.board[src];
                this.board[src] = null;
                this.board[59] = this.board[56];
                this.board[56] = null;
            } else {
                this.board[dst] = this.board[src];
                this.board[src] = null;
                this.board[61] = this.board[63];
                this.board[63] = null;
            }
        }
    }

    public isThisCastling(src: number, dst: number): boolean {
        const piece = this.getPiece(src)!;
        const castleIndeces = [2, 6, 58, 62];
        if (
            piece.type === PieceType.KING &&
            castleIndeces.includes(dst) &&
            (src === 60 || src === 4)
        )
            return true;
        return false;
    }

    private afterCastling(dst: number) {
        if (dst === 2 || dst === 6) {
            this.whiteCastleKing = false;
            this.whiteCastleQueen = false;
        } else {
            this.blackCastleKing = false;
            this.blackCastleQueen = false;
        }
    }

    private updateCastling(src: number, dst: number): void {
        const srcPiece = this.getPiece(src)!;
        const dstPiece = this.getPiece(dst);

        if (srcPiece.type === PieceType.ROOK) {
            if (srcPiece.color === PieceColor.WHITE && src === 0) this.whiteCastleQueen = false;
            if (srcPiece.color === PieceColor.WHITE && src === 7) this.whiteCastleKing = false;
            if (srcPiece.color === PieceColor.BLACK && src === 56) this.blackCastleQueen = false;
            if (srcPiece.color === PieceColor.BLACK && src === 63) this.blackCastleKing = false;
        }

        if (dstPiece !== null && dstPiece.type === PieceType.ROOK) {
            if (dstPiece.color === PieceColor.WHITE && dst === 0) this.whiteCastleQueen = false;
            if (dstPiece.color === PieceColor.WHITE && dst === 7) this.whiteCastleKing = false;
            if (dstPiece.color === PieceColor.BLACK && dst === 56) this.blackCastleQueen = false;
            if (dstPiece.color === PieceColor.BLACK && dst === 63) this.blackCastleKing = false;
        }

        if (srcPiece.type === PieceType.KING) {
            if (srcPiece.color === PieceColor.WHITE) {
                this.whiteCastleQueen = false;
                this.whiteCastleKing = false;
            } else {
                this.blackCastleQueen = false;
                this.blackCastleKing = false;
            }
        }
    }

    private canPromote(index: number): boolean {
        const piece = this.getPiece(index);
        if (piece === null) return false;
        if (piece.type !== PieceType.PAWN) return false;

        if (piece.color == PieceColor.WHITE) {
            if (56 <= index && index <= 63) return true;
        } else {
            if (0 <= index && index <= 7) return true;
        }
        return false;
    }

    public clone(): Game {
        const game = new Game();
        game.board = structuredClone(this.board);
        game.currentPlayer = this.currentPlayer;
        game.whiteKingIndex = this.whiteKingIndex;
        game.blackKingIndex = this.blackKingIndex;
        game.killedWhite = [...this.killedWhite];
        game.killedBlack = [...this.killedBlack];
        return game;
    }

    public isGameOver(): boolean {
        if (!this.isKingUnderAttack(this.getCurrentPlayer())) {
            return false;
        }

        for (const [index, piece] of this.board.entries()) {
            if (piece === null || piece.color === this.opponent()) {
                continue;
            }
            const [valid, capturable] = this.allValidAndCapturableCells(index);

            if (valid?.length !== 0 || capturable?.length != 0) return false;
        }
        return true;
    }

    public isStalemate(): boolean {
        if (this.isKingUnderAttack(this.getCurrentPlayer())) {
            return false;
        }

        for (const [index, piece] of this.board.entries()) {
            if (piece === null || piece.color === this.opponent()) {
                continue;
            }
            const [valid, capturable] = this.allValidAndCapturableCells(index);

            if (valid?.length !== 0 || capturable?.length != 0) return false;
        }
        return true;
    }

    public getBoard(): (null | Piece)[] {
        return this.board;
    }

    private isKingSafeAfterThisMove(src: number, dst: number): boolean {
        const game = this.clone();
        game.makeMove(src, dst);
        game.currentPlayer = this.currentPlayer;
        return !game.isKingUnderAttack(this.currentPlayer);
    }

    public getKilled(pieceColor: PieceColor): Piece[] {
        return pieceColor === PieceColor.WHITE ? this.killedWhite : this.killedBlack;
    }
}
