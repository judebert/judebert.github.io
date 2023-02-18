import seedrandom from 'seedrandom';
import fromBase32 from 'base32-decode';
import BitPacker from './BitPacker.js';

class Ringer {

    // By default, a Ringer board is 9x9, depth 2, #0 with 0 shuffles: a blank 9x9.
    // Ringer supports different combinations of options in different situations.
    // A randomized board: {
    //   size: 9,
    //   depth: 2,
    //   boardNum: 1,    // Positive number between 1 and 16,777,215
    //   shuffles: 8,    // Will be limited to between 1 and size^2 * depth / 2
    //   datastore: ref, // Info from this datastore will overwrite any other options
    // }
    // An art / challenge / saved board: {
    //   boardNum: 0,
    //   title: "Caterpillar Tracks",
    //   info: "Clamshells can erase both end rows if they're on a board of the right size.",
    //   data: "2800000000G8400000000000", // Info from this data overwrites any other options
    // }
    // A tutorial board: {
    //   boardNum: -3,   // Negative number between -1 and the largest tutorial board
    //   datastore: ref, // Info from this datastore will overwrite any other options
    // }
    constructor(opts) {
        if (opts === undefined) { opts = {}; }
        if (opts.size === undefined) opts.size = 9;
        if (opts.depth === undefined) opts.depth = 2;
        if (opts.boardNum === undefined) opts.boardNum = 0;
        if (opts.shuffles === undefined) opts.shuffles = 0;
        if (opts.boardNum > 0 && opts.shuffles === 0) opts.boardNum = 0;
        if (opts.boardNum !== 0 && opts.datastore === undefined) opts.boardNum = 0;
        // Provid the basic data
        this.boardNum = opts.boardNum;
        this.size = opts.size;
        this.depth = opts.depth;
        this.shuffles = opts.shuffles;
        this.goal = 0;
        this.start = [];
        this.info = `Tap any cell to flip the ring of cells around it.
          The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
          Can you get all the cells to match?`;
        // Update the data with shuffles or loading
        if (this.boardNum > 0) {
            // shuffle the board
            this._shuffle(opts.shuffles);
        } else if (this.boardNum < 0) {
            // load from the datastore
            this._populate(opts.datastore);
        } else if (opts.data) {
            // load the artwork 
            this._load(opts.data);
        }
    }

    // Helper function showing how far a cell with a click-depth is from a given target,
    // knowing that it wraps around at depth. The default target is 0.
    _clicksAway = (clicks, target) => {
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
    _ticNeighbors = (index, grid) => {
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
    isSolvedBy = (moves) => {
        let grid = this.gridFrom(moves);
        let response = grid.every((cell) => cell === grid[0]);
        return response;
    }

    // Clears this board, then adds clicks until it can be solved in `times` clicks.
    // Saves the [x,y] start moves in this.start
    _shuffle = (distance) => {
        let rng = seedrandom(this.boardNum);
        this.start = [];
        let board = this.depthFrom([]);
        let clicks = 0; // solveDistance is always 0 on an empty board... right?
        // Shuffle until we reach the right number of clicks
        for (var i = 0; i < 1000 && clicks < distance; i++) {
            const index = Math.floor(rng() * board.length);
            // Don't *solve* a cell; only make it deeper
            if (board[index] !== 1) {
                board[index] = (board[index] + this.depth - 1) % this.depth;
                clicks++;
            }
        }
        this.depths = board;
        this.goal = this.depths.reduce((sum, cellDepth) => sum + this._clicksAway(cellDepth), 0);
        console.log(`Shuffled to ${clicks} moves / goal ${this.goal} in ${i} tries`);
        // Turn that into a list of moves (order doesn't matter!)
        this.start = this.depths.flatMap((cellDepth, index) => Array(cellDepth).fill(index));
    }

    _populate = (datastore) => {
        let boardInfo = datastore.getTutorialBoardInfo(this.boardNum);
        this._load(boardInfo.data);
    }

    _load = (data) => {
        let boardInfo = this._unpack(data);
        this.size = boardInfo.size;
        this.depth = boardInfo.depth;
        this.depths = boardInfo.depths;
        this.goal = this.depths.reduce((sum, cellDepth) => sum + this._clicksAway(cellDepth), 0);
        this.start = this.depths.flatMap((cellDepth, index) => Array(cellDepth).fill(index));
    }

    _unpack = (base32) => {
        let bits = new Uint8Array(fromBase32(base32, 'Crockford'));
        const packer = new BitPacker();
        packer.reset(bits);
        // TODO: how much of this should live in the BitPacker? Do I need a RingerPacker?
        let version = packer.unpack(4);
        if (version !== 1) {
            throw new Error(`Unknown save version ${version}`);
        }
        let size = packer.unpack(3) + 5;
        let depth = packer.unpack(2) + 2;
        let depths = [];
        for (let i = 0; i < size * size; i++) {
            const depth = packer.unpack(3, i);
            depths.push(depth);
        }
        return {
            size: size,
            depth: depth,
            depths: depths,
        }
    }

    // Returns displayed board, where all the squares *around* the `moves` have been flipped.
    gridFrom = (moves) => {
        let grid = new Array(this.size * this.size).fill(0);
        for (var index of this.start.concat(moves)) {
            this._ticNeighbors(index, grid);
        }
        return grid;
    }

    // Returns a "hit map" of the board after applying the moves.
    // Indicates how many clicks were made at each cell, looping back to 0 after reaching depth.
    depthFrom = (moves) => {
        let depths = new Array(this.size * this.size).fill(0);
        for (var index of this.start.concat(moves)) {
            depths[index]++;
            depths[index] %= this.depth;
        }
        return depths;
    }

    // Returns a depth grid with the least necessary clicks to make all depths equal.
    bestSolution = (history) => {
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
            let distance = this._clicksAway(clickDepth, bestTarget);
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
