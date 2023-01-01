import './App.css';
import React from 'react';
import Board from './Board.js';
import BoardPrefs from './BoardPrefs.js';

class App extends React.Component {
    state = {
        size: 9,
        start: [],
        history: [],
        step: 0,
        icons: 'ringer-monochrome',
        depth: 2,
        next: {
            size: 9,
            icons: 'ringer-monochrome',
            depth: 2,
            shuffles: 0,
        },
    };

    newGame() {
        this.setState({
            size: this.state.next.size,
            icons: this.state.next.icons,
            depth: this.state.next.depth,
            start: this.shuffle(this.state.next.shuffles, this.state.next.size, this.state.next.depth),
            history: [],
            step: 0,
        });
    }

    handlePrefChange(prefs) {
        this.setState({
            next: prefs,
        });
    }

    render() {
        let size = this.state.size;
        let depth = this.state.depth;
        let step = this.state.step;
        let start = this.state.start;
        let history = this.state.history.slice(0, step + 1);
        let grid = this.gridFrom(start.concat(history), size, depth);
        return (
            <div className="App">
              <header className="App-header">
                <h1>Ringer</h1>
                <BoardPrefs
                    prefs={this.state.next}
                    onPrefChange={this.handlePrefChange.bind(this)}
                />
                <div className="BoardButtons">
                    <button className="NewBoard"
                        onClick={() => this.newGame()}>New Board!</button>
                </div>
              </header>
              <section className="App-content">
                <Board size={this.state.size}
                  cells={grid}
                  icons={this.state.icons}
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
        });
    }

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

    gridFrom(moves, size, depth) {
        let grid = new Array(size * size).fill(0);
        for (var [x, y] of moves) {
            this.ring(x, y, grid, size, depth);
        }
        return grid;
    }
}

export default App;
