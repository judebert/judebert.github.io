import seedrandom from 'seedrandom';

class Ringer {
    constructor(size, depth) {
        if (size === undefined) size = 9;
        if (depth === undefined) depth = 2;
        this.boardNum = 0;
        this.size = size;
        this.depth = depth;
        this.goal = 0;
        this.start = [];
        this.info = `Tap any cell to flip the ring of cells around it.
          The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
          Can you get all the cells to match?`;
    }

    // Helper function showing how far a cell with a click-depth is from a given target,
    // knowing that it wraps around at depth.
    _clicksAway(clicks, target) {
        if (target === undefined) {
            target = 0;
        }
        // Each cell at a given click-depth is (target - clicks) away from reaching the target.
        // But cells can be deeper than the target clicks, leading to negative numbers. For instance,
        // a cell with 2 clicks is -2 away from a target of 0. That converts to its positive 
        // equivalent by adding the depth, then modulo the whole thing by depth.
        // For a depth of 3, and a target of 0, each cell contributes by its clicks:
        //     0 => 0 - 0 => 0 + 3 => 3 % 3 => 0
        //     1 => 0 - 1 => -1 + 3 => 2 % 3 => 2
        //     2 => 0 - 2 => -2 + 3 => 1 % 3 => 1
        // If we're trying to get to 2, each cell contributes by its clicks:
        //     0 => 2 - 0 => 2 + 3 => 5 % 3 => 2
        //     1 => 2 - 1 => 1 + 3 => 4 % 3 => 1
        //     2 => 2 - 2 => 0 + 3 => 3 % 3 => 0
        // Lots of explanation for this quick calculation. 
        return (target - clicks + this.depth) % this.depth;
    }

    // Increment all the cells in a ring around (x, y) *mutating* the given grid
    _ticNeighbors(index, grid) {
        // Calculate the X and Y so we can do wrap-around modulo math.
        const x = index % this.size;
        const y = Math.floor(index / this.size);
        const neighbors = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1],
        ];
        for (var [dx, dy] of neighbors) {
            const ringX = (x + dx + this.size) % this.size;
            const ringY = (y + dy + this.size) % this.size;
            const neighbor = ringY * this.size + ringX;
            grid[neighbor] = (grid[neighbor] + 1) % this.depth;
        }
    }

    // Returns true if the moves solve the board.
    // Returns true if every cell in the board is the same color after applying the moves.
    isSolvedBy(moves) {
        let grid = this.gridFrom(moves);
        let response = grid.every((cell) => cell === grid[0]);
        return response;
    }

    // Clears this board, then adds clicks until it can be solved in `times` clicks.
    // Saves the [x,y] start moves in this.start
    shuffle(seed, times) {
        this.boardNum = seed > 0 ? seed.toString(16).toUpperCase() : "";
        let rng = seedrandom(seed);
        // How many clicks will it take to solve the board right now?
        this.start = [];
        let board = this.depthFrom([]);
        let clicks = 0; // solveDistance is always 0 on an empty board... right?
        // Shuffle until we reach the right number of clicks
        for (var i = 0; i < 1000 && clicks < times; i++) {
            const index = Math.floor(rng() * board.length);
            // Don't *solve* a cell; only make it deeper
            if (board[index] !== 1) {
                board[index] = (board[index] + this.depth - 1) % this.depth;
                clicks++;
            }
        }
        this.goal = board.reduce((sum, cellDepth) => sum + ((this.depth - cellDepth) % this.depth), 0);
        console.log(`Shuffled to ${clicks} moves / goal ${this.goal} in ${i} tries`);
        // Turn that into a list of moves (order doesn't matter!)
        this.start = board.flatMap((cellDepth, index) => Array(cellDepth).fill(index));
    }

    // Returns displayed board, where all the squares *around* the `moves` have been flipped.
    gridFrom(moves) {
        let grid = new Array(this.size * this.size).fill(0);
        for (var index of this.start.concat(moves)) {
            this._ticNeighbors(index, grid);
        }
        return grid;
    }

    // Returns a "hit map" of the board after applying the moves.
    // Indicates how many clicks were made at each cell, looping back to 0 after reaching depth.
    depthFrom(moves) {
        let depths = new Array(this.size * this.size).fill(0);
        for (var index of this.start.concat(moves)) {
            depths[index]++;
            depths[index] %= this.depth;
        }
        return depths;
    }

    // Returns a depth grid with the least necessary clicks to make all depths equal.
    bestSolution(history) {
        // Describe how all cells have been clicked
        let situation = this.depthFrom(history.current());
        // Build a histogram of how far away each cell is from depth 0
        let histogram = [];
        for (let clickDepth = 0; clickDepth < this.depth; clickDepth++) {
            histogram.push([]);
        }
        situation.forEach((height, index) => histogram[height].push(index));
        // How far are the cells from each possible depth?
        // For each target depth
        let clicks = new Array(this.depth).fill(0);
        for (let target = 0; target < this.depth; target++) {
            clicks[target] = histogram.reduce(
                (sum, cells, clicks) => (sum + cells.length * this._clicksAway(clicks, target)),
                0);
        }
        // We now know have many clicks to get a uniform depth for each target depth in clicks[target depth].
        // Which is the closest?
        let bestTarget = clicks.reduce((current, clicks, index, all) => clicks < all[current] ? index : current, 0);
        // Convert the histogram to a depth-map of distance from the target
        let solution = new Array(this.size * this.size).fill(0);
        for (let clickDepth = 0; clickDepth < this.depth; clickDepth++) {
            if (clickDepth === bestTarget) {
                continue;
            }
            let distance = this._clicksAway(clickDepth, this.depth, bestTarget);
            histogram[clickDepth].forEach((index) => solution[index] = distance);
        }
        return solution;
    }

    toJson(info) {
        if (info === undefined) { info = `This board was saved without a description.` };
        return ({
            boardNum: this.boardNum,
            size: this.size,
            depth: this.depth,
            goal: this.goal,
            start: this.start,
            info: info,
        });
    }

    fromJson(data) {
        if (data === undefined) return; 
        if (data.boardNum === undefined) data.boardNum = this.boardNum;
        this.boardNum = data.boardNum;
        if (data.size === undefined) data.size = this.size;
        this.size = data.size;
        if (data.depth === undefined) data.depth = this.depth;
        this.depth = data.depth;
        if (data.goal === undefined) data.goal = this.goal;
        this.goal = data.goal;
        if (data.start === undefined) data.start = this.start;
        this.start = data.start;
        if (data.info === undefined) data.info = this.info;
        this.info = data.info;
    }
}

export default Ringer;
