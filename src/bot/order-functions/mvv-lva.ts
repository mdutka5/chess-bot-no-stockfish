import type { Game } from "../../model/game";
import { PIECE_VALUE } from "../consts/piece-value-table";

export function mvvLva(src: number, dst: number, state: Game): number {
    const victim = state.getBoard()[dst];
    if (victim === null) return 0;
    const attacker = state.getBoard()[src]!;
    return PIECE_VALUE[victim.type] - PIECE_VALUE[attacker.type] / 100;
}
