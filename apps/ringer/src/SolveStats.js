class SolveStats {
    constructor(boardNum, size, goal, moves, time, resets, undos, redos, hints) {
        if (boardNum === undefined || size === undefined || goal === undefined) {
            throw new Error('No stats without board number, size, and goal!');
        }
        this.boardNum = boardNum;
        this.size = size;
        this.goal = goal;
        this.moves = moves;
        this.time = time;
        this.resets = resets;
        this.undos = undos;
        this.hints = hints;
        this.redos = redos;
    }

    addMove() {
        this.moves++;
    }

    setTime(time) {
        this.time = time;
    }

    addReset() {
        this.resets++;
    }

    addUndo() {
        this.undos++;
    }

    addHint() {
        this.hint++;
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
