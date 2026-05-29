import { getPieceValueScore } from "./bot/eval-functions/get-piece-value-score";
import { getPSTScore } from "./bot/eval-functions/get-pst-score";
import { Evaluator } from "./bot/evaluator";
import type { Bot } from "./bot/models/bot-base-class";
import { NegamaxAlphaBetaBot } from "./bot/models/negamax-alpha-beta-bot";
//import { RandomBot } from "./bot/models/random-bot";
import { MoveOrderer } from "./bot/move-orderer";
import { mvvLva } from "./bot/order-functions/mvv-lva";
import { Game } from "./model/game";
import { PieceColor, type Piece } from "./model/piece";
import { pieceToSvg, renderBoard } from "./ui/renderer";

const game: Game = new Game();
const evaluator: Evaluator = new Evaluator().register(getPieceValueScore).register(getPSTScore);
const orderer: MoveOrderer = new MoveOrderer().register(mvvLva);
const bot: Bot = new NegamaxAlphaBetaBot(game, PieceColor.BLACK, evaluator, orderer, 3);
// const bot: Bot = new RandomBot(game, PieceColor.BLACK);

renderBoard(game);

const cells = document.querySelectorAll<HTMLDivElement>(".board-cell");

cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        const index = parseInt(cell.dataset.index!);
        if (cell.classList.contains("moveable") || cell.classList.contains("capturable")) {
            performMove(parseInt(selected?.dataset.index!), index);
            updateKilled();

            const [botSrc, botDst] = bot.chooseAction();
            performMove(botSrc, botDst);

            updateKilled();
        } else {
            handleSelect(parseInt(cell.dataset.index!));
        }
    });
});

let selected: HTMLDivElement | null = null;
let validCells: HTMLDivElement[] = [];
let capturableCells: HTMLDivElement[] = [];
let attackedKing: HTMLDivElement | null = null;

function handleSelect(index: number): void {
    const [valid, capturable] = game.allValidAndCapturableCells(index);

    if (selected !== null) {
        selected.classList.remove("active");
        validCells.forEach((cell) => cell.classList.remove("moveable"));
        capturableCells.forEach((cell) => cell.classList.remove("capturable"));
        attackedKing?.classList.remove("attacked");
    }

    if (valid === null || capturable === null) {
        const cell = getCellByIndex(index);
        cell.classList.toggle("active");
        selected = cell;
    } else {
        if (game.isKingUnderAttack(game.getCurrentPlayer())) {
            const kingCell = getCellByIndex(game.getKingIndex());
            kingCell.classList.add("attacked");
            attackedKing = kingCell;
        }
        const cellsToMoveTo: HTMLDivElement[] = valid.map((i) => getCellByIndex(i));
        const cellsToCaptureTo: HTMLDivElement[] = capturable.map((i) => getCellByIndex(i));
        cellsToMoveTo.forEach((cell) => cell.classList.add("moveable"));
        cellsToCaptureTo.forEach((cell) => cell.classList.add("capturable"));
        validCells = cellsToMoveTo;
        capturableCells = cellsToCaptureTo;
        selected = getCellByIndex(index);
    }
}

function performMove(src: number, dst: number): void {
    const isCastling = game.isThisCastling(src, dst);
    console.log("isCastling:", isCastling); // ← add this
    game.makeMove(src, dst);
    if (isCastling) {
        for (let i = 56; i < 64; ++i) {
            updateCell(i);
        }
        for (let i = 0; i < 8; ++i) {
            updateCell(i);
        }
    } else {
        updateCell(src);
        updateCell(dst);
    }
    selected = null;
    validCells.forEach((cell) => cell.classList.remove("moveable"));
    capturableCells.forEach((cell) => cell.classList.remove("capturable"));
    attackedKing?.classList.remove("attacked");

    if (game.isGameOver()) {
        console.log("Game Over!");
        popUpGameOver(false); // stalemate = false;
        return;
    } else if (game.isStalemate()) {
        popUpGameOver(true); // stalemate = true;
        return;
    }
}

function getCellByIndex(index: number): HTMLDivElement {
    const cells = document.querySelectorAll<HTMLDivElement>(".board-cell");
    return [...cells].find((cell) => parseInt(cell.dataset.index!) === index)!;
}

function updateCell(index: number): void {
    const cell: HTMLDivElement = getCellByIndex(index);
    const piece: Piece | null = game.getPiece(index);

    if (piece === null) {
        cell.firstChild?.remove();
    } else {
        cell.firstChild?.remove();
        const pieceImg = document.createElement("img");
        pieceImg.src = pieceToSvg[piece.color][piece.type];
        pieceImg.classList.add("piece");
        cell.append(pieceImg);
    }
}

function updateKilled(): void {
    const whiteKilled = document.querySelector<HTMLDivElement>(".killed.white");
    const blackKilled = document.querySelector<HTMLDivElement>(".killed.black");

    if (game.getKilled(PieceColor.WHITE).length !== whiteKilled?.children.length) {
        whiteKilled?.replaceChildren();
        for (const piece of game.getKilled(PieceColor.WHITE)) {
            const pieceImg = document.createElement("img");
            pieceImg.src = pieceToSvg[piece.color][piece.type];
            pieceImg.classList.add("piece");
            whiteKilled?.append(pieceImg);
        }
    }

    if (game.getKilled(PieceColor.BLACK).length !== blackKilled?.children.length) {
        blackKilled?.replaceChildren();
        for (const piece of game.getKilled(PieceColor.BLACK)) {
            const pieceImg = document.createElement("img");
            pieceImg.src = pieceToSvg[piece.color][piece.type];
            pieceImg.classList.add("piece");
            blackKilled?.append(pieceImg);
        }
    }
}

function popUpGameOver(stalemate: boolean): void {
    const popUp = document.createElement("div");
    popUp.classList.add("game-over-pop-up");

    const text: HTMLParagraphElement = document.createElement("p");
    if (stalemate) {
        text.innerText = "GAME OVER!\n Draw!";
    } else {
        const whoWon = game.getCurrentPlayer() === PieceColor.WHITE ? "Black" : "White";
        text.innerText = `GAME OVER!\n ${whoWon} win!`;
    }

    popUp.append(text);

    const board = document.querySelector<HTMLDivElement>("#board")!;
    board.append(popUp);
}
