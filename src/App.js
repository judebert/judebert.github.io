import './App.css';
import React from 'react';
import Board from './Board.js';
import BoardPrefs from './BoardPrefs.js';
import Tabs from './Tabs.js';

class App extends React.Component {
    state = {
        size: 9,
        start: [],
        history: [],
        step: 0,
        icons: 'ringer-monochrome',
        depth: 2,
        revealHints: false,
        solved: true,
        next: {
            size: 9,
            icons: 'ringer-monochrome',
            depth: 2,
            shuffles: 0,
        },
    };

    newGame() {
        let start = this.shuffle(this.state.next.shuffles, this.state.next.size, this.state.next.depth);
        let solved = this.solves(start, this.state.next.size, this.state.next.depth);
        this.setState({
            size: this.state.next.size,
            icons: this.state.next.icons,
            depth: this.state.next.depth,
            start: start,
            history: [],
            revealHints: false,
            step: 0,
            solved: solved,
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

    render() {
        let size = this.state.size;
        let depth = this.state.depth;
        let step = this.state.step;
        let start = this.state.start;
        let history = this.state.history.slice(0, step + 1);
        let past = this.orderFrom(history, size, 'forward');
        let future = this.orderFrom(this.state.history.slice(step), size, 'reverse');
        let grid = this.gridFrom(start.concat(history), size, depth);
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
                      <button className="Hints" onClick={() => this.handleHints()}>{revealButtonText}</button>
                    </div>
                  </div>
                </Tabs>
              </header>
              <section className="App-content">
                <Board size={this.state.size}
                  cells={grid}
                  icons={this.state.icons}
                  hints={hints}
                  past={past}
                  future={future}
                  onClick={(x, y) => this.makeMove(x, y)}
                />
              </section>
            </div>
        );
    };

    makeMove(x, y) {
        let step = this.state.step + 1;
        let history = this.state.history.slice(0, step).concat([[x, y]]);
        this.setState({
            history: history,
            step: step,
            solved: this.solves(this.state.start.concat(history), this.state.size, this.state.depth),
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
        let moves;
        if (existing === undefined) {
            moves = [];
        } else {
            moves = existing.slice(); 
        }
        for (var i = 0; i < times; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            moves.push([x, y]);
        }
        return moves;
    }

    solves(moves, size, depth) {
        let grid = this.gridFrom(moves, size, depth);
        return grid.every((cell) => cell === cell[0]);
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
}

export default App;
