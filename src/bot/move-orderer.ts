import type { Game } from "../model/game";

export class MoveOrderer {
    private orderingFunctions: ((src: number, dst: number, state: Game) => number)[];

    constructor() {
        this.orderingFunctions = [];
    }

    public register(func: (src: number, dst: number, state: Game) => number): this {
        this.orderingFunctions.push(func);
        return this;
    }

    public order(moves: [number, number][], state: Game): [number, number][] {
        return moves.sort(([src1, dst1], [src2, dst2]) => {
            const score1 = this.orderingFunctions.reduce((sum, f) => sum + f(src1, dst1, state), 0);
            const score2 = this.orderingFunctions.reduce((sum, f) => sum + f(src2, dst2, state), 0);
            return score2 - score1;
        });
    }
}
