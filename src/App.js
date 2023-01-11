import './App.css';
import React from 'react';
import Board from './Board.js';
import BoardPrefs from './BoardPrefs.js';
import Tabs from './Tabs.js';
import ScoreBoard from './ScoreBoard.js';

class App extends React.Component {
    state = {
        size: 9,
        start: [],
        history: [],
        goal: 0,
        step: 0,
        moves: 0,
        elapsed: 0,
        prevTime: 0,
        boardTimer: null,
        icons: 'ringer-monochrome',
        depth: 2,
        revealHints: false,
        solved: true,
        frame: 0,
        timer: null,
        next: {
            size: 9,
            icons: 'ringer-monochrome',
            depth: 2,
            shuffles: 8,
        },
    };

    newGame() {
        if (this.state.timer) { clearInterval(this.state.timer); }
        if (this.state.boardTimer) { clearInterval(this.state.boardTimer); }
        let start = this.shuffle(this.state.next.shuffles, this.state.next.size, this.state.next.depth);
        // Still a *minute* chance that the start moves could solve the board, I guess. 
        let solved = this.solves(start, this.state.next.size, this.state.next.depth);
        let depths = this.depthFrom(start, this.state.next.size, this.state.next.depth);
        let goal = this.clickDistance(depths, this.state.next.depth);
        let boardTimer = null;
        if (!solved) {
            boardTimer = setInterval(() => this.handleSolveTimer(), 500);
        }
        this.setState({
            size: this.state.next.size,
            icons: this.state.next.icons,
            depth: this.state.next.depth,
            start: start,
            history: [],
            goal: goal,
            step: 0,
            moves: 0,
            elapsed: 0,
            prevTime: window.performance.now(),
            boardTimer: boardTimer,
            revealHints: false,
            solved: solved,
            frame: 0,
        });
    }

    handleSolveTimer() {
        let now = window.performance.now();
        let subElapsed = now - this.state.prevTime;
        this.setState({
            elapsed: this.state.elapsed + subElapsed,
            prevTime: now
        });
    }

    handlePrefChange(prefs) {
        this.setState({
            next: prefs,
        });
    }

    handleHints() {
        this.setState({
            revealHints: !this.state.revealHints,
        });
    }

    handleReset() {
        this.setState({
            step: 0,
            moves: 0,
            history: [],
        });
    }

    animate() {
        this.setState({
            frame: this.state.frame + 1,
        });
    }

    render() {
        let size = this.state.size;
        let depth = this.state.depth;
        let step = this.state.step;
        let start = this.state.start;
        let history = this.state.history.slice(0, step + 1);
        let past = this.orderFrom(history, size, 'forward');
        let future = this.orderFrom(this.state.history.slice(step), size, 'reverse');
        let solved = this.state.solved;
        let frame = this.state.frame;
        let grid = solved && step > 0
            ? this.animatedGrid(frame, size, depth)
            : this.gridFrom(start.concat(history), size, depth);
        let hints = this.state.revealHints ? this.depthFrom(start.concat(history), size, depth) : [];
        let revealButtonText = this.state.revealHints ? 'Hide solution' : 'Reveal solution';
        return (
            <div className="App">
              <header className="App-header">
                <h1>Ringer</h1>
                <Tabs name="options">
                  <div label="Info" id="info-tab">
                    Tap any cell to flip the ring of cells around it.
                    The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
                    Can you get all the cells to match?
                  </div>
                  <div label="Options" id="option-tab">
                    <BoardPrefs
                      prefs={this.state.next}
                      onPrefChange={this.handlePrefChange.bind(this)}>
                    </BoardPrefs>
                    <div className="BoardButtons">
                      <button className="NewBoard"
                        onClick={() => this.newGame()}>New Board!</button>
                    </div>
                  </div>
                </Tabs>
                <div className="solving-buttons">
                  <button className="Hints" onClick={() => this.handleHints()}>{revealButtonText}</button>
                  <button className="Reset" onClick={() => this.handleReset()}>Reset</button>
                </div>
                <ScoreBoard
                    moves={this.state.moves}
                    goal={this.state.goal}
                    elapsed={this.state.elapsed}
                    solved={solved}
                />
              </header>
              <section className="App-content">
                <Board size={this.state.size}
                  cells={grid}
                  icons={this.state.icons}
                  hints={solved ? [] : hints}
                  past={solved ? [] : past}
                  future={solved ? [] : future}
                  onClick={(x, y) => this.makeMove(x, y)}
                />
              </section>
            </div>
        );
    };

