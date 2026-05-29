import { Game } from "../../model/game";
import type { PieceColor } from "../../model/piece";
import { Bot } from "./bot-base-class";

export class RandomBot extends Bot {
    constructor(game: Game, player: PieceColor) {
        super(game, player);
    }

    public chooseAction(): [number, number] {
        const allMoves = this.allPossibleMoves(this.game);
        const randomIndex = Math.floor(Math.random() * allMoves.length);
        return allMoves[randomIndex];
    }
}
