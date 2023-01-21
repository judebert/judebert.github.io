
class MoveHistory {
    constructor(moves, step) {
        if (moves === undefined) {
            moves = [];
        }
        this.moves = moves;
        if (step === undefined) {
            step = 0;
        }
        this.step = step;
    }

    current() {
        return this.moves.slice(0, this.step);
    }

    all() {
        return this.moves.slice();
    }

    undone() {
        return this.moves.slice(this.step);
    }

    // Since history is entirely separate from the board, we don't know depth or height.
    // We can only use the data we get.
    makeMove(move) {
        this.moves = this.moves.slice(0, this.step);
        this.moves.push(move);
        this.step++;
        return this.moves;
    }

    step() {
        return this.step;
    }

    // Luckily, 0 gets interpreted as false, and we can undo as long as there's at least 1 step,
    // so this really just returns the number of steps. It's the number of steps we can undo.
    canUndo() {
        return this.step;
    }

    // Attempts to undo the provided number of steps.
    // Returns the number of steps actually undone.
    undo(steps) {
        if (steps === undefined) {
            steps = 1;
        }
        if (this.step < steps) {
            steps = this.step;
        }
        this.step -= steps;
        return steps;
    }

    // Returns the number of steps we can redo.
    canRedo() {
        return this.moves.length - this.step;
    }

    // Attempts to redo the provided number of steps.
    // Returns the number of steps actually redone.
    redo(steps) {
        if (steps === undefined) {
            steps = 1;
        }
        steps = Math.min(this.canRedo(), steps);
        this.step += steps;
        return steps;
    }
}

export default MoveHistory;
