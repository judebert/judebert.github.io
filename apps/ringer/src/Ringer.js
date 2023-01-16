
class Ringer {
    constructor(size, depth) {
        if (size === undefined) size = 9;
        if (depth === undefined) depth = 2;
        this.size = size;
        this.depth = depth;
        this.boardNum = -1;
        this.start = [];
        this.moves = [];
        this.info = `Tap any cell to flip the ring of cells around it.
          The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
          Can you get all the cells to match?`;
    }

    // Helper function converting an [x, y] array to a Ringer cell index
    _asIndex(point) {
        return point[1] * this.size + point[0];
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

    ring(cell) {
        if (cell instanceof Array) {
            cell = this._asIndex(cell);
        }
        this.moves.push(cell);
    }

    // Returns a "hit map" of the board after applying the moves.
    // Indicates how many clicks were made at each cell, looping back to 0 after reaching depth.
    depthFrom(moves) {
        let depths = new Array(this.size * this.size).fill(0);
        for (var move of moves) {
            let index = this._asIndex(move);
            depths[index]++;
            depths[index] %= this.depth;
        }
        return depths;
    }

    // Returns a depth grid with the least necessary clicks to make all depths equal.
    bestSolution(moves) {
        // Describe how all cells have been clicked
        let situation = this.depthFrom(moves);
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

    save(info) {
        if (info === undefined) { info = `This board was saved without a description.` };
        return ({
            boardNum: this.boardNum,
            size: this.size,
            depth: this.depth,
            start: this.start,
            info: info,
        });
    }

    load(data) {
        if (data === undefined) return; 
        if (data.size === undefined) data.size = this.size;
        if (data.depth === undefined) data.depth = this.depth;
        if (data.start === undefined) data.start = [];
        this.size = data.size;
        this.depth = data.depth;
        this.boardNum = data.boardNum;
        this.start = data.start;
        this.info = data.info;
        this.depths = this.depthFrom(this.start);
    }
}

export default Ringer;