    makeMove(x, y) {
        let step = this.state.step + 1;
        let moves = this.state.moves + 1;
        let history = this.state.history.slice(0, step).concat([[x, y]]);
        let solved = this.solves(this.state.start.concat(history), this.state.size, this.state.depth)
        let timer = this.state.timer;
        if (solved) {
            clearInterval(this.state.timer);
            clearInterval(this.state.boardTimer);
            timer = setInterval(() => this.animate(), 250);
        }
        this.setState({
            history: history,
            step: step,
            moves: moves,
            solved: solved,
            timer: timer,
            frame: 0,
        });
    }

    // TODO: Pull these into a BoardLogic class or something
    // They're not UI, they're logic.

    // Increment all the cells in a ring around (x, y) *mutating* the given grid
    // assuming the grid is of size and depth
    ring(x, y, grid, size, depth) {
        const neighbors = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1],
        ];
        for (var [dx, dy] of neighbors) {
            const ringX = (x + dx + size) % size;
            const ringY = (y + dy + size) % size;
            const index = ringY * size + ringX;
            grid[index] = (grid[index] + 1) % depth;
        }
    }

    shuffle(times, size, depth, existing) {
        // How many clicks will it take to solve the board right now?
        let board = this.depthFrom(existing || [], size, depth);
        // 0 0 0
        // 0 1 0
        // 0 0 0
        let clicks = this.clickDistance(board, depth);
        // Shuffle until we reach the right number of clicks
        for (var i = 0; i < 1000 && clicks < times; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            let index = y * size + x;
            // Don't *solve* a cell; only make it deeper
            if (board[index] !== 1) {
                board[index] = (board[index] + depth - 1) % depth;
                clicks++;
            }
        }
        console.log(`Shuffled to ${clicks} moves in ${i} tries`);
        // Turn that into a list of moves (order doesn't matter!)
        let moves = board.flatMap((cellDepth, index) =>
            Array(cellDepth).fill([index % size, Math.floor(index / size)]));
        return moves;
    }

    clickDistance(clicks, depth) {
        return clicks.reduce((sum, cellDepth) => sum + ((depth - cellDepth) % depth), 0);
    }

    solves(moves, size, depth) {
        let grid = this.gridFrom(moves, size, depth);
        let response = grid.every((cell) => cell === grid[0]);
        return response;
    }

    gridFrom(moves, size, depth) {
        let grid = new Array(size * size).fill(0);
        for (var [x, y] of moves) {
            this.ring(x, y, grid, size, depth);
        }
        return grid;
    }

    depthFrom(moves, size, depth) {
        let depths = new Array(size * size).fill(0);
        for (var [x, y] of moves) {
            let index = y * size + x;
            depths[index]++;
            depths[index] %= depth;
        }
        return depths;
    }

    orderFrom(moves, size, reverse) {
        let order = new Array(size * size).fill(0);
        for (var i = 0; i < moves.length; i++) {
            let [x, y] = moves[i];
            let index = y * size + x;
            order[index] = reverse === 'reverse' ? i + 1 : moves.length - i; 
        }
        return order;
    }

    animatedGrid(frame, size, depth) {
        // TODO: choose or pass an animation
        let display;
        frame = frame % (size * 4);
        let stage = Math.floor(frame / (size * 2));
        switch (stage) {
            default:
            case 0: 
                // Stage 0: SE fill
                frame = frame % (size * 2);
                display = new Array(size * size).fill(0);
                for (let y = 0; y <= frame && y < size; y++) {
                    for (let x = 0; x <= (frame - y) && x < size; x++) {
                        let index = y * size + x;
                        display[index] = 1;
                    }
                }
                break;
            case 1:
                // Stage 1: SE clear
                frame = frame % (size * 2);
                display = new Array(size * size).fill(1);
                for (let y = 0; y <= frame && y < size; y++) {
                    for (let x = 0; x <= (frame - y) && x < size; x++) {
                        let index = y * size + x;
                        display[index] = 0;
                    }
                }
                break;
        }
        return display;
    }
}

export default App;
