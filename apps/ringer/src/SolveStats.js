class SolveStats {
    constructor(opts) {
        if (opts.boardNum === undefined || opts.size === undefined || opts.goal === undefined) {
            throw new Error('No stats without board number, size, and goal!');
        }
        this.boardNum = opts.boardNum;
        this.size = opts.size;
        this.goal = opts.goal;
        this.moves = opts.moves || 0;
        this.time = opts.time || 0;
        this.resets = opts.resets || 0;
        this.undos = opts.undos || 0;
        this.hints = opts.hints || 0;
        this.redos = opts.redos || 0;
    }

    addMove() {
        this.moves = this.moves + 1;
    }

    setMoves(moves) {
        this.moves = moves;
    }

    setTime(time) {
        this.time = time;
    }

    addReset() {
        this.resets = this.resets + 1;
    }

    setResets(resets) {
        this.resets = resets;
    }

    addUndo() {
        this.undos = this.undos + 1;
    }

    setUndos(undos) {
        this.undos = undos;
    }

    addRedo() {
        this.redos = this.redos + 1;
    }
    
    setRedos(redos) {
        this.redos = redos;
    }

    addHint() {
        this.hints = this.hints + 1;
    }

    setHints(hints) {
        this.hints = hints;
    }

    // Prejudiced comparison of scores: fewest moves, then fastest time, then...
    static compare(a, b) {
        // First off, the ones that shouldn't show up in persistence
        if (a.size !== b.size) {
            return a.size - b.size;
        }
        if (a.goal !== b.goal) {
            return a.goal - b.goal;
        }
        if (a.moves !== b.moves) {
            return a.moves - b.moves;
        }
        if (a.time !== b.time) {
            return a.time - b.time;
        }
        if (a.hints !== b.hints) {
            return a.hints - b.hints;
        }
        if (a.resets !== b.resets) {
            return a.resets - b.resets;
        }
        if (a.undos !== b.undos) {
            return a.undos - b.undos;
        }
        return 0;
    }
}

export default SolveStats;
