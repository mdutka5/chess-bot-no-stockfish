import type { Game } from "../model/game";

export class Evaluator {
    private evalFunctions: ((game: Game) => number)[];

    constructor() {
        this.evalFunctions = [];
    }

    public register(func: (game: Game) => number): this {
        this.evalFunctions.push(func);
        return this;
    }

    public evaluatePosition(game: Game): number {
        return this.evalFunctions.reduce((sum, func) => sum + func(game), 0);
    }
}
